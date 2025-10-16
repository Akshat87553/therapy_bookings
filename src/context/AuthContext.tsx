// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

// Strict env-only: read VITE_API_BASE (no fallback)
const API_BASE = import.meta.env.VITE_API_BASE;
const API_AVAILABLE = Boolean(API_BASE);

// If API_BASE is provided, set axios baseURL globally and enable cookies.
if (API_AVAILABLE) {
  axios.defaults.baseURL = API_BASE;
}
axios.defaults.withCredentials = true;

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const makeApiUnavailableError = () =>
    new Error('VITE_API_BASE is not set. Please add VITE_API_BASE=<your-api-url> to .env and restart the dev server.');

  const login = async (email: string, password: string, rememberMe: boolean) => {
    if (!API_AVAILABLE) throw makeApiUnavailableError();

    try {
      const { data } = await axios.post('/api/auth/login', { email, password, rememberMe });
      setIsAuthenticated(true);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(extractMessage(error, 'Invalid email or password'));
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    if (!API_AVAILABLE) throw makeApiUnavailableError();

    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password, phone });
      setIsAuthenticated(true);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to register. Please try again.'));
    }
  };

  const logout = async () => {
    if (!API_AVAILABLE) {
      // still clear local auth state even if API is missing
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      await axios.post('/api/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    if (!API_AVAILABLE) throw makeApiUnavailableError();

    try {
      await axios.post('/api/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to send reset link.'));
    }
  };

  const resetPassword = async (token: string, password: string) => {
    if (!API_AVAILABLE) throw makeApiUnavailableError();

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to reset password.'));
    }
  };

  const getProfile = async () => {
    if (!API_AVAILABLE) {
      // Make the state consistent: don't leave authLoading stuck
      setIsAuthenticated(false);
      setUser(null);
      setAuthLoading(false);
      return Promise.reject(makeApiUnavailableError());
    }

    try {
      const { data } = await axios.get('/api/auth/profile');
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
  };

  const updateProfile = async (fields: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    if (!API_AVAILABLE) throw makeApiUnavailableError();

    try {
      const { data } = await axios.put('/api/auth/profile', fields);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(extractMessage(error, 'Failed to update profile.'));
    }
  };

  useEffect(() => {
    // Attempt to fetch profile on mount; getProfile handles the case when API_BASE is missing.
    getProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

