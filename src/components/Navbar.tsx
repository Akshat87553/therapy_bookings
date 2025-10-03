// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Facebook } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from './templetes/template8-logo-01.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen((o) => !o);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    } else {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el2 = document.getElementById(id);
          if (el2) el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Desktop center links
  const centerLinks = [
    { label: 'Home', action: () => handleNavClick('/') },
    { label: 'About', action: () => handleNavClick('/about') },
    { label: 'Classes', id: 'classes' },
    { label: 'Instructors', id: 'instructors' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main"
        className={`fixed inset-x-0 top-0 z-50 transition-all` 
          
        }
      >
        <div className="relative flex items-center justify-between w-full px-6 md:px-8 py-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img src={logo} alt="Logo" className="h-12 w-auto ml-1" />
          </Link>

          {/* Center: Desktop Menu */}
          <div
            className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                       space-x-8 text-white uppercase tracking-wide select-none"
            aria-hidden={false}
          >
            {centerLinks.map((item) =>
              item.action ? (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="hover:underline text-white"
                  type="button"
                >
                  {item.label.toLowerCase()}
                </button>
              ) : (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id!)}
                  className="hover:underline text-white"
                  type="button"
                >
                  {item.label.toLowerCase()}
                </button>
              )
            )}
          </div>

          {/* Right: Auth / Social (desktop) */}
          <div className="hidden md:flex items-center space-x-4 text-white">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80">
              <Facebook size={18} />
            </a>

            {isAuthenticated ? (
              <>
                <Link to="/book" className="border border-white px-4 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition">
                  Book Session
                </Link>
                <Link to="/bookings" className="hover:underline">
                  My Bookings
                </Link>
                <button onClick={handleLogout} className="hover:underline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/register" className="border border-white px-4 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle - always visible, with background and z-index */}
          <button
            onClick={toggleMenu}
            className="md:hidden z-50 p-2 rounded-full bg-black/50 hover:bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            {!isOpen ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        // pointer-events-none when closed prevents overlay blocking the toggle
        className={`fixed inset-0 z-40 flex flex-col justify-between p-6 bg-white text-gray-900 transform transition-transform duration-400 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top: Logo + Close */}
        <div className="flex items-center justify-between">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>
          <button onClick={toggleMenu} aria-label="Close menu" type="button" className="p-2">
            <X size={28} />
          </button>
        </div>

        {/* Middle: Home, About, and in-page links */}
        <div className="flex flex-col items-center mt-8 space-y-6">
          <button onClick={() => handleNavClick('/')} className="text-2xl font-light uppercase tracking-widest" type="button">Home</button>
          <button onClick={() => handleNavClick('/about')} className="text-2xl font-light uppercase tracking-widest" type="button">About</button>
          <button onClick={() => scrollToSection('classes')} className="text-2xl font-light uppercase tracking-widest" type="button">Classes</button>
          <button onClick={() => scrollToSection('instructors')} className="text-2xl font-light uppercase tracking-widest" type="button">Instructors</button>
          <button onClick={() => scrollToSection('testimonials')} className="text-2xl font-light uppercase tracking-widest" type="button">Testimonials</button>
          <button onClick={() => scrollToSection('contact')} className="text-2xl font-light uppercase tracking-widest" type="button">Contact</button>
        </div>

        {/* Bottom: Social + CTA */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-6">
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={22} /></a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook size={22} /></a>
          </div>

          <button onClick={() => handleNavClick('/book-a-call')} className="w-full max-w-xs px-6 py-3 border-2 border-gray-800 rounded-full text-sm font-semibold tracking-wider hover:bg-gray-800 hover:text-white transition" type="button">BOOK A CALL</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
