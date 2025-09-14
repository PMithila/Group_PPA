// src/components/Header.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, viewMode, onViewModeChange, notifications = [], onNotificationDismiss }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadNotifications = safeNotifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('stms_token');
    navigate('/auth');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo" onClick={handleLogoClick}>
          <i className="fas fa-calendar-alt"></i>
          <span>EduSync</span>
        </div>
        <nav className="nav-tabs">
          <button 
            className={window.location.pathname === '/dashboard' ? 'active' : ''}
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-chart-pie"></i>
            Dashboard
          </button>
          <button 
            className={window.location.pathname === '/timetable' ? 'active' : ''}
            onClick={() => navigate('/timetable')}
          >
            <i className="fas fa-table"></i>
            Timetable
          </button>
          <button 
            className={window.location.pathname === '/classes' ? 'active' : ''}
            onClick={() => navigate('/classes')}
          >
            <i className="fas fa-chalkboard"></i>
            Classes
          </button>
          <button 
            className={window.location.pathname === '/faculty' ? 'active' : ''}
            onClick={() => navigate('/faculty')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            Faculty
          </button>
          <button 
            className={window.location.pathname === '/labs' ? 'active' : ''}
            onClick={() => navigate('/labs')}
          >
            <i className="fas fa-flask"></i>
            Labs
          </button>
          <button 
            className={window.location.pathname === '/import' ? 'active' : ''}
            onClick={() => navigate('/import')}
          >
            <i className="fas fa-upload"></i>
            Import
          </button>
        </nav>
      </div>
      
      <div className="header-right">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search timetables, teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
        </div>
        
        <div className="header-actions">
          <div className="notification-container">
            <button className="icon-btn" title="Notifications" onClick={handleNotificationClick}>
              <i className="fas fa-bell"></i>
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  <button onClick={() => setShowNotifications(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="notifications-list">
                  {safeNotifications.length > 0 ? (
                    safeNotifications.slice(0, 5).map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <button 
                          className="dismiss-btn"
                          onClick={() => onNotificationDismiss && onNotificationDismiss(notification.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <i className="fas fa-bell-slash"></i>
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button className="icon-btn" title="Settings" onClick={handleSettingsClick}>
            <i className="fas fa-cog"></i>
          </button>
          
          <div className="user-profile-container">
            <div className="user-profile" onClick={handleUserClick}>
              <div className="avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Admin'}</span>
                <span className="user-role">{user?.role || 'Administrator'}</span>
              </div>
              <i className="fas fa-chevron-down"></i>
            </div>
            
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-item" onClick={() => navigate('/profile')}>
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </div>
                <div className="user-menu-item" onClick={() => navigate('/settings')}>
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </div>
                <div className="user-menu-divider"></div>
                <div className="user-menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;