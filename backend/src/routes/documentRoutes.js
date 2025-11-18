/**
 * Document Routes
 * Defines routes for document management
 */

const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload } = require('../utils/fileUpload');

// All document routes require authentication
router.use(authenticateToken);

// Document CRUD operations
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/search', documentController.searchDocuments);
router.get('/', documentController.getDocuments);
router.get('/:id/download', documentController.downloadDocument);
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
