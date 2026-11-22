# Crop Disease Detection — Backend API

Node.js/Express REST API that accepts crop leaf images, forwards them to a Python ML micro-service for disease prediction, and persists results in MongoDB.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (edit as needed)
cp .env.example .env   # or just use the provided .env

# 3. Start in development mode (auto-restart on changes)
npm run dev

# 4. Or start in production mode
npm start
```

The server starts on **http://localhost:5000** by default.

## Prerequisites

| Dependency | Required? | Notes |
|------------|-----------|-------|
| Node.js ≥ 18 | Yes | Runtime |
| MongoDB | Optional | History storage — the API works without it |
| Python ML Service | Yes (for predictions) | Expected at `http://localhost:8000` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Upload an image for disease prediction |
| `GET` | `/api/predict/history` | Get the last 20 predictions |
| `GET` | `/api/predict/history/:id` | Get a single prediction by ID |
| `GET` | `/api/models` | Get model comparison data from ML service |
| `GET` | `/api/health` | Health check (backend, DB, ML service) |

### Example — Upload an image

```bash
curl -X POST http://localhost:5000/api/predict \
  -F "image=@./leaf_sample.jpg"
```

## Project Structure

```
backend/
├── server.js              # Entry point
├── models/
│   └── Prediction.js      # Mongoose schema
├── routes/
│   ├── predict.js         # Prediction & history routes
│   └── models.js          # Model comparison & health routes
├── middleware/
│   └── upload.js          # Multer image-upload config
├── uploads/               # Uploaded images (git-ignored)
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server listen port |
| `MONGODB_URI` | `mongodb://localhost:27017/crop_disease_db` | MongoDB connection string |
| `ML_SERVICE_URL` | `http://localhost:8000` | Python ML prediction service URL |
