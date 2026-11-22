# 🌿 AI-Based Crop Disease Detection Using Leaf Images

A web-based machine learning application that classifies crop diseases from photographs of leaves using deep learning. Built as a Minor Project (Semester 7) at BIT Mesra Off-Campus Deoghar.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React.js       │────▶│  Node.js/Express │────▶│  Python ML      │
│  Frontend       │◀────│  Backend         │◀────│  Service        │
│  (Port 3000)    │     │  (Port 5000)     │     │  (Port 8000)    │
└─────────────────┘     └───────┬──────────┘     └─────────────────┘
                                │
                        ┌───────▼──────────┐
                        │    MongoDB       │
                        │  (Pred. History) │
                        └──────────────────┘
```

## Features

- **5 Deep Learning Models** compared: MobileNetV2, ResNet50, InceptionV3, DenseNet121, VGG16
- **38 Disease Classes** across **14 Crop Species** (PlantVillage dataset)
- Drag-and-drop image upload with preview
- Real-time AI classification with confidence scores
- Model comparison dashboard (accuracy, precision, recall, F1-score)
- Prediction history storage
- Responsive, modern green-themed UI

## Quick Start

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- MongoDB (optional — app works without it)
- GPU recommended for training (not required)

### 1. ML Service (Python)

```bash
cd ml-service

# Install dependencies
pip install -r requirements.txt

# Download the PlantVillage dataset
python download_dataset.py

# Train all 5 models (this takes time — uses GPU if available)
python train.py --dataset-path <path_printed_by_download_script>

# Start the ML API service
python app.py
```

The ML service runs on **http://localhost:8000**.

### 2. Backend (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Start the server
npm run dev    # development (with auto-reload)
npm start      # production
```

The backend runs on **http://localhost:5000**.

### 3. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend runs on **http://localhost:3000**.

## Project Structure

```
AI-ML Project/
├── ml-service/                 # Python ML Service
│   ├── download_dataset.py     # Dataset downloader (PlantVillage via kagglehub)
│   ├── train.py                # Multi-model training & comparison script
│   ├── app.py                  # Flask API (prediction endpoint)
│   ├── requirements.txt        # Python dependencies
│   └── models/                 # Trained models, reports, charts
│
├── backend/                    # Node.js/Express Backend
│   ├── server.js               # Main server entry point
│   ├── routes/predict.js       # Prediction & history API routes
│   ├── routes/models.js        # Model comparison & health routes
│   ├── models/Prediction.js    # MongoDB schema
│   ├── middleware/upload.js     # Multer image upload config
│   └── package.json
│
├── frontend/                   # React.js Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Landing page
│   │   │   ├── DetectPage.js       # Upload & prediction
│   │   │   ├── HistoryPage.js      # Prediction history
│   │   │   └── ModelComparePage.js # Model comparison dashboard
│   │   └── components/
│   │       ├── Navbar.js           # Navigation bar
│   │       └── LoadingSpinner.js   # Loading animation
│   └── package.json
│
└── synopsis.pdf                # Project synopsis document
```

## Models Trained

| Model         | Description                                    |
|---------------|------------------------------------------------|
| MobileNetV2   | Lightweight, mobile-friendly (primary model)   |
| ResNet50      | Deep residual network, strong baseline         |
| InceptionV3   | Multi-scale feature extraction                 |
| DenseNet121   | Dense connections, parameter efficient         |
| VGG16         | Classic architecture, benchmark reference      |

All models use transfer learning (pretrained on ImageNet) with identical:
- **Input**: 224×224 RGB, normalized 0–1
- **Augmentation**: Rotation, horizontal flip, zoom, shift
- **Split**: 80% train / 10% validation / 10% test
- **Training**: 30 epochs, batch size 32, Adam optimizer (lr=0.001)
- **Callbacks**: EarlyStopping + ReduceLROnPlateau

## API Endpoints

| Method | Endpoint                   | Description                      |
|--------|----------------------------|----------------------------------|
| POST   | `/api/predict`             | Upload leaf image for prediction |
| GET    | `/api/predict/history`     | Get last 20 predictions          |
| GET    | `/api/predict/history/:id` | Get prediction by ID             |
| GET    | `/api/models`              | Get model comparison data        |
| GET    | `/api/health`              | Health check (all services)      |

## Tech Stack

- **Frontend**: React.js, Chart.js, React Router, React Dropzone
- **Backend**: Node.js, Express.js, Mongoose, Multer, Axios
- **ML Service**: Python, TensorFlow/Keras, Flask, scikit-learn
- **Database**: MongoDB
- **Dataset**: PlantVillage (54,300 images, 38 classes, 14 crops)

## Team

| Name              | Roll No.         |
|-------------------|------------------|
| Jitender          | BTECH/60033/23   |
| Krish Saini       | BTECH/60031/23   |
| Harsh Pratap Singh| BTECH/60035/23   |
| Roshan Raj        | BTECH/60005/23   |

**BIT Mesra Off-Campus Deoghar** | Department of Computer Science & Engineering | Minor Project MO/26 | Semester 7

