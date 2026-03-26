import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ViewStickerPage from './pages/ViewStickerPage';
import CreatePage from './pages/CreatePage';
import CollectionsPage from './pages/CollectionsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { AudioWaveform } from 'lucide-react';
import { Menu, Home, Plus, Bookmark, LogOut } from 'lucide-react';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-dark-secondary border-b border-dark-tertiary">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex gap-1 items-center font-bold text-lg text-white">
          {/* <AudioWaveform size={20}/> */}
          <img src="./public/t-sticker-logo.svg" size={14} alt="t-stickers Logo" />
            t-stickers
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-tertiary transition-colors text-gray-300 text-sm"
              >
                <Home size={16} />
                Feed
              </Link>
              <Link
                to="/create"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-tertiary transition-colors text-gray-300 text-sm"
              >
                <Plus size={16} />
                Create
              </Link>
              <Link
                to="/collections"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-tertiary transition-colors text-gray-300 text-sm"
              >
                <Bookmark size={16} />
                My Packs
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-600 hover:bg-opacity-20 transition-colors text-red-400 text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
              <span className="text-xs text-gray-500 px-3">
                {user?.email}
              </span>
            </>
          ) : (
            <Link
              to="https://github.com/SidhuAchary02/t-stickers"
              target='_blank'
              className="border border-zinc-700 rounded-lg p-1"
            >
              <img src="/public/GitHub_Invertocat_White_Clearspace.svg" width={30}  alt="GitHub Logo" />
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 hover:bg-dark-tertiary rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={20} className="text-gray-300" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-dark-tertiary space-y-1 p-4">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg hover:bg-dark-tertiary text-gray-300 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            Feed
          </Link>
          <Link
            to="/create"
            className="block px-3 py-2 rounded-lg hover:bg-dark-tertiary text-gray-300 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            Create
          </Link>
          <Link
            to="/collections"
            className="block px-3 py-2 rounded-lg hover:bg-dark-tertiary text-gray-300 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Packs
          </Link>
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-600 hover:bg-opacity-20 text-red-400 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

function AppContent() {
  return (
    <Router>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)] bg-dark">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/s/:id" element={<ViewStickerPage />} />
          <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
