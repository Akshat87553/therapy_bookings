// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiBaseUrl, apiUrl } from '../utils/api';

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

const API_BASE = apiBaseUrl;

if (API_BASE) {
  axios.defaults.baseURL = API_BASE;
}
axios.defaults.withCredentials = true;

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    try {
      const { data } = await axios.post(apiUrl('/api/auth/login'), { email, password, rememberMe });
      setIsAuthenticated(true);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(extractMessage(error, 'Invalid email or password'));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    try {
      const { data } = await axios.post(apiUrl('/api/auth/register'), { name, email, password, phone });
      setIsAuthenticated(true);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to register. Please try again.'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(apiUrl('/api/auth/logout'), {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await axios.post(apiUrl('/api/auth/forgot-password'), { email });
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to send reset link.'));
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await axios.post(apiUrl(`/api/auth/reset-password/${token}`), { password });
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to reset password.'));
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(apiUrl('/api/auth/profile'));
      setUser(data);
      setIsAuthenticated(true);
      return data as User;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(extractMessage(error, 'Failed to fetch profile.'));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (fields: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    try {
      const { data } = await axios.put(apiUrl('/api/auth/profile'), fields);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to update profile.'));
    }
  }, []);

  useEffect(() => {
    getProfile().catch(() => {});
  }, [getProfile]);

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

// The context hook is exported here for convenience even though the file also exports non-component utilities.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
const extractMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

