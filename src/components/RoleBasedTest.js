// Role-based Dashboard Test Component
import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleBasedTest = () => {
  const { currentUser } = useAuth();

  const testUsers = [
    { name: 'Admin User', email: 'admin@school.edu', role: 'admin' },
    { name: 'Teacher User', email: 'teacher@school.edu', role: 'teacher' }
  ];

  const simulateLogin = (user) => {
    // This would normally be handled by the auth system
    console.log(`Simulating login as ${user.role}:`, user);
    alert(`Would login as ${user.name} (${user.role})`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      borderRadius: '8px', 
      margin: '20px',
      border: '2px solid #e2e8f0'
    }}>
      <h3>Role-based Dashboard Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Current User:</h4>
        {currentUser ? (
          <div style={{ 
            padding: '10px', 
            background: 'white', 
            borderRadius: '5px',
            border: '1px solid #cbd5e0'
          }}>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
          </div>
        ) : (
          <p style={{ color: '#718096' }}>Not logged in</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Different Roles:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {testUsers.map((user, index) => (
            <button
              key={index}
              onClick={() => simulateLogin(user)}
              style={{
                padding: '10px 15px',
                background: user.role === 'admin' ? '#4299e1' : '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Login as {user.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Expected Behavior:</h4>
        <ul style={{ color: '#4a5568', lineHeight: '1.6' }}>
          <li><strong>Admin:</strong> Full access to all CRUD operations, admin dashboard, classes, faculty, labs management</li>
          <li><strong>Teacher:</strong> Teacher dashboard with personal schedule, notifications, timetable view (read-only)</li>
          <li><strong>Access Control:</strong> Teachers cannot access admin-only pages (classes, faculty, labs, import)</li>
        </ul>
      </div>

      <div style={{ 
        background: '#fffaf0', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #f6e05e'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#744210' }}>
          <i className="fas fa-info-circle"></i> How to Test:
        </h4>
        <ol style={{ margin: 0, color: '#744210', lineHeight: '1.6' }}>
          <li>Login with admin credentials to see admin dashboard</li>
          <li>Login with teacher credentials to see teacher dashboard</li>
          <li>Try accessing /classes, /faculty, /labs as a teacher (should show access denied)</li>
          <li>Check that teachers see notifications and their personal schedule</li>
          <li>Verify admins have full CRUD access to all management pages</li>
        </ol>
      </div>
    </div>
  );
};

export default RoleBasedTest;
