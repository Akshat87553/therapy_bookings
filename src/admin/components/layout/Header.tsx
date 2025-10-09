import React, { useEffect, useState } from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

type HeaderProps = {
  onToggleSidebar?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get<{ _id: string; read: boolean }[]>('/api/notifications', {
          withCredentials: true,
        });
        const count = Array.isArray(res.data) ? res.data.filter((n) => !n.read).length : 0;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, []);

  const handleLogout = async () => {
 try {
      // use relative path (no hardcoded host)
      await axios.post('/api/auth/logout', {}, { withCredentials: true });

      // optionally navigate to login page or refresh auth state
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // show user-friendly message if you want
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex md:hidden">
        <button
          className="text-gray-600"
          onClick={() => {
            if (onToggleSidebar) onToggleSidebar();
          }}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="md:flex-1 flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <Link to="/admin/notifications" className="relative text-gray-600">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button className="flex items-center space-x-2" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-8 h-8 rounded-full bg-olive-700 flex items-center justify-center text-white font-medium">N</div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
