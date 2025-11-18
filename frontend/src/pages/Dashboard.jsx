import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFolder, FaTags, FaClock, FaFileUpload, FaPlus } from 'react-icons/fa';
import DocumentCard from '../components/DocumentCard';
import Loader from '../components/Loader';
import RecentActivity from '../components/RecentActivity';
import { SkeletonCard } from '../components/Skeleton';
import { getDocuments } from '../services/documentService';
import { useAuth } from '../contexts/AuthContext';
import { getTimeBasedGreeting, getInitials } from '../utils/timeUtils';

export default function Dashboard({ theme = 'green' }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const colors =
    theme === 'red'
      ? {
          primary: 'bg-red-600',
          primaryLight: 'from-red-50 to-white',
          primaryDark: 'bg-red-700',
          secondary: 'bg-red-100',
          text: 'text-red-600',
          gradient: 'from-red-500 via-pink-500 to-orange-500',
        }
      : {
          primary: 'bg-green-600',
          primaryLight: 'from-green-50 to-white',
          primaryDark: 'bg-green-700',
          secondary: 'bg-green-100',
          text: 'text-green-600',
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
        };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Documents',
      value: documents.length,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-100',
      icon: FaFolder,
    },
    {
      label: 'Unique Tags',
      value: new Set(documents.flatMap((d) => d.tags || [])).size || 0,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-100',
      icon: FaTags,
    },
    {
      label: 'Total Versions',
      value: documents.reduce((sum, doc) => sum + (doc.versions || 0), 0),
      color: 'bg-orange-600',
      bgColor: 'bg-orange-100',
      icon: FaClock,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-3xl p-8 mb-10 bg-gradient-to-br ${colors.gradient} shadow-xl border border-gray-100 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30 shadow-lg"
          >
            {getInitials(currentUser?.full_name || currentUser?.username || currentUser?.email)}
          </motion.div>
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm mb-1 font-medium"
            >
              {getTimeBasedGreeting()}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-extrabold text-white mb-2"
            >
              {currentUser?.full_name || currentUser?.username || currentUser?.email || 'User'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-lg"
            >
              Manage, search, and track all your documents in one place.
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors font-medium shadow-lg"
          >
            <FaFileUpload className="w-4 h-4" />
            Upload Document
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`}></div>
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-7 h-7 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="text-4xl font-bold text-gray-800"
                      >
                        {stat.value}
                      </motion.h3>
                      <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Documents Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaFolder className="w-6 h-6 text-gray-600" />
              Recent Documents
            </h2>
          </div>

          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <FaFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No documents uploaded yet</p>
              <p className="text-gray-400 text-sm mb-6">Start by uploading your first document!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className={`px-6 py-3 ${colors.primary} text-white rounded-lg hover:${colors.primaryDark} transition-colors font-medium shadow-md`}
              >
                <FaFileUpload className="w-4 h-4 inline mr-2" />
                Upload Document
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DocumentCard document={doc} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* Enhanced FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/upload')}
        className={`fixed bottom-8 right-8 w-16 h-16 ${colors.primary} hover:${colors.primaryDark} text-white rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center text-3xl z-20`}
        title="Upload new document"
      >
        <FaPlus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
