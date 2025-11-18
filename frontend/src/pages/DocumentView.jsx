import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDownload, FaClock } from 'react-icons/fa';
import Loader from '../components/Loader';
import VersionHistoryModal from '../components/VersionHistoryModal';
import { getDocumentById, getVersions, updateDocument, downloadDocument } from '../services/documentService';
import toast from 'react-hot-toast';

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const data = await getDocumentById(id);
      setDocument(data);
      setEditTags(data?.tags.join(', ') || '');
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersions = async () => {
    try {
      const versionData = await getVersions(id);
      setVersions(versionData);
      setShowVersions(true);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleSaveTags = async () => {
    try {
      const newTags = editTags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
      await updateDocument(id, { keywords: newTags.join(',') });
      setDocument({ ...document, tags: newTags });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Failed to update tags. Please try again.');
    }
  };

  if (loading) return <Loader />;

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Document not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{document.title}</h1>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                {document.fileType}
              </span>
            </div>

            <div className="bg-gray-100 rounded-lg p-8 mb-6 min-h-96 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">Document Preview</p>
                <p className="text-sm text-gray-500 mt-2">
                  {document.fileType} file preview would be displayed here
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
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
                }}
                disabled={isDownloading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload className="w-5 h-5" />
                    Download
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewVersions}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FaClock className="w-5 h-5" />
                View Versions
              </motion.button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Metadata</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                <p className="text-gray-800">{document.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Tags</p>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-secondary hover:text-secondary/80 font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                      placeholder="Enter tags separated by commas"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveTags}
                        className="flex-1 px-3 py-1.5 bg-secondary text-white rounded text-sm hover:bg-secondary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditTags(document.tags.join(', '));
                          setIsEditing(false);
                        }}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Owner</p>
                <p className="text-gray-800">{document.owner}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Created Date</p>
                <p className="text-gray-800">{document.createdDate}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Versions</p>
                <p className="text-gray-800">{document.versions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VersionHistoryModal
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        versions={versions}
      />
    </div>
  );
}
