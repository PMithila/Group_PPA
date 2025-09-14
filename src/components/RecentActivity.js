// src/components/RecentActivity.js
import React from 'react';

const RecentActivity = () => {
  // Sample activity data
  const activities = [
    {
      id: 1,
      type: 'timetable',
      action: 'published',
      target: 'Fall 2024 Timetable',
      user: 'Admin User',
      time: '2 hours ago',
      icon: 'fas fa-calendar-alt',
      color: '#4361ee'
    },
    {
      id: 2,
      type: 'substitution',
      action: 'requested',
      target: 'CS101 - Period 3',
      user: 'Dr. Smith',
      time: '4 hours ago',
      icon: 'fas fa-user-clock',
      color: '#f72585'
    },
    {
      id: 3,
      type: 'substitution',
      action: 'approved',
      target: 'MATH101 - Period 2',
      user: 'Admin User',
      time: '6 hours ago',
      icon: 'fas fa-check-circle',
      color: '#4caf50'
    },
    {
      id: 4,
      type: 'teacher',
      action: 'added',
      target: 'Prof. Johnson',
      user: 'Admin User',
      time: '1 day ago',
      icon: 'fas fa-user-plus',
      color: '#9c27b0'
    },
    {
      id: 5,
      type: 'room',
      action: 'updated',
      target: 'Lab 3 Capacity',
      user: 'Admin User',
      time: '2 days ago',
      icon: 'fas fa-building',
      color: '#ff9800'
    }
  ];

  const getActionText = (activity) => {
    switch (activity.type) {
      case 'timetable':
        return `${activity.user} ${activity.action} the ${activity.target}`;
      case 'substitution':
        return `${activity.user} ${activity.action} a substitution for ${activity.target}`;
      case 'teacher':
        return `${activity.user} ${activity.action} a new teacher: ${activity.target}`;
      case 'room':
        return `${activity.user} ${activity.action} room information: ${activity.target}`;
      default:
        return `${activity.user} performed an action on ${activity.target}`;
    }
  };

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h3>Recent Activity</h3>
        <button className="btn-icon" title="View all activity">
          <i className="fas fa-ellipsis-h"></i>
        </button>
      </div>
      
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
            >
              <i className={activity.icon}></i>
            </div>
            
            <div className="activity-content">
              <p>{getActionText(activity)}</p>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="activity-footer">
        <button className="btn btn-secondary btn-block">
          <i className="fas fa-history"></i> View Full Activity Log
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;