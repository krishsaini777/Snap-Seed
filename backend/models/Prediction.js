/**
 * models/Prediction.js — Mongoose schema for storing prediction results.
 *
 * Each document records one image prediction: the uploaded file name, the
 * top predicted disease class and its confidence, and the full top-5 list.
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Name of the file as stored on disk (e.g. "1700000000000-leaf.jpg")
  imageName: {
    type: String,
    required: true,
  },

  // Original file name as uploaded by the user
  originalName: {
    type: String,
    required: true,
  },

  // Top predicted disease class (e.g. "Tomato___Late_blight")
  prediction: {
    type: String,
    required: true,
  },

  // Confidence score of the top prediction (0–1)
  confidence: {
    type: Number,
    required: true,
  },

  // Top-5 predictions with class names and confidence scores
  // Example: [{ class: "Tomato___Late_blight", confidence: 0.92 }, ...]
  allPredictions: {
    type: Array,
    default: [],
  },

  // Timestamp of when the prediction was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);
