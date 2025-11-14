import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DocumentView from './pages/DocumentView';
import SearchResults from './pages/SearchResults';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<Upload />} />
              <Route path="document/:id" element={<DocumentView />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="admin" element={<AdminPanel />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
