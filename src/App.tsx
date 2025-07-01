// src/App.tsx
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './utils/ScrollToTop';

import Hero from './components/Hero';
import About from './components/About';
import Classes from './components/Classes';
import Instructors from './components/Instructors';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import BookingPage from './components/BookingPage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ForgotPassword from './context/ForgotPassword';
import AboutPage from './components/AboutPage';


import Dashboard from './admin/pages/Dashboard';
import Clients from './admin/pages/Clients';
import ClientDetail from './admin/pages/ClientDetail';
import Analytics from './admin/pages/Analytics';
import Availability from './admin/pages/Availability';
import Fees from './admin/pages/Fees';
import Notifications from './admin/pages/Notifications';
import Profile from './admin/pages/Profile';
import Layout from './admin/components/layout/Layout';
import BookingDetails from './admin/components/dashboard/BookingDetails';
import BookingHistory from './components/BookingHistory';
import AdminCreateSessionPage from './admin/components/dashboard/AdminSessionPage';


import 'aos/dist/aos.css';
import './admin/styles/globals.css';
import AOS from 'aos';
import axios from 'axios';

// at app startup (e.g. in index.tsx):
axios.defaults.withCredentials = true;

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.role === 'admin'
    ? <>{children}</>
    : <Navigate to="/admin" replace />;
};

const isAdminRoute = location.pathname.startsWith('/admin');
const isBookingPage = location.pathname.startsWith('/book');
const isRegisterPage = location.pathname.startsWith('/login');
const isLoginPage = location.pathname.startsWith('/register');
const isBookingHistoryPage = location.pathname.startsWith('/bookings');



function AppContent() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
    document.title = 'Nainika Therapy';
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop>
          <div className="font-sans">
            {!isAdminRoute && !isBookingPage && !isRegisterPage && !isLoginPage && <Navbar />}
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/"
                element={
                  <>
                    <Hero /> <About /> <Classes /> <Instructors />
                    <Testimonials /> <FAQ /> <Contact />
                  </>
                }
              />

              {/* Authenticated users */}
              <Route
                path="/book"
                element={
                  <AuthRoute>
                    <BookingPage />
                  </AuthRoute>
                }
              />
              <Route path="/bookings" element={
                <AuthRoute>
                  <BookingHistory />
                </AuthRoute>
              } />

                      {/* ═══════ Admin area (one parent with nested children) ═══════ */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <div className="admin-panel">
                <Layout>
                  {/* Outlet is where nested admin pages will render */}
                  <Outlet />
                </Layout>
              </div>
            </AdminRoute>
          }
        >
          {/* “index” means “/admin” exactly → Dashboard */}
          <Route index element={<Dashboard />} />

          {/* /admin/bookings/edit/:id */}
          <Route path="bookings/edit/:id" element={<BookingDetails />} />

          {/* /admin/bookings/create */}
          <Route path="bookings/create" element={<AdminCreateSessionPage />} />

          {/* /admin/availability */}
          <Route path="availability" element={<Availability />} />

          {/* /admin/clients */}
          <Route index={false} /> {/* (no-op; just here for clarity) */}
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />

          {/* /admin/fees */}
          <Route path="fees" element={<Fees />} />

          {/* /admin/analytics */}
          <Route path="analytics" element={<Analytics />} />

          {/* /admin/notifications */}
          <Route path="notifications" element={<Notifications />} />

          {/* /admin/profile */}
          <Route path="profile" element={<Profile />} />
        </Route>
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </div>
        </ScrollToTop>
        {!isAdminRoute && !isBookingPage && !isRegisterPage && !isLoginPage && isBookingHistoryPage && <Footer />}
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
