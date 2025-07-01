import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from './templetes/template8-logo-01.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(o => !o);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-transparent mt-10">
      <div className="relative flex items-center justify-between w-full px-8 py-5">
        {/* Left: Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Logo" className="h-12 w-auto ml-4" />
        </Link>

        {/* Center: Desktop Menu (always centered) */}
        <div
          className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                     space-x-8 text-white uppercase tracking-wide"
        >
          <Link to="/about" className="hover:underline">about</Link>
          {[ 'classes', 'instructors', 'testimonials', 'contact'].map(item => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className={
                item === 'consultation' ? 'underline underline-offset-4' : 'hover:underline'
              }
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right: Auth / Social */}
        <div className="hidden md:flex items-center space-x-4 text-white">
          <a href="#" className="text-lg">f</a>
          {isAuthenticated ? (
            <>
              <Link to="/book" className="border border-white px-4 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition">
                Book Session
              </Link>
              <Link to="/bookings" className="hover:underline">My Bookings</Link>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="border border-white px-4 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={toggleMenu} className="md:hidden text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white absolute top-full left-0 right-0 transition-all duration-300 ${
        isOpen ? 'max-h-screen py-6' : 'max-h-0 overflow-hidden'
      }`}>
        <div className="px-8">
          <div className="flex flex-col space-y-4">
            {['about', 'classes', 'instructors', 'testimonials', 'contact'].map(item => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="nav-link text-left"
              >
                {item}
              </button>
            ))}

            {isAuthenticated ? (
              <>
                <Link to="/book" className="btn-primary text-center">Book Session</Link>
                <Link to="/bookings" className="nav-link">My Bookings</Link>
                <button onClick={handleLogout} className="nav-link text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary text-center">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;