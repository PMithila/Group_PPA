// src/components/Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, notifications = [], onNotificationDismiss }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const role = currentUser?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  // notifications UI not used in sidebar; keep minimal state
  const [activeSection, setActiveSection] = useState('navigation');

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('stms_token');
    navigate('/auth');
  };

  const navigationItems = [
    { path: '/dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard', color: 'blue' },
    { path: '/timetable', icon: 'fas fa-table', label: 'Timetable', color: 'green' },
    { path: '/schedule-change-requests', icon: 'fas fa-exchange-alt', label: 'Schedule Changes', color: 'teal' },
    { path: '/leave-requests', icon: 'fas fa-plane-departure', label: 'Leave Requests', color: 'yellow' }
  ];

  if (!isTeacher) {
    navigationItems.splice(2, 0,
      { path: '/classes', icon: 'fas fa-chalkboard', label: 'Subjects', color: 'purple' },
      { path: '/faculty', icon: 'fas fa-chalkboard-teacher', label: 'Faculty', color: 'orange' },
      { path: '/labs', icon: 'fas fa-flask', label: 'Labs', color: 'red' },
      { path: '/subjects', icon: 'fas fa-book-open', label: 'Subject Library', color: 'indigo' },
      { path: '/departments', icon: 'fas fa-building', label: 'Departments', color: 'teal' }
    );
  }

  if (isAdmin) {
    navigationItems.push({
      path: '/class-automation',
      icon: 'fas fa-robot',
      label: 'Class Automation',
      color: 'slate'
    });
  }

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
      teal: 'from-teal-500 to-teal-600',
      yellow: 'from-yellow-500 to-yellow-600',
      pink: 'from-pink-500 to-pink-600',
      slate: 'from-slate-500 to-slate-700'
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
                        location.pathname === item.path
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
                    {/* <p><i className="fas fa-calendar mr-2"></i>Member since 2024</p> */}
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
