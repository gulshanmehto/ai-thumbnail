import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

import { BACKEND_URL } from '../lib/config';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup axios to include token from localStorage
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('session_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error, defaultMsg) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      toast.error(detail);
    } else if (Array.isArray(detail)) {
      // Handle Pydantic validation errors (FastAPI 422)
      // Extract the human-readable part of the error
      const msg = detail[0]?.msg || defaultMsg;
      toast.error(msg);
    } else {
      toast.error(defaultMsg);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email, password
      }, { withCredentials: true });

      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      }

      setUser(data.user);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      handleError(error, 'Login failed');
      return false;
    }
  };

  const signup = async (email, password, name) => {
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
        email, password, name
      }, { withCredentials: true });

      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      }

      setUser(data.user);
      toast.success('Account created successfully');
      return true;
    } catch (error) {
      handleError(error, 'Signup failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('session_token');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, checkAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
