import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DocumentView from './pages/DocumentView';
import SearchResults from './pages/SearchResults';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="document/:id" element={<DocumentView />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
