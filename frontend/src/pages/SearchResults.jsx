import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';
import Loader from '../components/Loader';
import { searchDocuments } from '../services/documentService';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performSearch();
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await searchDocuments(query);
      setDocuments(results);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
        {query ? (
          <p className="text-gray-600">
            Found {documents.length} result{documents.length !== 1 ? 's' : ''} for "{query}"
          </p>
        ) : (
          <p className="text-gray-600">Showing all documents</p>
        )}
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No documents found</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search query or browse all documents
          </p>
        </div>
      )}
    </div>
  );
}
