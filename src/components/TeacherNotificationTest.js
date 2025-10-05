// Teacher Notification Test Component
import React, { useState, useEffect } from 'react';
import { teacherNotificationService } from '../services/teacherNotificationService';
import { useToast } from '../hooks/useToast';

const TeacherNotificationTest = () => {
  const { success, warning, info } = useToast();
  const [testTeacher, setTestTeacher] = useState('Dr. Smith');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    // Subscribe to notifications for testing
    const unsubscribe = teacherNotificationService.subscribe((notification) => {
      console.log('Test notification received:', notification);
      
      switch (notification.type) {
        case 'class_reminder':
          warning(`TEST: ${notification.message}`, 6000);
          break;
        case 'time_conflict':
          warning(`TEST: ${notification.message}`, 8000);
          break;
        default:
          info(`TEST: ${notification.message}`, 4000);
      }
    });

    return () => {
      unsubscribe();
      teacherNotificationService.stopMonitoring();
    };
  }, []);

  const testUpcomingClasses = async () => {
    try {
      const classes = await teacherNotificationService.checkUpcomingClasses(testTeacher, 60);
      setUpcomingClasses(classes);
      success(`Found ${classes.length} upcoming classes for ${testTeacher}`);
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  const testConflicts = async () => {
    try {
      const conflicts = await teacherNotificationService.checkClassConflicts(testTeacher);
      if (conflicts.length > 0) {
        warning(`Found ${conflicts.length} conflicts for ${testTeacher}`);
      } else {
        info(`No conflicts found for ${testTeacher}`);
      }
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  const startTestMonitoring = () => {
    teacherNotificationService.startMonitoring(testTeacher, 1, 5); // Check every minute, notify 5 minutes before
    setIsMonitoring(true);
    success(`Started monitoring for ${testTeacher}`);
  };

  const stopTestMonitoring = () => {
    teacherNotificationService.stopMonitoring();
    setIsMonitoring(false);
    info('Stopped monitoring');
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <h3>Teacher Notification Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Test Teacher Name: </label>
        <input 
          type="text" 
          value={testTeacher} 
          onChange={(e) => setTestTeacher(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={testUpcomingClasses} style={{ padding: '8px 16px' }}>
          Test Upcoming Classes
        </button>
        <button onClick={testConflicts} style={{ padding: '8px 16px' }}>
          Test Conflicts
        </button>
        {!isMonitoring ? (
          <button onClick={startTestMonitoring} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white' }}>
            Start Monitoring
          </button>
        ) : (
          <button onClick={stopTestMonitoring} style={{ padding: '8px 16px', background: '#f44336', color: 'white' }}>
            Stop Monitoring
          </button>
        )}
      </div>

      {upcomingClasses.length > 0 && (
        <div>
          <h4>Upcoming Classes:</h4>
          <ul>
            {upcomingClasses.map((cls, index) => (
              <li key={index}>
                {cls.code} - {cls.name} at {cls.time_slot} in {cls.room || 'TBA'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p><strong>Note:</strong> This is a test component. In production, notifications will automatically appear for teachers based on their scheduled classes.</p>
        <p><strong>Monitoring:</strong> Checks every minute for classes starting within 5 minutes.</p>
      </div>
    </div>
  );
};

export default TeacherNotificationTest;
