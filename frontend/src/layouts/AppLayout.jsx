import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar user={currentUser} onLogout={logout} />
        <main className="pt-20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
