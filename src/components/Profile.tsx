// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, getProfile, updateProfile, logout, authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const populateFromUser = (authUser: typeof user) => {
      if (!mounted || !authUser) return;
      setName(authUser.name ?? '');
      setEmail(authUser.email ?? '');
      setPhone(authUser.phone ?? '');
    };

    if (user) {
      populateFromUser(user);
    } else if (!authLoading) {
      getProfile()
        .then((data) => populateFromUser(data))
        .catch((error) => {
          if (axios.isAxiosError<{ message?: string }>(error)) {
            console.error('Get profile error:', error.response?.data?.message ?? error.message);
          } else if (error instanceof Error) {
            console.error('Get profile error:', error.message);
          } else {
            console.error('Get profile error: unknown error');
          }
          navigate('/login');
        });
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading, getProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile({ name, email, phone, password });
      setMessage('Profile updated successfully');
      setPassword('');
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setError(error.response?.data?.message ?? error.message ?? 'Failed to update profile');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update profile');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[70vh] flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-6 py-8 sm:px-10">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
              {/* Avatar placeholder */}
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white text-xl font-semibold">
                  {name ? name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-serif text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account information</p>
              </div>
            </div>

            {/* Success / Error messages */}
            <div className="space-y-2 mb-4">
              {message && (
                <div className="rounded-md bg-green-50 border border-green-100 p-3 text-green-800 text-sm">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-100 p-3 text-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 shadow-sm transition"
                >
                  Update Profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-gray-200 bg-white text-gray-700 font-medium px-4 py-2 hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>

          {/* Footer area of card */}
          <div className="bg-gray-50 px-6 py-4 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Account ID: <span className="font-mono text-gray-700">{user?.id ?? '—'}</span></span>
              <span className="italic">Last sync: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* bottom spacing so footer never overlaps */}
        <div className="h-12" />
      </div>
    </div>
  );
};

export default Profile;
