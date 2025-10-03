// src/components/ProfessionalHeader.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProfessionalHeader.css';

const ProfessionalHeader = ({ user, notifications = [], onNotificationDismiss }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadNotifications = safeNotifications.filter(n => !n.read).length;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const navigationItems = [
    { path: '/dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard', description: 'Overview & Analytics' },
    { path: '/timetable', icon: 'fas fa-calendar-alt', label: 'Timetable', description: 'Schedule Management' },
    { path: '/classes', icon: 'fas fa-chalkboard', label: 'Classes', description: 'Class Management' },
    { path: '/faculty', icon: 'fas fa-chalkboard-teacher', label: 'Faculty', description: 'Teacher Management' },
    { path: '/labs', icon: 'fas fa-flask', label: 'Labs', description: 'Laboratory Resources' },
    { path: '/import', icon: 'fas fa-upload', label: 'Import', description: 'Data Import Tools' }
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement global search functionality
    }
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('stms_token');
    navigate('/auth');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="professional-header">
      <div className="header-container">
        {/* Logo and Branding */}
        <div className="header-brand" onClick={handleLogoClick}>
          <div className="brand-logo">
            <div className="logo-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="brand-text">
              <h1 className="brand-name">EduSync</h1>
              <span className="brand-tagline">Professional</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="header-navigation">
          {navigationItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="nav-icon">
                <i className={item.icon}></i>
              </div>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </div>
          ))}
        </nav>

        {/* Right Section */}
        <div className="header-actions">
          {/* Time Display */}
          <div className="time-display">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="notification-container">
            <button
              className="action-button notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-panel">
                <div className="panel-header">
                  <h3>Notifications</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowNotifications(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="notifications-content">
                  {safeNotifications.length > 0 ? (
                    safeNotifications.slice(0, 5).map(notification => (
                      <div
                        key={notification.id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      >
                        <div className="notification-icon">
                          <i className="fas fa-info-circle"></i>
                        </div>
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <button
                          className="notification-dismiss"
                          onClick={() => onNotificationDismiss && onNotificationDismiss(notification.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-notifications">
                      <i className="fas fa-bell-slash"></i>
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="action-button"
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <i className="fas fa-cog"></i>
          </button>

          {/* User Profile */}
          <div className="user-profile-container">
            <div
              className="user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'Administrator'}</span>
                <span className="user-role">{user?.role || 'Admin'}</span>
              </div>
              <i className="fas fa-chevron-down dropdown-arrow"></i>
            </div>

            {showUserMenu && (
              <div className="user-menu-panel">
                <div className="user-menu-header">
                  <div className="user-avatar large">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-info">
                    <h4>{user?.name || 'Administrator'}</h4>
                    <p>{user?.email || 'admin@edusync.com'}</p>
                  </div>
                </div>
                <div className="user-menu-items">
                  <div className="menu-item" onClick={() => navigate('/profile')}>
                    <i className="fas fa-user"></i>
                    <span>My Profile</span>
                  </div>
                  <div className="menu-item" onClick={() => navigate('/settings')}>
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                  </div>
                  <div className="menu-item" onClick={() => navigate('/help')}>
                    <i className="fas fa-question-circle"></i>
                    <span>Help & Support</span>
                  </div>
                  <div className="menu-divider"></div>
                  <div className="menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;
