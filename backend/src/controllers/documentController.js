/**
 * Document Controller
 * Handles document upload, retrieval, search, and management
 */

const db = require('../config/database');
const { deleteFile } = require('../utils/fileUpload');
const { extractText, cleanText } = require('../utils/textExtraction');
const path = require('path');

/**
 * Upload a new document
 * POST /api/documents/upload
 */
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { title, description, keywords } = req.body;
  const file = req.file;

  try {
    // Extract text from document for search indexing
    const fileType = path.extname(file.originalname).substring(1);
    let extractedText = await extractText(file.path, fileType);
    extractedText = cleanText(extractedText);

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
        file.path,
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
    // If database insert fails, delete the uploaded file
    if (req.file) {
      await deleteFile(req.file.path);
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

    // Check if user owns the document or is admin
    if (document.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    }

    // Delete file from filesystem
    await deleteFile(document.file_path);

    // Delete from database (cascades to keywords and versions)
    await db.query('DELETE FROM documents WHERE id = $1', [id]);

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

    if (document.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
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

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: result.rows[0],
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
  deleteDocument,
  updateDocument,
};
