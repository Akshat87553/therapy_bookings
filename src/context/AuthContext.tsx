// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  authLoading: boolean;
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  getProfile: () => Promise<User>;
  updateProfile: (data: { name?: string; email?: string; phone?: string; password?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password, rememberMe },
        { withCredentials: true }
      );
      setIsAuthenticated(true);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      throw new Error(axiosErr.response?.data?.message || 'Invalid email or password');
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name, email, password, phone },
        { withCredentials: true }
      );
      setIsAuthenticated(true);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      throw new Error(axiosErr.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/forgot-password',
        { email },
        { withCredentials: true }
      );
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      throw new Error(axiosErr.response?.data?.message || 'Failed to send reset link.');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      throw new Error(axiosErr.response?.data?.message || 'Failed to reset password.');
    }
  };

  const getProfile = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/auth/profile', {
        withCredentials: true
      });
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      throw new Error('Failed to fetch profile.');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (fields: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    try {
      const { data } = await axios.put(
        'http://localhost:5000/api/auth/profile',
        fields,
        { withCredentials: true }
      );
      setUser(data.user);
      return data.user;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      throw new Error(axiosErr.response?.data?.message || 'Failed to update profile.');
    }
  };

  useEffect(() => {
    getProfile().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        getProfile,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);