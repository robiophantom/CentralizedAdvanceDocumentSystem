import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEllipsisV, FaDownload, FaShare, FaTrash } from 'react-icons/fa';
import { getFileIcon, getFileIconColor, getFileIconBg } from '../utils/fileIcons';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { deleteDocument, downloadDocument } from '../services/documentService';
import toast from 'react-hot-toast';

export default function DocumentCard({ document, onDelete }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const FileIcon = getFileIcon(document.fileType);
  const iconColor = getFileIconColor(document.fileType);
  const iconBg = getFileIconBg(document.fileType);
  
  // Check if user can delete (faculty/admin can delete their own, admin can delete any)
  // Note: We check by owner name since we don't have uploaded_by ID in the document object
  const canDelete = 
    currentUser?.role === 'admin' || 
    (currentUser?.role === 'faculty' && (
      document.owner === currentUser?.full_name || 
      document.owner === currentUser?.username ||
      document.owner === currentUser?.email
    ));

  const handleCardClick = () => {
    navigate(`/document/${document.id}`);
  };

  const handleActionClick = async (e, action) => {
    e.stopPropagation();
    if (action === 'view') {
      navigate(`/document/${document.id}`);
    } else if (action === 'download') {
      setIsDownloading(true);
      try {
        await downloadDocument(document.id, document.file_name || document.title);
        toast.success('Document downloaded successfully');
      } catch (error) {
        toast.error('Failed to download document');
        console.error('Download error:', error);
      } finally {
        setIsDownloading(false);
      }
    } else if (action === 'share') {
      // TODO: Implement share
      console.log('Share:', document.id);
    } else if (action === 'delete' && canDelete) {
      if (window.confirm('Are you sure you want to delete this document?')) {
        setIsDeleting(true);
        try {
          await deleteDocument(document.id);
          toast.success('Document deleted successfully');
          if (onDelete) {
            onDelete(document.id);
          }
        } catch (error) {
          toast.error('Failed to delete document');
          console.error('Delete error:', error);
        } finally {
          setIsDeleting(false);
        }
      }
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
            disabled={isDownloading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download"
          >
            {isDownloading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaDownload className="w-4 h-4" />
            )}
          </motion.button>
          {canDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleActionClick(e, 'delete')}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors disabled:opacity-50"
              title="Delete"
            >
              <FaTrash className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
