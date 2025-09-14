// src/components/SystemHealth.js
import React from 'react';

const SystemHealth = ({ stats = {} }) => {
  const healthIndicators = [
    {
      label: 'System Uptime',
      value: stats.uptime || '99.9%',
      icon: 'fas fa-server',
      color: 'green'
    },
    {
      label: 'Performance',
      value: stats.performance || 'Excellent',
      icon: 'fas fa-tachometer-alt',
      color: 'blue'
    },
    {
      label: 'Storage',
      value: stats.storage || '2.3GB/5GB',
      icon: 'fas fa-database',
      color: 'orange'
    },
    {
      label: 'AI Status',
      value: stats.aiStatus || 'Active',
      icon: 'fas fa-brain',
      color: 'purple'
    }
  ];

  return (
    <div className="system-health card">
      <div className="card-header">
        <h3>System Health</h3>
        <i className="fas fa-heartbeat"></i>
      </div>
      <div className="card-body">
        <div className="health-indicators">
          {healthIndicators.map((indicator, index) => (
            <div key={index} className="health-item">
              <div className="health-icon">
                <i className={`${indicator.icon} ${indicator.color}`}></i>
              </div>
              <div className="health-info">
                <span className="health-value">{indicator.value}</span>
                <span className="health-label">{indicator.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;