// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfessionalHeader from './ProfessionalHeader';
import ProfessionalFooter from './ProfessionalFooter';
import './Layout.css';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Timetable optimization completed successfully",
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      message: "New faculty member added to the system",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: 3,
      message: "Weekly backup completed",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ]);

  const handleNotificationDismiss = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  return (
    <div className="app-layout">
      <ProfessionalHeader 
        user={currentUser}
        notifications={notifications}
        onNotificationDismiss={handleNotificationDismiss}
      />
      <main className="main-content">
        {children}
      </main>
      <ProfessionalFooter />
    </div>
  );
};

export default Layout;
