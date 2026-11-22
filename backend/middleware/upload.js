/**
 * middleware/upload.js — Multer configuration for image uploads.
 *
 * - Storage  : disk, in the `uploads/` directory
 * - Naming   : timestamp prefix to avoid collisions
 * - Filter   : only JPEG and PNG images accepted
 * - Size cap : 10 MB per file
 */

const multer = require('multer');
const path = require('path');

// ---------------------------------------------------------------------------
// Storage Configuration
// ---------------------------------------------------------------------------

const storage = multer.diskStorage({
  // Save uploaded files to the `uploads/` directory at the project root
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },

  // Prefix the original name with a timestamp to prevent overwrites
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ---------------------------------------------------------------------------
// File Filter — accept only JPEG and PNG images
// ---------------------------------------------------------------------------

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error('Invalid file type. Only JPEG and PNG images are allowed.'),
      false,
    );
  }
};

// ---------------------------------------------------------------------------
// Export the configured multer instance
// ---------------------------------------------------------------------------

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;
