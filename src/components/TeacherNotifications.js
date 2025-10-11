// Teacher Notification Component
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { teacherNotificationService } from '../services/teacherNotificationService';
import { useToast } from '../hooks/useToast';
// Removed old CSS import - using Tailwind CSS now

const TeacherNotifications = () => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Check if user is a teacher
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'TEACHER';

  const loadTodaysClasses = useCallback(async () => {
    if (!currentUser?.name) return;
    
    try {
      const classes = await teacherNotificationService.getTodaysClasses(currentUser.name);
      setTodaysClasses(classes);
    } catch (error) {
      console.error('Failed to load today\'s classes:', error);
    }
  }, [currentUser?.name]);

  // Schedule conflict feature removed per requirements
  const checkConflicts = useCallback(async () => {
    // Conflicts feature disabled
  }, []);

  useEffect(() => {
    if (!isTeacher || !currentUser?.name) return;

    // Load today's classes
    loadTodaysClasses();
    
    // Conflicts disabled

    // Subscribe to notifications
    const unsubscribe = teacherNotificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      switch (notification.type) {
        case 'class_reminder':
          warning(notification.message, 6000);
          break;
        case 'time_conflict':
          warning(notification.message, 8000);
          break;
        default:
          info(notification.message, 4000);
      }
    });

    return () => {
      unsubscribe();
      teacherNotificationService.stopMonitoring();
    };
  }, [isTeacher, currentUser?.name, loadTodaysClasses, checkConflicts, warning, info]);

  const startMonitoring = () => {
    if (!currentUser?.name) return;
    
    teacherNotificationService.startMonitoring(currentUser.name, 5, 15);
    setIsMonitoring(true);
    success('Class monitoring started! You\'ll be notified 15 minutes before each class.');
  };

  const stopMonitoring = () => {
    teacherNotificationService.stopMonitoring();
    setIsMonitoring(false);
    info('Class monitoring stopped.');
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  const getNextClass = () => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    return todaysClasses.find(cls => {
      if (cls.day !== today) return false;
      
      const classTime = teacherNotificationService.parseTimeSlot(cls.time_slot);
      if (!classTime) return false;
      
      const classDateTime = new Date();
      classDateTime.setHours(classTime.hours, classTime.minutes, 0, 0);
      
      return classDateTime > now;
    });
  };

  const formatTimeSlot = (timeSlot) => {
    const timeMapping = {
      '8am-9am': '8:00 AM - 9:00 AM',
      '9am-10am': '9:00 AM - 10:00 AM',
      '10am-11am': '10:00 AM - 11:00 AM',
      '11am-12pm': '11:00 AM - 12:00 PM',
      '12pm-1pm': '12:00 PM - 1:00 PM',
      '1pm-2pm': '1:00 PM - 2:00 PM',
      '2pm-3pm': '2:00 PM - 3:00 PM',
      '3pm-4pm': '3:00 PM - 4:00 PM',
      '4pm-5pm': '4:00 PM - 5:00 PM',
      '5pm-6pm': '5:00 PM - 6:00 PM',
      '6pm-7pm': '6:00 PM - 7:00 PM',
      '7pm-8pm': '7:00 PM - 8:00 PM'
    };
    
    return timeMapping[timeSlot] || timeSlot;
  };

  if (!isTeacher) {
    return null;
  }

  const nextClass = getNextClass();

  return (
    <div className="teacher-notifications">
      <div className="notifications-header">
        <h3>
          <i className="fas fa-bell"></i>
          Teacher Notifications
        </h3>
        <div className="notification-controls">
          {!isMonitoring ? (
            <button className="btn btn-primary btn-sm" onClick={startMonitoring}>
              <i className="fas fa-play"></i> Start Monitoring
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={stopMonitoring}>
              <i className="fas fa-pause"></i> Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {/* Next Class Card */}
      {nextClass && (
        <div className="next-class-card">
          <div className="card-header">
            <i className="fas fa-clock"></i>
            <span>Next {nextClass.type === 'lab' ? 'Lab' : 'Class'}</span>
          </div>
          <div className="card-content">
            <h4>
              {nextClass.code || nextClass.name}
              {nextClass.type === 'lab' && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Lab
                </span>
              )}
            </h4>
            <p className="class-time">{formatTimeSlot(nextClass.time_slot)}</p>
            <p className="class-room">Room: {nextClass.room || 'TBA'}</p>
          </div>
        </div>
      )}

      {/* Today's Classes */}
      {todaysClasses.length > 0 && (
        <div className="todays-classes">
          <h4>
            <i className="fas fa-calendar-day"></i>
            Today's Classes ({todaysClasses.length})
          </h4>
          <div className="classes-list">
            {todaysClasses.map((cls, index) => (
              <div key={cls.id} className="class-item">
                <div className="class-time">{formatTimeSlot(cls.time_slot)}</div>
                <div className="class-details">
                  <div className="class-name">
                    {cls.code || cls.name}
                    {cls.type === 'lab' && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Lab
                      </span>
                    )}
                  </div>
                  <div className="class-room">{cls.room || 'TBA'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Notifications */}
      {notifications.length > 0 && (
        <div className="active-notifications">
          <div className="notifications-header">
            <h4>
              <i className="fas fa-bell"></i>
              Active Notifications ({notifications.length})
            </h4>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={dismissAllNotifications}
            >
              Dismiss All
            </button>
          </div>
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button 
                  className="notification-dismiss"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Classes Today */}
      {todaysClasses.length === 0 && (
        <div className="no-classes">
          <i className="fas fa-calendar-check"></i>
          <p>No classes scheduled for today!</p>
        </div>
      )}
    </div>
  );
};

export default TeacherNotifications;
