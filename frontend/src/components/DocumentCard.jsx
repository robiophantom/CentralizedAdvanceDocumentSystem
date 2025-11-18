import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEllipsisV, FaDownload, FaShare } from 'react-icons/fa';
import { getFileIcon, getFileIconColor, getFileIconBg } from '../utils/fileIcons';
import { useState } from 'react';

export default function DocumentCard({ document }) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const FileIcon = getFileIcon(document.fileType);
  const iconColor = getFileIconColor(document.fileType);
  const iconBg = getFileIconBg(document.fileType);

  const handleCardClick = () => {
    navigate(`/document/${document.id}`);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    if (action === 'view') {
      navigate(`/document/${document.id}`);
    } else if (action === 'download') {
      // TODO: Implement download
      console.log('Download:', document.id);
    } else if (action === 'share') {
      // TODO: Implement share
      console.log('Share:', document.id);
    }
    setShowActions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${iconBg.replace('bg-', 'bg-gradient-to-r from-')} opacity-60`}></div>
      
      <div className="p-6">
        {/* Header with icon and date */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center shadow-sm`}>
            <FileIcon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <span className="text-xs text-gray-500 font-medium">{document.createdDate}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
          {document.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.snippet || document.description}</p>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {document.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium">
                +{document.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer with owner */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="font-medium">{document.owner}</span>
          <span className="text-xs uppercase font-semibold px-2 py-1 bg-gray-100 rounded">
            {document.fileType}
          </span>
        </div>

        {/* Action buttons on hover */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 pt-4 border-t border-gray-100 ${showActions ? 'opacity-100' : ''}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleActionClick(e, 'view')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaEye className="w-3 h-3" />
            View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleActionClick(e, 'download')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors"
            title="Download"
          >
            <FaDownload className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleActionClick(e, 'share')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors"
            title="Share"
          >
            <FaShare className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
