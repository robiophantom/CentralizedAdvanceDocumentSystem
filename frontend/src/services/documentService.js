import api from './api';

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
    const response = await api.get('/documents');
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
    const response = await api.get('/documents/search', {
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

    const response = await api.post('/documents/upload', data, {
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
    const response = await api.get(`/documents/${id}`);
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
    const response = await api.put(`/documents/${id}`, updates);
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
    const response = await api.delete(`/documents/${id}`);
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
