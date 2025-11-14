/**
 * Text Extraction Utility
 * Extracts text content from various document formats for indexing
 * Updated to work with file buffers instead of file paths
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF buffer
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text from DOCX buffer
 * @param {Buffer} fileBuffer - DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromDOCX = async (fileBuffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

/**
 * Extract text from TXT buffer
 * @param {Buffer} fileBuffer - TXT file buffer
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromTXT = async (fileBuffer) => {
  try {
    return fileBuffer.toString('utf-8');
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error('Failed to read text file');
  }
};

/**
 * Main function to extract text based on file type
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileType - File extension (without dot)
 * @returns {Promise<string|null>} Extracted text or null if not supported
 */
const extractText = async (fileBuffer, fileType) => {
  const ext = fileType.toLowerCase();
  
  try {
    switch (ext) {
      case 'pdf':
        return await extractTextFromPDF(fileBuffer);
      
      case 'docx':
      case 'doc':
        return await extractTextFromDOCX(fileBuffer);
      
      case 'txt':
        return await extractTextFromTXT(fileBuffer);
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        // Image files - return null (OCR could be added in future)
        console.log('Image file detected - text extraction not supported yet');
        return null;
      
      default:
        console.log(`Text extraction not supported for file type: ${ext}`);
        return null;
    }
  } catch (error) {
    console.error(`Error extracting text from ${ext} file:`, error);
    // Return null instead of throwing to allow document upload even if extraction fails
    return null;
  }
};

/**
 * Clean and normalize extracted text
 * Removes excessive whitespace and special characters
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim();
};

module.exports = {
  extractText,
  extractTextFromPDF,
  extractTextFromDOCX,
  extractTextFromTXT,
  cleanText,
};
