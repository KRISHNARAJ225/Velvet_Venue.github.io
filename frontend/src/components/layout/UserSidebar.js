import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  X,
  Menu,
  Home,
  Search,
  Plus,
  Heart,
  Ticket,
  CreditCard,
  HelpCircle,
  Shield,
  Bell,
  ChevronRight
} from 'lucide-react';

const UserSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: 'Home',
      href: '/',
      description: 'Back to homepage'
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Explore Events',
      href: '/explore',
      description: 'Discover events'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'My Events',
      href: '/dashboard',
      description: 'Manage your events'
    },
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Create Event',
      href: '/create-event',
      description: 'Host a new event'
    },
    {
      icon: <Ticket className="w-5 h-5" />,
      label: 'My Tickets',
      href: '/tickets',
      description: 'View your tickets'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Favorites',
      href: '/favorites',
      description: 'Saved events'
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Profile',
      href: '/profile',
      description: 'Account settings'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      href: '/settings',
      description: 'Preferences'
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Billing',
      href: '/billing',
      description: 'Payment methods'
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help & Support',
      href: '/help',
      description: 'Get help'
    }
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Account Menu</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user?.role}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500">Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500">Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-6">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActivePath(item.href)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`flex-shrink-0 ${
                isActivePath(item.href) ? 'text-white' : 'text-gray-400'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs ${
                  isActivePath(item.href) ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${
                isActivePath(item.href) ? 'text-white' : 'text-gray-400'
              }`} />
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 space-y-3">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
          <Shield className="w-4 h-4" />
          <span>Privacy Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* App Version */}
      <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-200">
        Velvet Venue v1.0.0
      </div>
    </div>
  );
};

export default UserSidebar;
