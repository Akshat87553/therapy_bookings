import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
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
import Profile from './components/Profile';
import BookingHistory from './components/BookingHistory';

import Dashboard from './admin/pages/Dashboard';
import Clients from './admin/pages/Clients';
import ClientDetail from './admin/pages/ClientDetail';
import Analytics from './admin/pages/Analytics';
import Availability from './admin/pages/Availability';
import Fees from './admin/pages/Fees';
import Notifications from './admin/pages/Notifications';
import AdminProfile from './admin/pages/Profile';
import Layout from './admin/components/layout/Layout';
import BookingDetails from './admin/components/dashboard/BookingDetails';
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
    : <Navigate to="/login" replace />; // Redirect to general login
};

function AppContent() {
  const location = useLocation();
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
    document.title = 'Nainika Therapy';
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');
  const showNavAndFooter = !isAdminRoute && !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop>
        <div className="font-sans">
          {showNavAndFooter && <Navbar />}
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
            <Route path="/profile" element={
              <AuthRoute>
                <Profile />
              </AuthRoute>
            } />
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
              path="/admin"
              element={
                <AdminRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </AdminRoute>
              }
            >
              {/* index means "/admin" exactly → Dashboard */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Other admin routes */}
              <Route path="bookings/edit/:id" element={<BookingDetails />} />
              <Route path="bookings/create" element={<AdminCreateSessionPage />} />
              <Route path="availability" element={<Availability />} />
              
              <Route path="clients" element={<Clients />} />
              {/* FIX: Changed route param from :id to :email to match component logic */}
              <Route path="clients/:email" element={<ClientDetail />} />

              <Route path="fees" element={<Fees />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {showNavAndFooter && <Footer />}
        </div>
      </ScrollToTop>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}