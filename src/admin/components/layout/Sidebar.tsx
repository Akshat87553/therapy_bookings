import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart, Calendar, Bell, Wallet } from 'lucide-react';

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-olive-700 font-bold text-2xl">TheraSync</span>
            <span className="text-gray-600 text-xs ml-1 mt-auto">PROFESSIONAL</span>
          </div>
        </div>

        <nav className="mt-6">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center px-4 py-3 ${isActive ? 'bg-olive-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/clients" className={({ isActive }) => `flex items-center px-4 py-3 ${isActive ? 'bg-olive-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5 mr-3" />
            <span>Clients</span>
          </NavLink>

          <NavLink to="/admin/analytics" className={({ isActive }) => `flex items-center px-4 py-3 ${isActive ? 'bg-olive-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            <BarChart className="w-5 h-5 mr-3" />
            <span>Analytics</span>
          </NavLink>

          <NavLink to="/admin/availability" className={({ isActive }) => `flex items-center px-4 py-3 ${isActive ? 'bg-olive-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Calendar className="w-5 h-5 mr-3" />
            <span>Availability</span>
          </NavLink>

          <NavLink to="/admin/fees" className={({ isActive }) => `flex items-center px-4 py-3 ${isActive ? 'bg-olive-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Wallet className="w-5 h-5 mr-3" />
            <span>Fees & Payment</span>
          </NavLink>

          <NavLink to="/admin/notifications" className={({ isActive }) => `flex items-center px-4 py-3 ${isActive ? 'bg-olive-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Bell className="w-5 h-5 mr-3" />
            <span>Notifications</span>
          </NavLink>
        </nav>

        <div className="absolute bottom-4 left-4">
          <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            <span className="sr-only">Help</span>
            <span className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-500">?</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
