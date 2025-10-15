import { useNavigate } from 'react-router-dom';

export default function DocumentCard({ document }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/document/${document.id}`)}
      className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-secondary"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{document.title}</h3>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
          {document.fileType}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.snippet}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {document.tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{document.owner}</span>
        <span>{document.createdDate}</span>
      </div>
    </div>
  );
}
