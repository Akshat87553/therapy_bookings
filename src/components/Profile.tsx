import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

const Profile: React.FC = () => {
  const { user, getProfile, updateProfile, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      getProfile().then((data) => {
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone || '');
      }).catch((err) => {
        const axiosError = err as AxiosError<{ message?: string }>;
        console.error('Get profile error:', axiosError.response?.data?.message || axiosError.message);
        navigate('/login');
      });
    } else {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user, getProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile({ name, email, phone, password });
      setMessage('Profile updated successfully');
      setPassword('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || axiosError.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block">Phone</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block">New Password (optional)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Leave blank to keep current password"
          />
        </div>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          Update Profile
        </button>
      </form>
      <button
        onClick={handleLogout}
        className="w-full p-2 mt-4 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;