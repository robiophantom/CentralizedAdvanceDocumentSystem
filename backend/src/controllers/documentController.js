/**
 * Document Controller
 * Handles document upload, retrieval, search, and management
 */

const db = require('../config/database');
const { generateFileName } = require('../utils/fileUpload');
const { uploadFile, deleteFile: deleteFromStorage, downloadFile } = require('../utils/supabaseStorage');
const { extractText, cleanText } = require('../utils/textExtraction');
const { logActivity } = require('../utils/activityLogger');
const path = require('path');

/**
 * Upload a new document
 * POST /api/documents/upload
 * Allowed roles: faculty, admin
 */
const uploadDocument = async (req, res) => {
  // Check if user has permission to upload (faculty or admin)
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Permission denied. Only faculty and admin can upload documents.',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { title, description, keywords } = req.body;
  const file = req.file;

  try {
    // Generate unique filename
    const fileType = path.extname(file.originalname).substring(1).toLowerCase();
    const uniqueFileName = generateFileName(file.originalname);

    // Extract text from document for search indexing (using buffer)
    let extractedText = await extractText(file.buffer, fileType);
    extractedText = cleanText(extractedText);

    // Upload file to Supabase Storage
    let uploadResult;
    try {
      uploadResult = await uploadFile(file.buffer, uniqueFileName, file.mimetype);
    } catch (uploadError) {
      console.error('Error uploading to Supabase Storage:', uploadError);
      throw new Error('Failed to upload file to storage');
    }

    // Insert document into database
    const result = await db.query(
      `INSERT INTO documents 
       (title, description, file_name, file_path, file_size, file_type, mime_type, uploaded_by, extracted_text) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        title || file.originalname,
        description || null,
        file.originalname,
        uploadResult.path, // Store Supabase storage path
        file.size,
        fileType,
        file.mimetype,
        req.user.id,
        extractedText,
      ]
    );

    const document = result.rows[0];

    // Add keywords if provided
    if (keywords) {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      for (const keyword of keywordArray) {
        await db.query(
          'INSERT INTO document_keywords (document_id, keyword) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [document.id, keyword.toLowerCase()]
        );
      }
    }

    // Log activity
    await logActivity(
      req.user.id,
      'upload',
      'document',
      document.id,
      `uploaded a new document: ${document.title}`,
      {
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: document.id,
        title: document.title,
        description: document.description,
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
        created_at: document.created_at,
      },
    });
  } catch (error) {
    // If database insert fails and file was uploaded, try to delete from storage
    // Note: uploadResult might not be defined if upload failed
    if (typeof uploadResult !== 'undefined' && uploadResult && uploadResult.path) {
      try {
        await deleteFromStorage(uploadResult.path);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message,
    });
  }
};

/**
 * Search documents using full-text search
 * GET /api/documents/search?q=searchterm
 */
const searchDocuments = async (req, res) => {
  const { q, file_type, uploaded_by, limit = 50, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
  }

  try {
    let query = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.file_name,
        d.file_type,
        d.file_size,
        d.created_at,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_fullname,
        ts_rank(
          to_tsvector('english', COALESCE(d.title, '') || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.extracted_text, '')),
          plainto_tsquery('english', $1)
        ) as rank,
        COALESCE(
          (SELECT string_agg(keyword, ', ') FROM document_keywords dk WHERE dk.document_id = d.id),
          ''
        ) as keywords
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE to_tsvector('english', COALESCE(d.title, '') || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.extracted_text, '')) 
            @@ plainto_tsquery('english', $1)
    `;

    const params = [q];
    let paramIndex = 2;

    // Add file type filter
    if (file_type) {
      query += ` AND d.file_type = $${paramIndex}`;
      params.push(file_type);
      paramIndex++;
    }

    // Add uploaded_by filter
    if (uploaded_by) {
      query += ` AND d.uploaded_by = $${paramIndex}`;
      params.push(uploaded_by);
      paramIndex++;
    }

    query += ` ORDER BY rank DESC, d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      query: q,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching documents',
      error: error.message,
    });
  }
};

/**
 * Get all documents with optional filters
 * GET /api/documents
 */
const getDocuments = async (req, res) => {
  const { file_type, uploaded_by, limit = 50, offset = 0, sort = 'created_at', order = 'DESC' } = req.query;

  try {
    let query = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.file_name,
        d.file_type,
        d.file_size,
        d.created_at,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_fullname,
        COALESCE(
          (SELECT string_agg(keyword, ', ') FROM document_keywords dk WHERE dk.document_id = d.id),
          ''
        ) as keywords
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Add filters
    if (file_type) {
      query += ` AND d.file_type = $${paramIndex}`;
      params.push(file_type);
      paramIndex++;
    }

    if (uploaded_by) {
      query += ` AND d.uploaded_by = $${paramIndex}`;
      params.push(uploaded_by);
      paramIndex++;
    }

    // Add sorting
    const allowedSortFields = ['created_at', 'title', 'file_size'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY d.${sortField} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message,
    });
  }
};

/**
 * Get document by ID
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        d.*,
        u.username as uploaded_by_username,
        u.full_name as uploaded_by_fullname,
        COALESCE(
          (SELECT string_agg(keyword, ', ') FROM document_keywords dk WHERE dk.document_id = d.id),
          ''
        ) as keywords
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message,
    });
  }
};

/**
 * Download document
 * GET /api/documents/:id/download
 */
const downloadDocument = async (req, res) => {
  const { id } = req.params;

  try {
    // Get document info
    const result = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const document = result.rows[0];

    console.log(`Download request for document ID: ${id}, file_path: ${document.file_path}`);

    // Download file from Supabase Storage
    const fileData = await downloadFile(document.file_path, document.mime_type);
    
    console.log(`File downloaded successfully, size: ${fileData.data.length} bytes`);

    // Log activity
    await logActivity(
      req.user.id,
      'download',
      'document',
      parseInt(id),
      `downloaded the document: ${document.title}`,
      {
        file_name: document.file_name,
        file_type: document.file_type,
      }
    );

    // Set headers for file download
    res.setHeader('Content-Type', fileData.mimeType || document.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name || fileData.fileName}"`);
    res.setHeader('Content-Length', fileData.data.length);

    // Send file
    res.send(fileData.data);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message,
    });
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    // Get document info
    const docResult = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const document = docResult.rows[0];

    // Check if user has permission to delete (faculty/admin can delete their own, admin can delete any)
    const canDelete = 
      req.user.role === 'admin' || 
      (req.user.role === 'faculty' && document.uploaded_by === req.user.id);
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only faculty and admin can delete documents.',
      });
    }

    // Delete file from Supabase Storage
    await deleteFromStorage(document.file_path);

    // Delete from database (cascades to keywords and versions)
    await db.query('DELETE FROM documents WHERE id = $1', [id]);

    // Log activity (before deletion, so we have document info)
    await logActivity(
      req.user.id,
      'delete',
      'document',
      parseInt(id),
      `deleted a document: ${document.title}`,
      {
        file_name: document.file_name,
        file_type: document.file_type,
      }
    );

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message,
    });
  }
};

/**
 * Update document metadata
 * PUT /api/documents/:id
 */
const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { title, description, keywords } = req.body;

  try {
    // Check if document exists and user has permission
    const docResult = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const document = docResult.rows[0];

    // Check if user has permission to update (faculty/admin can update their own, admin can update any)
    const canUpdate = 
      req.user.role === 'admin' || 
      (req.user.role === 'faculty' && document.uploaded_by === req.user.id);
    
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only faculty and admin can update documents.',
      });
    }

    // Update document
    const result = await db.query(
      `UPDATE documents 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title, description, id]
    );

    // Update keywords if provided
    if (keywords !== undefined) {
      // Delete existing keywords
      await db.query('DELETE FROM document_keywords WHERE document_id = $1', [id]);
      
      // Add new keywords
      if (keywords) {
        const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
        for (const keyword of keywordArray) {
          await db.query(
            'INSERT INTO document_keywords (document_id, keyword) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, keyword.toLowerCase()]
          );
        }
      }
    }

    const updatedDocument = result.rows[0];

    // Log activity
    await logActivity(
      req.user.id,
      'update',
      'document',
      parseInt(id),
      `updated the document: ${updatedDocument.title}`,
      {
        file_name: updatedDocument.file_name,
        file_type: updatedDocument.file_type,
      }
    );

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument,
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  searchDocuments,
  getDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  updateDocument,
};
