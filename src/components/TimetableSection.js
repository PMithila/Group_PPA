// src/components/TimetableSection.js
import React, { useState, useEffect } from 'react';
import GenerateScheduleModal from './GenerateScheduleModal';
import { getTimetable, saveTimetable } from '../services/timetableService';

const TimetableSection = ({ user, onGenerateSchedule, systemData }) => {
  const [showModal, setShowModal] = useState(false);
  const [timetableData, setTimetableData] = useState([]);
  const [selectedView, setSelectedView] = useState('institutional');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safe access to user role with default value
  const userRole = user?.role || 'STAFF';

  const loadTimetableData = React.useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      const data = await getTimetable(selectedView, user);
      setTimetableData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading timetable:', err);
      setError('Failed to load timetable data');
      // Fallback to sample data
      setTimetableData(getSampleData());
    } finally {
      setLoading(false);
    }
  }, [selectedView, user]);

  useEffect(() => {
    loadTimetableData();
  }, [userRole, selectedView, loadTimetableData]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getSampleData = () => {
    return [
      {
        time: '8:00-9:00',
        days: {
          Monday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
          Tuesday: null,
          Wednesday: { type: 'lab', content: 'Physics Lab (Lab 3)', teacher: 'Dr. Johnson' },
          Thursday: null,
          Friday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
          Saturday: null,
          Sunday: null
        }
      },
      {
        time: '9:00-10:00',
        days: {
          Monday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
          Tuesday: { type: 'lecture', content: 'PHY101 (Room C10)', teacher: 'Dr. Patel' },
          Wednesday: null,
          Thursday: { type: 'lecture', content: 'ENG101 (Room D2)', teacher: 'Dr. Brown' },
          Friday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
          Saturday: null,
          Sunday: null
        }
      },
      // More sample data...
      {
        time: '10:00-11:00',
        days: {
          Monday: { type: 'lab', content: 'CHEM101 (Lab 1)', teacher: 'Dr. Wilson' },
          Tuesday: { type: 'lecture', content: 'BIO101 (Room A12)', teacher: 'Dr. Garcia' },
          Wednesday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
          Thursday: { type: 'lab', content: 'PHY101 (Lab 2)', teacher: 'Dr. Patel' },
          Friday: null,
          Saturday: null,
          Sunday: null
        }
      }
    ];
  };

  const handleScheduleItemClick = (item) => {
    if (item) {
      if (userRole === 'ADMIN') {
        alert(`Class: ${item.content}\nTeacher: ${item.teacher}\nClick "Generate Schedule" to optimize or edit.`);
      } else if (userRole === 'TEACHER') {
        alert(`Class: ${item.content}\nClick to request a substitute teacher.`);
      } else {
        alert(`Class: ${item.content}\nTeacher: ${item.teacher}`);
      }
    }
  };

  const handleScheduleGenerated = async (newSchedule) => {
    try {
      await saveTimetable(newSchedule, user);
      setTimetableData(newSchedule);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving timetable:', err);
      alert('Failed to save timetable: ' + err.message);
    }
  };

  const handleGenerateClick = () => {
    if (typeof onGenerateSchedule === 'function') {
      onGenerateSchedule();
    } else {
      setShowModal(true);
    }
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  if (loading) {
    return (
      <div className="timetable-section">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-section">
      <div className="section-header">
        <h2 className="section-title">
          {selectedView === 'institutional' ? 'Institutional Timetable' : 
           selectedView === 'teacher' ? 'My Schedule' : 'Room Schedule'}
        </h2>
        <div className="view-selector">
          <button 
            className={selectedView === 'institutional' ? 'btn btn-active' : 'btn'}
            onClick={() => handleViewChange('institutional')}
          >
            Institutional
          </button>
          {userRole === 'TEACHER' && (
            <button 
              className={selectedView === 'teacher' ? 'btn btn-active' : 'btn'}
              onClick={() => handleViewChange('teacher')}
            >
              My Schedule
            </button>
          )}
          <button 
            className={selectedView === 'room' ? 'btn btn-active' : 'btn'}
            onClick={() => handleViewChange('room')}
          >
            Room View
          </button>
        </div>
        <div className="actions">
          {userRole === 'ADMIN' && (
            <button className="btn btn-primary" onClick={handleGenerateClick}>
              <i className="fas fa-robot"></i> AI Optimize Schedule
            </button>
          )}
          <button className="btn btn-secondary">
            <i className="fas fa-download"></i> Export
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}
      
      <div className="timetable-view">
        <div className="timetable-header">
          <div className="time-header">Time</div>
          {daysOfWeek.map(day => <div key={day}>{day.substring(0, 3)}</div>)}
        </div>
        {timetableData.map((row, index) => (
          <div key={index} className="timetable-row">
            <div className="time-slot">{row.time}</div>
            {daysOfWeek.map(day => (
              <div key={day} className="timetable-cell">
                {row.days[day] && (
                  <div 
                    className={`schedule-item ${row.days[day].type} ${userRole === 'TEACHER' ? 'teacher-view' : ''}`}
                    onClick={() => handleScheduleItemClick(row.days[day])}
                  >
                    <div className="subject">{row.days[day].content}</div>
                    {userRole !== 'TEACHER' && (
                      <div className="teacher">{row.days[day].teacher}</div>
                    )}
                    {row.days[day].substitute && (
                      <div className="substitute-label">Substitute</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showModal && (
        <GenerateScheduleModal 
          onClose={() => setShowModal(false)} 
          onScheduleGenerated={handleScheduleGenerated}
          systemData={systemData}
          user={user}
        />
      )}
    </div>
  );
};

// Add default props to prevent undefined errors
TimetableSection.defaultProps = {
  user: { role: 'STAFF' },
  systemData: {}
};

export default TimetableSection;