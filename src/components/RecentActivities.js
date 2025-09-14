// Enhanced Recent Activities Component
import React from 'react';

const RecentActivities = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      system: 'fas fa-cog',
      upload: 'fas fa-upload',
      generate: 'fas fa-robot',
      user: 'fas fa-user',
      edit: 'fas fa-edit',
      delete: 'fas fa-trash',
      create: 'fas fa-plus',
      login: 'fas fa-sign-in-alt',
      logout: 'fas fa-sign-out-alt'
    };
    return icons[type] || 'fas fa-info-circle';
  };

  const getActivityColor = (priority) => {
    const colors = {
      high: '#e53e3e',
      medium: '#ed8936',
      low: '#38a169'
    };
    return colors[priority] || '#4299e1';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="recent-activities-card">
        <div className="activities-header">
          <h3>Recent Activities</h3>
          <i className="fas fa-history"></i>
        </div>
        <div className="empty-state">
          <i className="fas fa-clock"></i>
          <p>No recent activities</p>
        </div>
        
        <style jsx="true">{`
          .recent-activities-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            animation: slideInUp 0.6s ease-out;
          }
          
          .activities-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          }
          
          .activities-header h3 {
            margin: 0;
            color: #2d3748;
            font-size: 1.2rem;
            font-weight: 700;
          }
          
          .activities-header i {
            color: #667eea;
            font-size: 1.1rem;
          }
          
          .empty-state {
            text-align: center;
            padding: 2rem;
            color: #718096;
          }
          
          .empty-state i {
            font-size: 2rem;
            margin-bottom: 1rem;
            opacity: 0.5;
            display: block;
          }
          
          .empty-state p {
            margin: 0;
            font-size: 1rem;
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="recent-activities-card">
      <div className="activities-header">
        <h3>Recent Activities</h3>
        <i className="fas fa-history"></i>
      </div>
      
      <div className="activities-list">
        {activities.slice(0, 10).map((activity, index) => (
          <div key={activity.id || index} className="activity-item">
            <div className="activity-icon" style={{ backgroundColor: getActivityColor(activity.priority) }}>
              <i className={getActivityIcon(activity.type)}></i>
            </div>
            <div className="activity-content">
              <p className="activity-message">{activity.message}</p>
              <div className="activity-meta">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
              </div>
            </div>
            <div className={`priority-indicator ${activity.priority}`}></div>
          </div>
        ))}
      </div>
      
      <style jsx="true">{`
        .recent-activities-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: slideInUp 0.6s ease-out;
          height: fit-content;
        }
        
        .activities-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        }
        
        .activities-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .activities-header i {
          color: #667eea;
          font-size: 1.1rem;
        }
        
        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(248, 250, 252, 0.5);
          transition: all 0.3s ease;
          position: relative;
          border-left: 3px solid transparent;
        }
        
        .activity-item:hover {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(5px);
          border-left-color: #667eea;
        }
        
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        
        .activity-content {
          flex: 1;
          min-width: 0;
        }
        
        .activity-message {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 0.95rem;
          font-weight: 500;
          line-height: 1.4;
        }
        
        .activity-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #718096;
        }
        
        .activity-user {
          font-weight: 600;
          color: #4a5568;
        }
        
        .activity-time {
          font-style: italic;
        }
        
        .priority-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }
        
        .priority-indicator.high {
          background: #e53e3e;
          box-shadow: 0 0 10px rgba(229, 62, 62, 0.3);
        }
        
        .priority-indicator.medium {
          background: #ed8936;
          box-shadow: 0 0 10px rgba(237, 137, 54, 0.3);
        }
        
        .priority-indicator.low {
          background: #38a169;
          box-shadow: 0 0 10px rgba(56, 161, 105, 0.3);
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .recent-activities-card {
            padding: 1rem;
          }
          
          .activity-item {
            padding: 0.8rem;
            gap: 0.8rem;
          }
          
          .activity-icon {
            width: 35px;
            height: 35px;
            font-size: 0.8rem;
          }
          
          .activity-message {
            font-size: 0.9rem;
          }
          
          .activity-meta {
            font-size: 0.75rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecentActivities;
