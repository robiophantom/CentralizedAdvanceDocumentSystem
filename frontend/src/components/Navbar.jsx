import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary lg:hidden">CADMS</h1>
            <SearchBar />
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
                <p className="text-sm text-gray-800 font-semibold">{user.email}</p>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
