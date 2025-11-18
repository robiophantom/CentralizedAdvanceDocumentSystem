/**
 * Supabase Storage Utility
 * Handles file uploads and deletions using Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
// Extract Supabase URL from DATABASE_URL if SUPABASE_URL not provided
let supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl && process.env.DATABASE_URL) {
  // Extract from DATABASE_URL: postgresql://...@db.xxxxx.supabase.co:5432/postgres
  const match = process.env.DATABASE_URL.match(/@db\.([^.]+)\.supabase\.co/);
  if (match) {
    supabaseUrl = `https://${match[1]}.supabase.co`;
  }
}
// Fallback to default if still not set
if (!supabaseUrl) {
  supabaseUrl = 'https://alvjsukkzwckkdiqbfhz.supabase.co';
}

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

let supabase = null;

if (supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with path
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{path: string, url: string}>} File path and public URL
 */
const uploadFile = async (fileBuffer, fileName, mimeType) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file to Supabase Storage:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path to file in storage bucket
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteFile = async (filePath) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized.');
  }

  try {
    // Extract just the filename from path if it includes bucket path
    const fileName = filePath.includes('/') ? filePath.split('/').pop() : filePath;

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return false;
    }

    console.log(`File deleted from Supabase Storage: ${fileName}`);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get public URL for a file
 * @param {string} filePath - Path to file in storage bucket
 * @returns {string} Public URL
 */
const getPublicUrl = (filePath) => {
  if (!supabase) {
    return null;
  }

  const fileName = filePath.includes('/') ? filePath.split('/').pop() : filePath;
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Download a file from Supabase Storage
 * @param {string} filePath - Path to file in storage bucket
 * @param {string} mimeType - Optional MIME type from database
 * @returns {Promise<{data: Buffer, mimeType: string, fileName: string}>} File data, MIME type, and filename
 */
const downloadFile = async (filePath, mimeType = null) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized.');
  }

  try {
    // Handle file path - could be just filename or full path
    // Remove bucket name if present
    let fileName = filePath;
    if (fileName.includes(`${bucketName}/`)) {
      fileName = fileName.replace(`${bucketName}/`, '');
    }
    // If it's a full path, get just the filename (last part after /)
    if (fileName.includes('/')) {
      fileName = fileName.split('/').pop();
    }

    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      throw error;
    }

    // Use provided MIME type or try to determine from file extension
    let finalMimeType = mimeType || 'application/octet-stream';
    
    if (!finalMimeType || finalMimeType === 'application/octet-stream') {
      // Try to determine MIME type from file extension
      const ext = fileName.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'zip': 'application/zip',
      };
      finalMimeType = mimeTypes[ext] || 'application/octet-stream';
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      data: buffer,
      mimeType: finalMimeType,
      fileName: fileName.split('/').pop(),
    };
  } catch (error) {
    console.error('Error downloading file from Supabase Storage:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getPublicUrl,
  downloadFile,
};

