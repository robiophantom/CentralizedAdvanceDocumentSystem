/**
 * Activity Controller
 * Handles activity retrieval and management
 */

const db = require('../config/database');

/**
 * Get recent activities
 * GET /api/activities
 */
const getRecentActivities = async (req, res) => {
  const { limit = 20, offset = 0, user_id } = req.query;

  try {
    let query = `
      SELECT 
        a.id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.description,
        a.metadata,
        a.created_at,
        u.id as user_id,
        u.username,
        u.full_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filter by user_id if provided
    if (user_id) {
      query += ` AND a.user_id = $${paramIndex}`;
      params.push(parseInt(user_id));
      paramIndex++;
    }

    // Order by most recent first
    query += ` ORDER BY a.created_at DESC`;

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Transform data to match frontend format
    const activities = result.rows.map((row) => {
      // Extract initials from full name
      const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
          return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };

      return {
        id: row.id,
        user: {
          id: row.user_id,
          name: row.full_name || row.username || 'Unknown',
          initials: getInitials(row.full_name || row.username),
        },
        action: row.description,
        action_type: row.action_type,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        timestamp: row.created_at,
        created_at: row.created_at,
        metadata: row.metadata,
      };
    });

    res.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message,
    });
  }
};

/**
 * Get activities by user
 * GET /api/activities/user/:userId
 */
const getActivitiesByUser = async (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  // Check if user is requesting their own activities or is admin
  if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Permission denied',
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        a.id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.description,
        a.metadata,
        a.created_at,
        u.id as user_id,
        u.username,
        u.full_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const getInitials = (name) => {
      if (!name) return 'U';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const activities = result.rows.map((row) => ({
      id: row.id,
      user: {
        id: row.user_id,
        name: row.full_name || row.username || 'Unknown',
        initials: getInitials(row.full_name || row.username),
      },
      action: row.description,
      action_type: row.action_type,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      timestamp: row.created_at,
      created_at: row.created_at,
      metadata: row.metadata,
    }));

    res.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activities',
      error: error.message,
    });
  }
};

/**
 * Get activities by document
 * GET /api/activities/document/:documentId
 */
const getActivitiesByDocument = async (req, res) => {
  const { documentId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const result = await db.query(
      `SELECT 
        a.id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.description,
        a.metadata,
        a.created_at,
        u.id as user_id,
        u.username,
        u.full_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = 'document' AND a.entity_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3`,
      [documentId, parseInt(limit), parseInt(offset)]
    );

    const getInitials = (name) => {
      if (!name) return 'U';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const activities = result.rows.map((row) => ({
      id: row.id,
      user: {
        id: row.user_id,
        name: row.full_name || row.username || 'Unknown',
        initials: getInitials(row.full_name || row.username),
      },
      action: row.description,
      action_type: row.action_type,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      timestamp: row.created_at,
      created_at: row.created_at,
      metadata: row.metadata,
    }));

    res.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Get document activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document activities',
      error: error.message,
    });
  }
};

module.exports = {
  getRecentActivities,
  getActivitiesByUser,
  getActivitiesByDocument,
};

