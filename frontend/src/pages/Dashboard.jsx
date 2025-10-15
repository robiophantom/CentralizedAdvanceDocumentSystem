import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';
import Loader from '../components/Loader';
import { getDocuments } from '../services/documentService';

export default function Dashboard({ theme = 'green' }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const colors =
    theme === 'red'
      ? {
          primary: 'bg-red-600',
          primaryLight: 'from-red-50 to-white',
          secondary: 'bg-red-100',
          text: 'text-red-600',
        }
      : {
          primary: 'bg-green-600',
          primaryLight: 'from-green-50 to-white',
          secondary: 'bg-green-100',
          text: 'text-green-600',
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
      color: `${colors.primary}`,
      icon: '📁',
    },
    {
      label: 'Unique Tags',
      value: new Set(documents.flatMap((d) => d.tags)).size || 0,
      color: `${colors.secondary}`,
      icon: '🏷️',
    },
    {
      label: 'Total Versions',
      value: documents.reduce((sum, doc) => sum + (doc.versions || 0), 0),
      color: `${colors.primary}`,
      icon: '🕒',
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* 🌈 Hero Section */}
      <div
        className={`rounded-3xl p-8 mb-10 bg-gradient-to-r ${colors.primaryLight} shadow-sm border border-gray-100`}
      >
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Manage, search, and track all your documents in one place.
        </p>
      </div>

      {/* 📊 Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 p-6 transition-transform hover:-translate-y-1 hover:shadow-lg`}
          >
            <div
              className={`absolute top-0 left-0 w-2 h-full ${stat.color} rounded-l-2xl`}
            ></div>
            <div className="flex items-center gap-4">
              <div
                className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow-sm`}
              >
                {stat.icon}
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-800">
                  {stat.value}
                </h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🗂️ Recent Documents Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📄</span> Recent Documents
        </h2>
      </div>

      {documents.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No documents uploaded yet. Start by uploading one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* ➕ Floating Upload Button */}
      <button
        onClick={() => navigate('/upload')}
        className={`fixed bottom-8 right-8 w-16 h-16 ${colors.primary} hover:scale-105 hover:shadow-2xl text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-4xl z-20`}
        title="Upload new document"
      >
        +
      </button>
    </div>
  );
}
