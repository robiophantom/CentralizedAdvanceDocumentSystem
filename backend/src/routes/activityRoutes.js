/**
 * Activity Routes
 * Defines routes for activity management
 */

const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All activity routes require authentication
router.use(authenticateToken);

// Activity routes
router.get('/', activityController.getRecentActivities);
router.get('/user/:userId', activityController.getActivitiesByUser);
router.get('/document/:documentId', activityController.getActivitiesByDocument);

module.exports = router;

