import api from './api';
import { formatRelativeTime } from '../utils/timeUtils';

const ACTIVITIES_ENDPOINT = '/api/activities';

/**
 * Transform API activity to frontend format
 */
const transformActivity = (activity) => {
  return {
    id: activity.id,
    user: {
      name: activity.user.name,
      initials: activity.user.initials,
    },
    action: activity.action,
    timestamp: formatRelativeTime(activity.created_at || activity.timestamp),
  };
};

/**
 * Get recent activities
 * @param {number} limit - Number of activities to fetch (default: 20)
 * @returns {Promise<Array>} Array of activity objects
 */
export const getRecentActivity = async (limit = 20) => {
  try {
    const response = await api.get(ACTIVITIES_ENDPOINT, {
      params: { limit },
    });
    
    if (response.data.success) {
      return response.data.data.map(transformActivity);
    }
    throw new Error(response.data.message || 'Failed to fetch activities');
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return empty array on error to prevent UI breakage
    return [];
  }
};
