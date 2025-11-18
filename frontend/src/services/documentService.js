import api from './api';

const DOCUMENTS_ENDPOINT = '/api/documents';

/**
 * Transform API document to frontend format
 */
const transformDocument = (doc) => {
  const tags = doc.keywords ? doc.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || '',
    tags: tags,
    createdDate: doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : '',
    owner: doc.uploaded_by_fullname || doc.uploaded_by_username || 'Unknown',
    fileType: doc.file_type?.toUpperCase() || 'PDF',
    versions: 1, // TODO: Implement version tracking
    snippet: doc.description ? doc.description.substring(0, 100) + '...' : '',
    file_name: doc.file_name,
    file_size: doc.file_size,
    file_path: doc.file_path,
  };
};

export const getDocuments = async () => {
  try {
    const response = await api.get(DOCUMENTS_ENDPOINT);
    if (response.data.success) {
      return response.data.data.map(transformDocument);
    }
    throw new Error(response.data.message || 'Failed to fetch documents');
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const searchDocuments = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return getDocuments();
    }
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/search`, {
      params: { q: query },
    });
    if (response.data.success) {
      return response.data.data.map(transformDocument);
    }
    throw new Error(response.data.message || 'Search failed');
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

export const uploadDocument = async (formData) => {
  try {
    const data = new FormData();
    data.append('file', formData.file);
    data.append('title', formData.title);
    if (formData.description) {
      data.append('description', formData.description);
    }
    if (formData.tags && formData.tags.length > 0) {
      data.append('keywords', formData.tags.join(','));
    }

    const response = await api.post(`${DOCUMENTS_ENDPOINT}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      // Fetch the full document to get all fields
      return getDocumentById(response.data.data.id);
    }
    throw new Error(response.data.message || 'Upload failed');
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const getDocumentById = async (id) => {
  try {
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/${id}`);
    if (response.data.success) {
      return transformDocument(response.data.data);
    }
    throw new Error(response.data.message || 'Document not found');
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

export const updateDocument = async (id, updates) => {
  try {
    const response = await api.put(`${DOCUMENTS_ENDPOINT}/${id}`, updates);
    if (response.data.success) {
      return transformDocument(response.data.data);
    }
    throw new Error(response.data.message || 'Update failed');
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`${DOCUMENTS_ENDPOINT}/${id}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Delete failed');
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const getVersions = async (id) => {
  // TODO: Implement version history API endpoint
  return [];
};

/**
 * Get preview URL for a document
 * @param {number} id - Document ID
 * @returns {string} Preview URL
 */
export const getDocumentPreviewUrl = (id) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${baseURL}${DOCUMENTS_ENDPOINT}/${id}/preview`;
};

/**
 * Download a document
 * @param {number} id - Document ID
 * @param {string} fileName - Optional custom filename for download
 * @returns {Promise<void>}
 */
export const downloadDocument = async (id, fileName = null) => {
  try {
    console.log(`Downloading document ${id}...`);
    const response = await api.get(`${DOCUMENTS_ENDPOINT}/${id}/download`, {
      responseType: 'blob', // Important for file downloads
    });
    
    console.log('Download response received:', {
      status: response.status,
      headers: response.headers,
      blobSize: response.data?.size,
    });

    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let downloadFileName = fileName;
    
    if (!downloadFileName && contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (fileNameMatch) {
        downloadFileName = fileNameMatch[1];
      }
    }
    
    // Fallback to default filename
    if (!downloadFileName) {
      downloadFileName = `document-${id}.pdf`;
    }

    // Check if response is actually a blob
    if (!response.data || !(response.data instanceof Blob)) {
      console.error('Response is not a blob:', response.data);
      throw new Error('Invalid file response');
    }

    // Create a blob from the response
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/octet-stream' 
    });
    
    console.log(`Blob created: ${blob.size} bytes, type: ${blob.type}`);
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    console.log(`Triggering download: ${downloadFileName}`);
    link.click();
    
    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Download cleanup completed');
    }, 100);
  } catch (error) {
    console.error('Error downloading document:', error);
    
    // Handle blob error responses (they might be JSON error messages)
    if (error.response?.data instanceof Blob) {
      // Try to read the error message from the blob
      error.response.data.text().then(text => {
        try {
          const errorData = JSON.parse(text);
          console.error('Error from server:', errorData);
        } catch (e) {
          console.error('Error response text:', text);
        }
      });
    }
    
    if (error.response?.status === 404) {
      throw new Error('Document not found');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied');
    } else if (error.response?.status === 500) {
      throw new Error('Server error while downloading document');
    }
    throw error;
  }
};