import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserSidebar from './UserSidebar';
import { 
  Menu, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  LogOut, 
  Plus,
  Search,
  ChevronDown,
  Grid3X3,
  Settings
} from 'lucide-react';

const Navbar = ({ onSidebarToggle }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'other', label: 'Other' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
      if (!event.target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/explore?category=${category}`);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-velvet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Velvet Venue</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/') 
                  ? 'text-velvet-600 bg-velvet-50' 
                  : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
              }`}
            >
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative category-dropdown">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-velvet-600 hover:bg-velvet-50 transition-colors"
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryClick(category.value)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-velvet-50 hover:text-velvet-600 transition-colors"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Link
              to="/explore"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/explore') 
                  ? 'text-velvet-600 bg-velvet-50' 
                  : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Explore
            </Link>
            
            {isAuthenticated && (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath('/admin') 
                        ? 'text-velvet-600 bg-velvet-50' 
                        : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath('/dashboard') 
                      ? 'text-velvet-600 bg-velvet-50' 
                      : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/create-event"
                  className="flex items-center space-x-1 px-4 py-2 bg-velvet-600 text-white rounded-lg hover:bg-velvet-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={onSidebarToggle}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-velvet-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-velvet-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-velvet-600 hover:text-velvet-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-velvet-600 text-white rounded-lg hover:bg-velvet-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-velvet-600 hover:bg-velvet-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/') 
                    ? 'text-velvet-600 bg-velvet-50' 
                    : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/explore"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/explore') 
                    ? 'text-velvet-600 bg-velvet-50' 
                    : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActivePath('/dashboard') 
                        ? 'text-velvet-600 bg-velvet-50' 
                        : 'text-gray-700 hover:text-velvet-600 hover:bg-velvet-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create-event"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-velvet-600 text-white hover:bg-velvet-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-velvet-600 hover:bg-velvet-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-velvet-600 hover:bg-velvet-50"
                  >
                    Logout
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-velvet-600 hover:bg-velvet-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-velvet-600 text-white hover:bg-velvet-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
