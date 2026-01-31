import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

import { BACKEND_URL } from '../lib/config';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
