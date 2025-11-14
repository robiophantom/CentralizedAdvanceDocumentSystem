/**
 * File Upload Utility
 * Configures multer for handling file uploads with validation
 * Uses memory storage to upload directly to Supabase Storage
 */

const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Use memory storage since files will be uploaded directly to Supabase
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Get allowed file types from env or use defaults
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',') 
    : ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
  
  const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // Default 10MB
  },
  fileFilter: fileFilter,
});

/**
 * Generate unique filename for storage
 * @param {string} originalName - Original file name
 * @returns {string} Unique filename
 */
const generateFileName = (originalName) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  return nameWithoutExt + '-' + uniqueSuffix + ext;
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

module.exports = {
  upload,
  generateFileName,
  formatFileSize,
};
