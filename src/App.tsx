import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TodoList from './pages/TodoList';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} user={user} />
        <main className="w-full">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <TodoList />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !isAuthenticated ? (
                  <Signup setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
