/**
 * User Controller
 * Handles user management operations (admin only)
 */

const db = require('../config/database');

/**
 * Get all users
 * GET /api/users
 * Admin only
 */
const getUsers = async (req, res) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT id, username, email, full_name, role, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 * Admin only
 */
const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query(
      'SELECT id, username, email, full_name, role, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 * Admin only
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, full_name, role } = req.body;
  
  try {
    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Validate role if provided
    if (role && !['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, faculty, or admin.',
      });
    }
    
    // Update user
    const result = await db.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           full_name = COALESCE($3, full_name),
           role = COALESCE($4, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, username, email, full_name, role, created_at, updated_at`,
      [username, email, full_name, role, id]
    );
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 * Admin only
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }
    
    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Delete user (cascades to documents and activities)
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

