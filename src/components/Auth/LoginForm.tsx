// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(email, password, rememberMe);
      if (loggedInUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to login. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#6B8F9A]">
    
      
      <div className="relative max-w-md w-full bg-white/20 backdrop-blur-lg border border-white/40 rounded-3xl p-10 shadow-xl">
        <h2 className="text-3xl font-serif italic text-white text-center mb-6">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 backdrop-blur-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-white mb-2 font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full bg-white/70 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-white mb-2 font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full bg-white/70 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="mr-2 accent-white"
            />
            <label htmlFor="rememberMe" className="text-white font-medium">Remember Me</label>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full border border-white text-white font-semibold hover:bg-white/30 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-white text-sm">
          Forgot your password?{' '}
          <Link to="/forgot-password" className="underline">
            Reset it
          </Link>
        </p>
        <p className="mt-2 text-center text-white text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
