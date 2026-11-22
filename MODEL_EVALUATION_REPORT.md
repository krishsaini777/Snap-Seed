# 🌿 Model Evaluation & Architecture Comparison Report
## AI-Based Crop Disease Detection Using Leaf Images
**BIT Mesra Off-Campus Deoghar** | Department of Computer Science & Engineering  
**Minor Project MO/26 (Semester 7)** | Group 9

---

## 1. Executive Summary

In response to the requirement to **train and compare multiple candidate deep learning models**, we conducted a comparative benchmark across **five distinct convolutional neural network (CNN) architectures** using the **PlantVillage dataset** (54,300 leaf images across 38 categories and 14 crop species).

The five architectures evaluated are:
1. **MobileNetV2** (Primary model specified in the synopsis)
2. **DenseNet121** (Dense feature-reuse architecture)
3. **ResNet50** (Residual skip-connection baseline)
4. **InceptionV3** (Multi-scale parallel convolution architecture)
5. **VGG16** (Classical uniform 3x3 deep convolutional baseline)

All models were evaluated under standardized experimental conditions (identical dataset split, image dimensions, normalization, data augmentation, loss functions, and optimization settings).

---

## 2. Experimental Setup & Hyperparameters

| Hyperparameter / Setting | Value | Justification / Synopsis Alignment |
|---|---|---|
| **Dataset** | PlantVillage | 54,300 images, 38 classes, 14 crops |
| **Train / Val / Test Split** | 80% / 10% / 10% | Strict held-out test evaluation |
| **Input Resolution** | 224 x 224 x 3 RGB | Matches standard vision backbone specifications |
| **Pixel Normalization** | [0, 1] range | Standard rescaling (`img / 255.0`) |
| **Data Augmentation** | Rotation (+/- 20 deg), Horizontal Flip, Zoom (+/- 15%), Shift (+/- 10%) | Reduces overfitting, simulates outdoor variations |
| **Optimization Algorithm** | Adam (beta1=0.9, beta2=0.999) | Stable adaptive learning rate |
| **Initial Learning Rate** | 0.001 | Controlled by `ReduceLROnPlateau` (factor=0.2, patience=3) |
| **Batch Size** | 32 | Balanced gradient estimation and memory constraint |
| **Maximum Epochs** | 30 | Monitored by `EarlyStopping` (patience=5, restore best weights) |
| **Head Architecture** | GlobalAvgPool2D -> Dense(256, ReLU) -> Dropout(0.3) -> Dense(38, Softmax) | Identical transfer learning classification head |

---

## 3. Comprehensive Performance Benchmark

The following table summarizes the quantitative evaluation metrics computed on the test partition:

| Model Architecture | Accuracy (%) | Precision (Macro %) | Recall (Macro %) | F1-Score (Macro %) | Total Parameters | Model Size (MB) | GPU Train Time (s) | CPU Inference Latency (ms) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 🏆 **DenseNet121** | **98.37%** | **98.12%** | **98.25%** | **98.18%** | 7.5M | 33.2 MB | 2,640 s (~44m) | 48 ms |
| 🥈 **ResNet50** | **97.15%** | **96.80%** | **96.94%** | **96.87%** | 24.1M | 98.4 MB | 2,980 s (~50m) | 62 ms |
| 🥉 **MobileNetV2** *(Synopsis)* | **96.48%** | **95.92%** | **96.15%** | **96.03%** | **3.5M** | **14.5 MB** | **1,421 s (~24m)** | **22 ms** |
| ⚡ **InceptionV3** | **95.72%** | **95.10%** | **95.40%** | **95.25%** | 22.4M | 92.1 MB | 2,316 s (~38m) | 54 ms |
| 📦 **VGG16** | **94.05%** | **93.48%** | **93.72%** | **93.60%** | 134.8M | 528.4 MB | 4,125 s (~69m) | 145 ms |

---

## 4. In-Depth Analysis of Differences in Accuracy & Score

### 4.1 DenseNet121 vs. MobileNetV2
- **DenseNet121 achieved the highest accuracy (98.37%)** and the highest macro F1-score (98.18%).
- **Why it scored higher:** In DenseNet, each layer connects to every other layer in a feed-forward fashion. This direct feature reuse allows the model to preserve both low-level features (fine discoloration lines, bacterial margins, tiny pustules) and high-level semantic representations (leaf shape, overall necrosis).
- **Trade-off:** DenseNet121 has 7.5M parameters and requires twice the training time and double the CPU inference time (48 ms vs 22 ms) compared to MobileNetV2.

### 4.2 Why MobileNetV2 remains the Preferred Choice for Real-World Deployment
- MobileNetV2 attained **96.48% accuracy**, trailing DenseNet121 by only **1.89 percentage points**, while offering massive operational advantages:
  - **6.8x smaller model size** (14.5 MB vs 98.4 MB for ResNet50 and 528 MB for VGG16).
  - **2.2x faster CPU inference** (22 ms per frame), enabling near real-time edge processing on low-cost smartphones or field web browsers.
  - **46% faster training cycle** (1,421 seconds vs 2,640 seconds).
- The use of **inverted residual blocks with linear bottlenecks** efficiently prevents non-linear activations from destroying discriminative information in low-dimensional manifold representations.

### 4.3 ResNet50 Performance Characteristics
- **ResNet50 reached 97.15% accuracy** and 96.87% F1-score.
- Its identity shortcut connections eliminate vanishing gradients in deep layers, performing exceptionally well on heavily necrotic leaves with overlapping discoloration (e.g., `Tomato___Late_blight` vs `Tomato___Early_blight`).
- **Limitation:** At 98.4 MB, the model is relatively heavy for edge client download, although well-suited for server-side processing.

### 4.4 InceptionV3 Performance Characteristics
- **InceptionV3 attained 95.72% accuracy.**
- By using factorized convolutions and parallel 1x1, 3x3, 5x5 branches, Inception excels at multi-scale symptom recognition. It accurately recognizes both localized small symptoms (`Tomato___Septoria_leaf_spot`) and large leaf-wide blights.
- Its slightly lower accuracy compared to DenseNet and ResNet stems from higher parameter fragmentation and sensitivity to controlled laboratory backgrounds.

### 4.5 VGG16 Limitations
- **VGG16 achieved the lowest accuracy (94.05%)** despite having the largest parameter count (134.8M).
- It produces a **528.4 MB file**, takes over an hour to train, and has a high inference latency (145 ms).
- Without residual or dense connections, deep layers struggle with feature vanishing, making it suboptimal for modern lightweight leaf pathology applications.

---

## 5. Architectural Trade-Off Matrix

| Selection Criteria | Best Choice | Rationale |
|---|---|---|
| **Highest Raw Accuracy** | **DenseNet121** (98.37%) | Superior feature reuse for fine-grained lesions |
| **Best Balance for Web & Mobile** | **MobileNetV2** (96.48%) | Extremely lightweight (14.5 MB), 22 ms inference, 96.5% accuracy |
| **Best Server-Side Baseline** | **ResNet50** (97.15%) | Robust residual depth, fast convergence |
| **Lowest Computational Footprint** | **MobileNetV2** | Only 3.5M parameters |

