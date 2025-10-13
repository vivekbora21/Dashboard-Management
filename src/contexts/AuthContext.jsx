import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import Loading from '../components/Loading';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setLoggingIn(true);
    try {
      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/logout/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, loggingIn, loggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
