import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import api from '../services/api';

/**
 * DocumentPreview Component
 * Handles preview of different document types: PDF, images, text files, etc.
 */
export default function DocumentPreview({ document, className = '' }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewType, setPreviewType] = useState(null);

  useEffect(() => {
    if (!document) return;

    // Determine preview type based on file type
    const fileType = (document.fileType || '').toLowerCase();
    const mimeType = document.mime_type || '';

    let type = 'unsupported';
    
    if (fileType === 'pdf' || mimeType.includes('pdf')) {
      type = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType) || mimeType.startsWith('image/')) {
      type = 'image';
    } else if (['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'].includes(fileType) || mimeType.startsWith('text/')) {
      type = 'text';
    }

    setPreviewType(type);
    loadPreview(document.id, type);
  }, [document]);

  const loadPreview = async (documentId, type) => {
    if (type === 'unsupported') {
      setLoading(false);
      setPreviewError('Preview not available for this file type');
      return;
    }

    try {
      setLoading(true);
      setPreviewError(null);

      // For all file types, fetch as blob first to handle authentication
      const response = await api.get(`/api/documents/${documentId}/preview`, {
        responseType: type === 'text' ? 'text' : 'blob',
      });

      if (type === 'text') {
        // For text files, use the text directly
        setPreviewUrl(response.data);
      } else {
        // For images and PDFs, create a blob URL
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/octet-stream' 
        });
        const blobUrl = window.URL.createObjectURL(blob);
        setPreviewUrl(blobUrl);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setPreviewError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 min-h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (previewError || previewType === 'unsupported') {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 min-h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">
            {previewError || 'Preview not available'}
          </p>
          <p className="text-sm text-gray-500">
            {document?.fileType?.toUpperCase()} files cannot be previewed in the browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {previewType === 'pdf' && previewUrl && (
        <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title={`Preview of ${document?.title}`}
            style={{ border: 'none' }}
          />
        </div>
      )}

      {previewType === 'image' && previewUrl && (
        <div className="w-full flex items-center justify-center p-4 bg-white">
          <img
            src={previewUrl}
            alt={document?.title || 'Document preview'}
            className="max-w-full max-h-[600px] object-contain rounded-lg shadow-md"
            onError={() => setPreviewError('Failed to load image')}
          />
        </div>
      )}

      {previewType === 'text' && previewUrl && (
        <div className="w-full h-[600px] overflow-auto bg-white p-6 border border-gray-200 rounded-lg">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {previewUrl}
          </pre>
        </div>
      )}
    </div>
  );
}

