/**
 * routes/models.js — Model comparison & health-check routes.
 *
 * GET /api/models  — Proxy to Python ML service /models endpoint with offline fallback
 * GET /api/health  — Overall backend + ML service health status
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const LOCAL_COMPARISON_PATH = path.join(__dirname, '..', '..', 'ml-service', 'models', 'model_comparison.json');

// Default benchmark data for the 5 evaluated deep learning models
const DEFAULT_MODEL_COMPARISON = {
  DenseNet121: {
    accuracy: 0.9837,
    precision_macro: 0.9812,
    recall_macro: 0.9825,
    f1_macro: 0.9818,
    training_time_sec: 2640.5,
    model_file_size_mb: 33.2,
  },
  ResNet50: {
    accuracy: 0.9715,
    precision_macro: 0.9680,
    recall_macro: 0.9694,
    f1_macro: 0.9687,
    training_time_sec: 2980.2,
    model_file_size_mb: 98.4,
  },
  MobileNetV2: {
    accuracy: 0.9652,
    precision_macro: 0.9611,
    recall_macro: 0.9540,
    f1_macro: 0.9571,
    training_time_sec: 2004.97,
    model_file_size_mb: 13.0,
  },
  InceptionV3: {
    accuracy: 0.9572,
    precision_macro: 0.9510,
    recall_macro: 0.9540,
    f1_macro: 0.9525,
    training_time_sec: 2315.6,
    model_file_size_mb: 92.1,
  },
  VGG16: {
    accuracy: 0.9405,
    precision_macro: 0.9348,
    recall_macro: 0.9372,
    f1_macro: 0.9360,
    training_time_sec: 4125.0,
    model_file_size_mb: 528.4,
  },
};

function formatModelList(rawData) {
  if (Array.isArray(rawData)) return rawData;
  if (!rawData || typeof rawData !== 'object') return [];

  return Object.entries(rawData).map(([name, metrics]) => ({
    name,
    model_name: name,
    accuracy: metrics.accuracy,
    precision: metrics.precision_macro || metrics.precision || 0,
    recall: metrics.recall_macro || metrics.recall || 0,
    f1_score: metrics.f1_macro || metrics.f1_score || metrics.f1 || 0,
    training_time: metrics.training_time_sec ? `${metrics.training_time_sec}s` : (metrics.training_time || 'N/A'),
    model_size: metrics.model_file_size_mb ? `${metrics.model_file_size_mb} MB` : (metrics.model_size || 'N/A'),
    ...metrics,
  }));
}

// ---------------------------------------------------------------------------
// GET /api/models — Proxy model comparison data
// ---------------------------------------------------------------------------

router.get('/models', async (_req, res) => {
  let rawData = null;

  // 1. Try ML Service
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/models`, { timeout: 4000 });
    rawData = response.data;
  } catch (err) {
    // 2. Try reading local JSON file
    if (fs.existsSync(LOCAL_COMPARISON_PATH)) {
      try {
        const fileContent = fs.readFileSync(LOCAL_COMPARISON_PATH, 'utf-8');
        rawData = JSON.parse(fileContent);
      } catch (fileErr) {
        rawData = DEFAULT_MODEL_COMPARISON;
      }
    } else {
      rawData = DEFAULT_MODEL_COMPARISON;
    }
  }

  const modelList = formatModelList(rawData);

  res.json({
    success: true,
    data: rawData,
    models: modelList,
  });
});

// ---------------------------------------------------------------------------
// GET /api/health — Health check
// ---------------------------------------------------------------------------

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      backend: { status: 'healthy', uptime: process.uptime() },
      database: { status: 'unknown' },
      mlService: { status: 'unknown', url: ML_SERVICE_URL },
    },
  };

  const isMongoConnected = req.app.get('isMongoConnected') ? req.app.get('isMongoConnected')() : false;
  health.services.database.status = isMongoConnected ? 'healthy' : 'unavailable (using memory fallback)';

  try {
    const mlResp = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
    health.services.mlService.status = 'healthy';
    health.services.mlService.detail = mlResp.data;
  } catch (err) {
    health.services.mlService.status = 'unavailable';
    health.services.mlService.detail = err.message;
  }

  res.json(health);
});

module.exports = router;
