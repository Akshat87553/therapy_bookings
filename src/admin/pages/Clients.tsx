// src/pages/Clients.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ClientCard from '../components/clients/ClientCard';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  lastSession: string | null;
}

const Clients: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
            throw new Error('Unauthorized access. Please log in as an admin.');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleClientClick = (email: string) => {
    // FIX: Navigates to the correct, updated route.
    navigate(`/admin/clients/${email}`);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-3xl font-semibold text-gray-800">Clients</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* Loading State */}
      {loading ? (
        <p className="text-center py-6 text-gray-600">Loading clients...</p>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              {searchTerm
                ? 'No clients match your search.'
                : 'No clients available.'}
            </p>
          ) : (
            /* Vertical stack: each card appears one below the other */
            <div className="flex flex-col space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleClientClick(user.email)}
                  className="cursor-pointer"
                >
                  <ClientCard
                    name={user.name}
                    email={user.email}
                    lastSession={user.lastSession}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Clients;
