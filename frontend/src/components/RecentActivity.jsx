import { useState, useEffect } from 'react';
import { getRecentActivity } from '../services/activityService';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getRecentActivity();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg">{activity.user.initials}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">{activity.user.name}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
