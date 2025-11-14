import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../services/documentService';

export default function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    file: null,
    fileType: 'PDF',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) : [];
      await uploadDocument({
        title: formData.title,
        description: formData.description,
        tags: tagsArray,
        file: formData.file,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.response?.data?.message || error.message || 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toUpperCase();
      setFormData({ ...formData, file, fileType: extension });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Document</h1>
        <p className="text-gray-600">Add a new document to your collection</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-secondary/10 border border-secondary text-secondary rounded-lg">
          Document uploaded successfully! Redirecting to dashboard...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File <span className="text-primary">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              required
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-secondary/10 file:text-secondary file:font-medium hover:file:bg-secondary/20"
            />
            <p className="mt-2 text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              placeholder="Enter document title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-primary">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none transition-all"
              placeholder="Enter document description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              placeholder="Enter tags separated by commas (e.g., finance, report, 2024)"
            />
            {formData.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag)
                  .map((tag, index) => (
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
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
