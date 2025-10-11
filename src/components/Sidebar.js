// src/components/Sidebar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { search } from '../api';

const Sidebar = ({ isOpen, onClose, notifications = [], onNotificationDismiss }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  // notifications UI not used in sidebar; keep minimal state
  const [activeSection, setActiveSection] = useState('navigation');

  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadNotifications = safeNotifications.filter(n => !n.read).length;

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchLoading(true);
      try {
        const results = await search(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setShowSearchResults(true);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result) => {
    // Navigate based on result type and ID
    if (result.type === 'class') {
      navigate(`/classes?id=${result.id}`);
    } else if (result.type === 'teacher') {
      navigate(`/faculty?id=${result.id}`);
    } else if (result.type === 'subject') {
      navigate(`/subjects?id=${result.id}`);
    } else if (result.type === 'department') {
      navigate(`/departments?id=${result.id}`);
    } else if (result.type === 'lab') {
      navigate(`/labs?id=${result.id}`);
    }
    setShowSearchResults(false);
    setSearchQuery('');
    onClose(); // Close sidebar after navigation
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('stms_token');
    navigate('/auth');
  };

  const navigationItems = [
    { path: '/dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard', color: 'blue' },
    { path: '/timetable', icon: 'fas fa-table', label: 'Timetable', color: 'green' },
    { path: '/classes', icon: 'fas fa-chalkboard', label: 'Classes', color: 'purple' },
    { path: '/faculty', icon: 'fas fa-chalkboard-teacher', label: 'Faculty', color: 'orange' },
    { path: '/labs', icon: 'fas fa-flask', label: 'Labs', color: 'red' },
    { path: '/subjects', icon: 'fas fa-book-open', label: 'Subjects', color: 'indigo' },
    { path: '/departments', icon: 'fas fa-building', label: 'Departments', color: 'teal' },
    { path: '/import', icon: 'fas fa-upload', label: 'Import', color: 'pink' }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
      teal: 'from-teal-500 to-teal-600',
      pink: 'from-pink-500 to-pink-600'
    };
    return colorMap[color] || 'from-slate-500 to-slate-600';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md border-r border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-calendar-alt text-white text-lg"></i>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  EduSync
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <i className="fas fa-times text-slate-400"></i>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search timetables, teachers..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearch}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-400"
              />
              {searchLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 z-50 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          result.type === 'class' ? 'bg-blue-100 text-blue-600' :
                          result.type === 'teacher' ? 'bg-green-100 text-green-600' :
                          result.type === 'subject' ? 'bg-purple-100 text-purple-600' :
                          result.type === 'department' ? 'bg-orange-100 text-orange-600' :
                          result.type === 'lab' ? 'bg-red-100 text-red-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          <i className={`${
                            result.type === 'class' ? 'fas fa-chalkboard' :
                            result.type === 'teacher' ? 'fas fa-chalkboard-teacher' :
                            result.type === 'subject' ? 'fas fa-book-open' :
                            result.type === 'department' ? 'fas fa-building' :
                            result.type === 'lab' ? 'fas fa-flask' :
                            'fas fa-search'
                          } text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{result.title}</p>
                          <p className="text-xs text-slate-500 truncate">{result.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    <i className="fas fa-search text-2xl mb-2"></i>
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setActiveSection('navigation')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'navigation'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-compass mr-2"></i>
                Navigation
              </button>
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'profile'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-user mr-2"></i>
                Profile
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation Section */}
            {activeSection === 'navigation' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Navigation</h3>
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        window.location.pathname === item.path
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${getColorClasses(item.color)}`}>
                        <i className={`${item.icon} text-white text-sm`}></i>
                      </div>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile</h3>
                
                {/* User Info */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                      <i className="fas fa-user text-white text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {currentUser?.name || 'Admin User'}
                      </h4>
                      <p className="text-sm text-slate-600 capitalize">
                        {currentUser?.role || 'Administrator'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><i className="fas fa-envelope mr-2"></i>{currentUser?.email || 'admin@example.com'}</p>
                    <p><i className="fas fa-calendar mr-2"></i>Member since 2024</p>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigation('/settings')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <i className="fas fa-user-edit text-slate-400"></i>
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <i className="fas fa-sign-out-alt text-red-400"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;