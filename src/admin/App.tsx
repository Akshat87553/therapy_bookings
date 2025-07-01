import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Analytics from './pages/Analytics';
import Availability from './pages/Availability';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Fees from './pages/Fees';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fees" element={<Fees />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;