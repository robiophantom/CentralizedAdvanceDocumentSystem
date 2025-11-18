/**
 * Activity Logger Utility
 * Centralized function to log user activities
 */

const db = require('../config/database');

/**
 * Log an activity to the database
 * @param {number} userId - ID of the user performing the action
 * @param {string} actionType - Type of action (e.g., 'upload', 'update', 'delete', 'view')
 * @param {string} entityType - Type of entity (e.g., 'document')
 * @param {number} entityId - ID of the affected entity
 * @param {string} description - Human-readable description of the activity
 * @param {object} metadata - Additional context (optional)
 * @returns {Promise<void>}
 */
const logActivity = async (userId, actionType, entityType, entityId, description, metadata = null) => {
  try {
    await db.query(
      `INSERT INTO activities (user_id, action_type, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, actionType, entityType, entityId, description, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    // Log error but don't throw - activity logging should not fail main operations
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  logActivity,
};

