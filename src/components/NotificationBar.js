// src/components/NotificationBar.js
import React from 'react';

const NotificationBar = ({ notifications = [], onDismiss }) => {
  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  
  if (safeNotifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'error': return 'fa-times-circle';
      default: return 'fa-info-circle';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="notification-bar">
      {safeNotifications.slice(0, 3).map(notification => (
        <div key={notification.id} className={`notification ${getNotificationColor(notification.type)}`}>
          <div className="notification-content">
            <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
            <span>{notification.message}</span>
          </div>
          <button 
            className="notification-dismiss"
            onClick={() => onDismiss && onDismiss(notification.id)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBar;