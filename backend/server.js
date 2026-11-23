/**
 * server.js — Main entry point for the Crop Disease Detection Backend
 *
 * Sets up Express with middleware, connects to MongoDB (gracefully handling
 * unavailability), mounts API routes, and starts the HTTP server.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Enable CORS for all origins (frontend will typically run on a different port)
app.use(cors());

// HTTP request logging
app.use(morgan('dev'));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files (useful for previews)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------------
// Ensure the uploads directory exists
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads/ directory');
}

// ---------------------------------------------------------------------------
// MongoDB Connection
// ---------------------------------------------------------------------------

// Track connection state so routes can skip DB operations when unavailable
let isMongoConnected = false;

const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/crop_disease_db';
    await mongoose.connect(mongoUri, {
      // Mongoose 8 uses the new URL parser and unified topology by default
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    isMongoConnected = false;
    console.warn('⚠️  MongoDB connection failed — history storage disabled.');
    console.warn(`   Reason: ${err.message}`);
    console.warn('   The API will continue to work without persistence.\n');
  }
};

// Listen for runtime disconnection / reconnection events
mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('⚠️  MongoDB disconnected — history storage paused.');
});

mongoose.connection.on('reconnected', () => {
  isMongoConnected = true;
  console.log('✅ MongoDB reconnected');
});

// Expose connection state so routes can import it
app.set('isMongoConnected', () => isMongoConnected);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const predictRoutes = require('./routes/predict');
const modelRoutes = require('./routes/models');

app.use('/api/predict', predictRoutes);
app.use('/api', modelRoutes);

// Root health-check endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Crop Disease Detection API is running',
    version: '1.0.0',
    endpoints: {
      predict: 'POST /api/predict',
      history: 'GET  /api/predict/history',
      models: 'GET  /api/models',
      health: 'GET  /api/health',
    },
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Unhandled error:', err.message);

  // Multer-specific errors (file too large, wrong type, etc.)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected field name in upload.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

const startServer = async () => {
  // Attempt MongoDB connection (non-blocking — server starts either way)
  await connectToMongoDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server listening on http://localhost:${PORT}`);
    console.log(`   MongoDB : ${isMongoConnected ? 'connected ✅' : 'unavailable ⚠️'}`);
    console.log(`   ML Svc  : ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}\n`);
  });
};

startServer();
