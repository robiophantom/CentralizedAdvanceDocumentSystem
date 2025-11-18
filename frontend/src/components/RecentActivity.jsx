import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaEdit, FaTrash, FaEye, FaClock } from 'react-icons/fa';
import { getRecentActivity } from '../services/activityService';
import { SkeletonActivity } from './Skeleton';
import { getInitials } from '../utils/timeUtils';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getRecentActivity(10);
        setActivities(data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const getActivityIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upload')) return FaUpload;
    if (actionLower.includes('update') || actionLower.includes('edit')) return FaEdit;
    if (actionLower.includes('delete')) return FaTrash;
    if (actionLower.includes('view')) return FaEye;
    return FaClock;
  };

  const getActivityColor = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upload')) return 'bg-blue-100 text-blue-600';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'bg-yellow-100 text-yellow-600';
    if (actionLower.includes('delete')) return 'bg-red-100 text-red-600';
    if (actionLower.includes('view')) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaClock className="w-5 h-5 text-gray-600" />
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonActivity key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaClock className="w-5 h-5 text-gray-600" />
          Recent Activity
        </h3>
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No recent activity to display.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.action);
            const iconColor = getActivityColor(activity.action);
            const avatarColor = getAvatarColor(activity.user.name);
            
            return (
              <motion.li
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 relative">
                  <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold shadow-sm`}>
                    {activity.user.initials || getInitials(activity.user.name)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${iconColor} flex items-center justify-center border-2 border-white`}>
                    <ActivityIcon className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <span className="font-semibold text-gray-900">{activity.user.name}</span>{' '}
                    <span className="text-gray-600">{activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaClock className="w-3 h-3" />
                    {activity.timestamp}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
};

export default RecentActivity;
