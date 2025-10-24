import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

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
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && isAuthenticated) {
          toast.error('Your session has expired. Please log in again.');
          setIsAuthenticated(false);
          setUser(null);
          setUserPlan("free");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);

  const refreshPlan = async () => {
    try {
      const planResponse = await api.get('/user/plan');
      const plan =
        planResponse.data.plan?.name ||
        planResponse.data.plan ||
        planResponse.data.current_plan ||
        "free";
      setUserPlan(plan.toLowerCase());
    } catch (error) {
      console.error('Failed to refresh plan:', error);
      setUserPlan("free");
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
      setIsAuthenticated(true);
      const planResponse = await api.get('/user/plan');
      const plan =
      planResponse.data.plan?.name ||
      planResponse.data.plan ||
      planResponse.data.current_plan ||
      "free";
      setUserPlan(plan.toLowerCase());
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setUserPlan("free");
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setLoggingIn(true);
    try {
      setUser(userData);
      setIsAuthenticated(true);
      const planResponse = await api.get('/user/plan');
      const plan =
        planResponse.data.plan?.name ||
        planResponse.data.plan ||
        planResponse.data.current_plan ||
        "free";
      setUserPlan(plan.toLowerCase());
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
    <AuthContext.Provider value={{ isAuthenticated, user, userPlan, loading, loggingIn, loggingOut, login, logout, refreshPlan }}>
      {children}
    </AuthContext.Provider>
  );
};
