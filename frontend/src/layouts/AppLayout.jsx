import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="pt-20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
