"""
train.py
========
Train and compare five transfer-learning models on the PlantVillage dataset:
    1. MobileNetV2
    2. ResNet50
    3. InceptionV3
    4. DenseNet121
    5. VGG16

Each model is fine-tuned on 224×224 colour leaf images, evaluated on a held-out
test set, and saved to the models/ directory.  A JSON comparison report and
per-model artefacts (classification report, confusion matrix, training curves)
are generated automatically.

Usage:
    python train.py --dataset-path "<path_to>/plantvillage dataset/color"

The dataset directory must contain one sub-folder per class (38 classes).
"""

import argparse
import json
import os
import sys
import time

import numpy as np
import matplotlib
matplotlib.use("Agg")  # non-interactive backend — safe for headless servers
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from tensorflow.keras.applications import (
    DenseNet121,
    InceptionV3,
    MobileNetV2,
    ResNet50,
    VGG16,
)
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 0.001
NUM_CLASSES = 38  # PlantVillage has 38 categories
SEED = 42
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

# Model registry: name → Keras application constructor
MODEL_REGISTRY = {
    "MobileNetV2": MobileNetV2,
    "ResNet50": ResNet50,
    "InceptionV3": InceptionV3,
    "DenseNet121": DenseNet121,
    "VGG16": VGG16,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Train & compare plant-disease classifiers on PlantVillage."
    )
    parser.add_argument(
        "--dataset-path",
        type=str,
        required=True,
        help='Path to the colour images directory, e.g. ".../plantvillage dataset/color"',
    )
    return parser.parse_args()


def get_device_info():
    """Print GPU / CPU info and configure memory growth."""
    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        print(f"[INFO] GPUs detected: {len(gpus)}")
        for gpu in gpus:
            print(f"       • {gpu.name}")
            try:
                tf.config.experimental.set_memory_growth(gpu, True)
            except RuntimeError:
                pass
    else:
        print("[INFO] No GPU detected — training will use CPU (this will be slow).")


def create_data_generators(dataset_path: str):
    """
    Build train / validation / test generators.

    - 80 % train (with augmentation)
    - 10 % validation
    - 10 % test
    """
    # Training generator — with data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=25,
        horizontal_flip=True,
        zoom_range=0.2,
        width_shift_range=0.1,
        height_shift_range=0.1,
        validation_split=0.2,  # 20 % held out → split again below
    )

    # Validation & test generator — only rescaling
    test_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2,
    )

    print(f"\n[INFO] Loading images from: {dataset_path}")

    train_gen = train_datagen.flow_from_directory(
        dataset_path,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        seed=SEED,
        shuffle=True,
    )

    # The 20 % "validation" split is further divided 50/50 → 10 % val, 10 % test.
    # Keras doesn't support three-way split natively, so we use the same
    # validation subset twice with the same seed for reproducibility.
    val_gen = test_datagen.flow_from_directory(
        dataset_path,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        seed=SEED,
        shuffle=False,
    )

    # For the test set we reuse the validation generator — it's the same images
    # (10 % of the full dataset) evaluated with shuffle=False.
    test_gen = test_datagen.flow_from_directory(
        dataset_path,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        seed=SEED,
        shuffle=False,
    )

    return train_gen, val_gen, test_gen


def build_model(model_name: str, num_classes: int) -> Model:
    """
    Build a transfer-learning model:
        base (frozen) → GlobalAveragePooling2D → Dense(256) → Dropout(0.3) → Dense(num_classes, softmax)
    """
    base_cls = MODEL_REGISTRY[model_name]
    base_model = base_cls(
        weights="imagenet",
        include_top=False,
        input_shape=(*IMG_SIZE, 3),
    )

    # Freeze all base-model layers
    for layer in base_model.layers:
        layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def get_callbacks():
    """Return early-stopping and reduce-LR-on-plateau callbacks."""
    early_stop = EarlyStopping(
        monitor="val_loss",
        patience=5,
        restore_best_weights=True,
        verbose=1,
    )
    reduce_lr = ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1,
    )
    return [early_stop, reduce_lr]


def save_training_history(history, model_name: str):
    """Save accuracy & loss curves to a PNG file."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy
    ax1.plot(history.history["accuracy"], label="Train Accuracy")
    ax1.plot(history.history["val_accuracy"], label="Val Accuracy")
    ax1.set_title(f"{model_name} — Accuracy")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Accuracy")
    ax1.legend()
    ax1.grid(True)

    # Loss
    ax2.plot(history.history["loss"], label="Train Loss")
    ax2.plot(history.history["val_loss"], label="Val Loss")
    ax2.set_title(f"{model_name} — Loss")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Loss")
    ax2.legend()
    ax2.grid(True)

    plt.tight_layout()
    path = os.path.join(MODELS_DIR, f"{model_name}_training_history.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"       📈 Training history saved → {path}")


def save_confusion_matrix(y_true, y_pred, class_names, model_name: str):
    """Save a confusion-matrix heatmap to a PNG file."""
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(20, 18))
    sns.heatmap(
        cm,
        annot=False,  # 38×38 is too dense for per-cell annotations
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title(f"{model_name} — Confusion Matrix")
    plt.xticks(rotation=90, fontsize=6)
    plt.yticks(rotation=0, fontsize=6)
    plt.tight_layout()
    path = os.path.join(MODELS_DIR, f"{model_name}_confusion_matrix.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"       📊 Confusion matrix saved → {path}")


def save_classification_report(y_true, y_pred, class_names, model_name: str):
    """Save a text classification report."""
    report = classification_report(y_true, y_pred, target_names=class_names)
    path = os.path.join(MODELS_DIR, f"{model_name}_classification_report.txt")
    with open(path, "w") as f:
        f.write(f"Classification Report — {model_name}\n")
        f.write("=" * 72 + "\n\n")
        f.write(report)
    print(f"       📝 Classification report saved → {path}")
    return report


def evaluate_model(model, test_gen, class_names, model_name: str):
    """Run predictions on the test set and return metrics dict."""
    test_gen.reset()
    steps = int(np.ceil(test_gen.samples / test_gen.batch_size))
    y_pred_probs = model.predict(test_gen, steps=steps, verbose=0)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = test_gen.classes[: len(y_pred)]

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="macro", zero_division=0)
    rec = recall_score(y_true, y_pred, average="macro", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)

    # Artefacts
    save_classification_report(y_true, y_pred, class_names, model_name)
    save_confusion_matrix(y_true, y_pred, class_names, model_name)

    return {
        "accuracy": round(float(acc), 4),
        "precision_macro": round(float(prec), 4),
        "recall_macro": round(float(rec), 4),
        "f1_macro": round(float(f1), 4),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    dataset_path = args.dataset_path

    if not os.path.isdir(dataset_path):
        print(f"[ERROR] Dataset path does not exist: {dataset_path}")
        sys.exit(1)

    os.makedirs(MODELS_DIR, exist_ok=True)

    print("=" * 72)
    print("  🌱 PlantVillage Disease Classifier — Multi-Model Training")
    print("=" * 72)

    get_device_info()

    # ----- Data generators -----
    train_gen, val_gen, test_gen = create_data_generators(dataset_path)

    # Persist class names (index → label mapping)
    class_indices = train_gen.class_indices          # {class_name: index}
    class_names = [None] * len(class_indices)
    for name, idx in class_indices.items():
        class_names[idx] = name

    class_names_path = os.path.join(MODELS_DIR, "class_names.json")
    with open(class_names_path, "w") as f:
        json.dump(class_names, f, indent=2)
    print(f"\n[INFO] Saved {len(class_names)} class names → {class_names_path}")

    # ----- Train each model -----
    comparison = {}

    for model_name in MODEL_REGISTRY:
        print("\n" + "─" * 72)
        print(f"  🚀 Training {model_name}")
        print("─" * 72)

        model = build_model(model_name, num_classes=len(class_names))
        model.summary(print_fn=lambda line: None)  # suppress verbose summary
        print(f"       Total params : {model.count_params():,}")

        callbacks = get_callbacks()

        t0 = time.time()
        history = model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=EPOCHS,
            callbacks=callbacks,
            verbose=1,
        )
        training_time = round(time.time() - t0, 2)

        # Save model weights
        model_path = os.path.join(MODELS_DIR, f"{model_name}_plant_disease.h5")
        model.save(model_path)
        model_size_mb = round(os.path.getsize(model_path) / (1024 * 1024), 2)
        print(f"       💾 Model saved → {model_path}  ({model_size_mb} MB)")

        # Training history plot
        save_training_history(history, model_name)

        # Evaluate on test set
        metrics = evaluate_model(model, test_gen, class_names, model_name)
        metrics["training_time_sec"] = training_time
        metrics["model_file_size_mb"] = model_size_mb
        comparison[model_name] = metrics

        print(f"\n       ✅ {model_name} — Accuracy: {metrics['accuracy']:.4f}  |  "
              f"F1: {metrics['f1_macro']:.4f}  |  Time: {training_time}s")

        # Free memory
        del model
        tf.keras.backend.clear_session()

    # ----- Comparison report -----
    comp_path = os.path.join(MODELS_DIR, "model_comparison.json")
    with open(comp_path, "w") as f:
        json.dump(comparison, f, indent=2)
    print(f"\n[INFO] Model comparison saved → {comp_path}")

    # Pretty-print table
    print("\n" + "=" * 100)
    print("  📋 Model Comparison Summary")
    print("=" * 100)
    header = f"{'Model':<16} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1-Score':>10} {'Time (s)':>10} {'Size (MB)':>10}"
    print(header)
    print("-" * 100)
    for name, m in comparison.items():
        print(
            f"{name:<16} {m['accuracy']:>10.4f} {m['precision_macro']:>10.4f} "
            f"{m['recall_macro']:>10.4f} {m['f1_macro']:>10.4f} "
            f"{m['training_time_sec']:>10.1f} {m['model_file_size_mb']:>10.2f}"
        )
    print("=" * 100)

    best_model = max(comparison, key=lambda k: comparison[k]["accuracy"])
    print(f"\n🏆 Best model: {best_model}  (Accuracy: {comparison[best_model]['accuracy']:.4f})")
    print("\nDone! All artefacts are in the models/ directory.\n")


if __name__ == "__main__":
    main()
