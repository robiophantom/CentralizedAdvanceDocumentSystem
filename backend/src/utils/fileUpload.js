/**
 * File Upload Utility
 * Configures multer for handling file uploads with validation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

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
 * Delete a file from the filesystem
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
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
  deleteFile,
  formatFileSize,
  uploadDir,
};
