import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { getCurrentUser } from './utils/storage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FocusForge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App relative min-h-screen overflow-x-hidden">
      {/* Animated background theme */}
      <div className="background-theme">
        <div className="bg-shape bg-shape1"></div>
        <div className="bg-shape bg-shape2"></div>
        <div className="bg-shape bg-shape3"></div>
      </div>
      <div className="relative z-10">
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <AuthForm onLogin={handleLogin} />
        )}
      </div>
      {/* Footer */}
      <footer className="w-full fixed bottom-0 left-0 z-20 flex items-center justify-center py-3 bg-gradient-to-r from-indigo-50 via-white/80 to-pink-50/80 text-gray-700 text-base font-medium shadow-inner animate-fadeIn">
        <span className="flex items-center gap-2">
          Made with
          <span className="text-red-500 animate-pulse text-xl" role="img" aria-label="love">❤️</span>
          by <span className="font-bold">Deepali Verma</span>
        </span>
      </footer>
    </div>
  );
}

export default App;