import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import Login from './components/Login';
import Navbar from './components/Navbar';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import UserManager from './components/UserManager';

import { Toaster } from "react-hot-toast";
import './App.css';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser()
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    await api.login(email, password);
    
    const userData = await api.getCurrentUser();
    setUser(userData);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <div className="min-vh-100 bg-light">
          <Navbar />
          <main className="container py-4">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/" element={<PostList />} />
              <Route path="/posts/:slug" element={<PostDetail />} />
              <Route path="/posts/new" element={user ? <PostForm /> : <Navigate to="/login" />} />
              <Route path="/posts/:slug/edit" element={user ? <PostForm /> : <Navigate to="/login" />} />
              <Route path="/users" element={user?.is_staff ? <UserManager /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
