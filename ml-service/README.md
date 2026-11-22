# 🌱 ML Service — AI-Based Crop Disease Detection

A TensorFlow / Keras pipeline that trains **five** transfer-learning models on the **PlantVillage** dataset (38 classes) and serves predictions through a Flask REST API.

## Models Compared

| # | Architecture | Pretrained On |
|---|-------------|---------------|
| 1 | MobileNetV2 | ImageNet |
| 2 | ResNet50 | ImageNet |
| 3 | InceptionV3 | ImageNet |
| 4 | DenseNet121 | ImageNet |
| 5 | VGG16 | ImageNet |

---

## Quick Start

### 1. Install dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Download the dataset

```bash
python download_dataset.py
```

The script prints the path where images are stored. Note the **colour images** path (e.g. `.../plantvillage dataset/color`).

### 3. Train all models

```bash
python train.py --dataset-path "<path>/plantvillage dataset/color"
```

Training artefacts are saved to the `models/` directory:

| File | Description |
|------|-------------|
| `*_plant_disease.h5` | Saved Keras model |
| `*_training_history.png` | Accuracy & loss curves |
| `*_confusion_matrix.png` | Confusion matrix heatmap |
| `*_classification_report.txt` | Per-class precision / recall / F1 |
| `model_comparison.json` | Side-by-side metrics for all models |
| `class_names.json` | Ordered list of the 38 class labels |

### 4. Start the API server

```bash
python app.py
```

The server starts on **http://localhost:8000**.

---

## API Endpoints

### `GET /health`

Returns `{ "status": "ok" }`.

### `GET /models`

Returns the full model comparison JSON.

### `POST /predict`

Upload a leaf image (field name: `file`, formats: jpg / jpeg / png).

```bash
curl -X POST -F "file=@leaf.jpg" http://localhost:8000/predict
```

**Response:**

```json
{
  "success": true,
  "prediction": "Tomato___Late_blight",
  "confidence": 95.5,
  "all_predictions": [
    { "class": "Tomato___Late_blight", "confidence": 95.5 },
    { "class": "Tomato___Early_blight", "confidence": 2.3 },
    { "class": "Tomato___Septoria_leaf_spot", "confidence": 1.1 },
    { "class": "Tomato___healthy", "confidence": 0.6 },
    { "class": "Potato___Late_blight", "confidence": 0.3 }
  ]
}
```

---

## Project Structure

```
ml-service/
├── app.py                 # Flask API server
├── download_dataset.py    # Dataset downloader (Kaggle)
├── train.py               # Multi-model training & evaluation
├── requirements.txt       # Python dependencies
├── README.md              # This file
└── models/                # Generated after training
    ├── class_names.json
    ├── model_comparison.json
    └── ...                # .h5 models, plots, reports
```

---

## Requirements

- Python 3.9+
- TensorFlow 2.12+
- A Kaggle account (for dataset download via kagglehub)
- GPU recommended for training (CPU works but is slow)
