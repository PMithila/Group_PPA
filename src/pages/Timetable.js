// src/pages/Timetable.js
import React, { useState, useEffect, useCallback } from 'react';
import GenerateScheduleModal from '../components/GenerateScheduleModal';
import AIAgent from '../components/AIAgent';
import TeacherNotifications from '../components/TeacherNotifications';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getClasses } from '../api'; // Import getClasses
import '../styles/Dashboard.css';
import '../styles/EnhancedComponents.css';
import '../styles/Timetable.css';

const Timetable = ({ timetableData, onTimetableUpdate, user }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currentTimetable, setCurrentTimetable] = useState(timetableData || []);
  const [classes, setClasses] = useState([]); // Add state for classes
  const [filter, setFilter] = useState({
    type: 'all',
    teacher: 'all',
    room: 'all'
  });
  const [viewMode, setViewMode] = useState('institutional'); // 'institutional', 'teacher', 'room'
  // Removed unused analysisResults state

  // Convert classes data to timetable format
  const convertClassesToTimetable = useCallback((classesData) => {
    // Define time slots mapping
    const timeSlotMapping = {
      '8am-9am': '8:00-9:00',
      '9am-10am': '9:00-10:00',
      '10am-11am': '10:00-11:00',
      '11am-12pm': '11:00-12:00',
      '12pm-1pm': '12:00-13:00',
      '1pm-2pm': '13:00-14:00',
      '2pm-3pm': '14:00-15:00',
      '3pm-4pm': '15:00-16:00',
      '4pm-5pm': '16:00-17:00',
      '5pm-6pm': '17:00-18:00',
      '6pm-7pm': '18:00-19:00',
      '7pm-8pm': '19:00-20:00'
    };

    // Get all unique time slots from classes
    const uniqueTimeSlots = [...new Set(classesData.map(cls => cls.time_slot).filter(Boolean))];
    
    // Create timetable structure
    const timetable = uniqueTimeSlots.map(timeSlot => {
      const formattedTime = timeSlotMapping[timeSlot] || timeSlot;
      const days = {
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
        Saturday: null,
        Sunday: null
      };

      // Find classes for this time slot
      const classesForTimeSlot = classesData.filter(cls => cls.time_slot === timeSlot);
      
      // Populate days with classes
      classesForTimeSlot.forEach(cls => {
        if (cls.day && days.hasOwnProperty(cls.day)) {
          // Determine class type based on class name or code
          let classType = 'lecture'; // Default type
          const className = cls.name.toLowerCase();
          const classCode = cls.code.toLowerCase();
          
          if (className.includes('lab') || classCode.includes('lab')) {
            classType = 'lab';
          } else if (className.includes('tutorial') || classCode.includes('tut')) {
            classType = 'tutorial';
          } else if (className.includes('seminar') || classCode.includes('sem')) {
            classType = 'seminar';
          }

          days[cls.day] = {
            type: classType,
            content: `${cls.code} - ${cls.name}${cls.room ? ` (${cls.room})` : ''}`,
            teacher: cls.teacher || 'TBA',
            classId: cls.id,
            room: cls.room
          };
        }
      });

      return {
        time: formattedTime,
        days
      };
    });

    // Sort timetable by time
    return timetable.sort((a, b) => {
      const timeA = a.time.split('-')[0];
      const timeB = b.time.split('-')[0];
      return timeA.localeCompare(timeB);
    });
  }, []);

  // Initialize with default timetable if no data provided
  const getDefaultTimetable = useCallback(() => {
    return [
      {
        time: '8:00-9:00',
        days: {
          Monday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
          Tuesday: null,
          Wednesday: { type: 'lab', content: 'Physics Lab (Lab 3)', teacher: 'Prof. Johnson' },
          Thursday: null,
          Friday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
          Saturday: null,
          Sunday: null
        }
      },
      {
        time: '9:00-10:00',
        days: {
          Monday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Davis' },
          Tuesday: { type: 'lecture', content: 'PHY101 (Room C10)', teacher: 'Prof. Johnson' },
          Wednesday: null,
          Thursday: { type: 'lecture', content: 'ENG101 (Room D2)', teacher: 'Dr. Williams' },
          Friday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Davis' },
          Saturday: null,
          Sunday: null
        }
      },
      {
        time: '10:00-11:00',
        days: {
          Monday: { type: 'lecture', content: 'CHEM101 (Lab 1)', teacher: 'Dr. Wilson' },
          Tuesday: { type: 'lab', content: 'Chemistry Lab (Lab 1)', teacher: 'Dr. Wilson' },
          Wednesday: { type: 'lecture', content: 'BIO101 (Room C10)', teacher: 'Dr. Garcia' },
          Thursday: { type: 'tutorial', content: 'CHEM101 (Room B5)', teacher: 'Dr. Wilson' },
          Friday: { type: 'lab', content: 'Biology Lab (Lab 2)', teacher: 'Dr. Garcia' },
          Saturday: null,
          Sunday: null
        }
      },
      {
        time: '11:00-12:00',
        days: {
          Monday: { type: 'lecture', content: 'HIST101 (Room D2)', teacher: 'Dr. Brown' },
          Tuesday: { type: 'lecture', content: 'GEOG101 (Room A12)', teacher: 'Dr. Miller' },
          Wednesday: { type: 'tutorial', content: 'HIST101 (Room B5)', teacher: 'Dr. Brown' },
          Thursday: { type: 'lab', content: 'Geography Lab (Lab 3)', teacher: 'Dr. Miller' },
          Friday: { type: 'lecture', content: 'ECON101 (Room C10)', teacher: 'Dr. Anderson' },
          Saturday: null,
          Sunday: null
        }
      }
    ];
  }, []);

  useEffect(() => {
    // Fetch classes from the database
    const fetchClasses = async () => {
      try {
        const fetchedClasses = await getClasses();
        setClasses(fetchedClasses);
        
        // Convert classes to timetable format
        if (fetchedClasses && fetchedClasses.length > 0) {
          const convertedTimetable = convertClassesToTimetable(fetchedClasses);
          setCurrentTimetable(convertedTimetable);
        } else {
          // Use default timetable if no classes found
          setCurrentTimetable(getDefaultTimetable());
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        // Fallback to default timetable on error
        setCurrentTimetable(getDefaultTimetable());
      }
    };

    fetchClasses();

    // If timetableData is provided as prop, use it instead
    if (timetableData && timetableData.length > 0) {
      setCurrentTimetable(timetableData);
    }
  }, [timetableData, getDefaultTimetable, convertClassesToTimetable]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleScheduleItemClick = (content, teacher, type) => {
    if (content) {
      alert(`Class: ${content}\nTeacher: ${teacher}\nType: ${type}\n\nClick "Generate Schedule" to optimize with AI.`);
    }
  };

  const handleScheduleGenerated = (newSchedule) => {
    setCurrentTimetable(newSchedule);
    if (onTimetableUpdate) {
      onTimetableUpdate(newSchedule);
    }
    setShowModal(false);
  };

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const handleExportTimetable = () => {
    // Convert timetable to CSV format
    let csvContent = "Time,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday\n";
    
    currentTimetable.forEach(row => {
      const dayValues = daysOfWeek.map(day => {
        const classInfo = row.days[day];
        return classInfo ? `"${classInfo.content} (${classInfo.teacher})"` : '';
      });
      
      csvContent += `${row.time},${dayValues.join(',')}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'timetable_export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Reset filters when changing view mode
    setFilter({ type: 'all', teacher: 'all', room: 'all' });
  };

  const handleAnalyzeComplete = (results) => {
    // You can handle analysis results here if needed, currently not used
  };

  const handleOptimize = () => {
    // This would trigger the AI optimization process
    setShowModal(true);
  };

  const handleRefreshTimetable = async () => {
    try {
      const fetchedClasses = await getClasses();
      setClasses(fetchedClasses);
      
      // Convert classes to timetable format
      if (fetchedClasses && fetchedClasses.length > 0) {
        const convertedTimetable = convertClassesToTimetable(fetchedClasses);
        setCurrentTimetable(convertedTimetable);
      } else {
        // Use default timetable if no classes found
        setCurrentTimetable(getDefaultTimetable());
      }
    } catch (error) {
      console.error("Failed to refresh timetable:", error);
    }
  };

  // Get unique values for filters
  const teachers = [...new Set(
    currentTimetable.flatMap(slot => 
      daysOfWeek.map(day => slot.days[day]?.teacher).filter(Boolean)
    )
  )];

  const rooms = [...new Set(
    currentTimetable.flatMap(slot => 
      daysOfWeek.map(day => {
        const content = slot.days[day]?.content;
        return content ? content.match(/\((.*?)\)/)?.[1] : null;
      }).filter(Boolean)
    )
  )];

  // Filter timetable based on current filters and view mode
  const filteredTimetable = currentTimetable.map(timeSlot => {
    const filteredDays = {};
    
    daysOfWeek.forEach(day => {
      const classInfo = timeSlot.days[day];
      
      if (!classInfo) {
        filteredDays[day] = null;
        return;
      }
      
      // Apply filters
      const typeMatch = filter.type === 'all' || classInfo.type === filter.type;
      const teacherMatch = filter.teacher === 'all' || classInfo.teacher === filter.teacher;
      const roomMatch = filter.room === 'all' || classInfo.content.includes(filter.room);
      
      if (typeMatch && teacherMatch && roomMatch) {
        filteredDays[day] = classInfo;
      } else {
        filteredDays[day] = null;
      }
    });
    
    return {
      time: timeSlot.time,
      days: filteredDays
    };
  });

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="timetable-page">
          <div className="page-header">
            <h2>Timetable Management</h2>
            <p>View and manage your institution's timetable</p>
          </div>

          {/* Teacher Notifications - Only show for teachers */}
          {(currentUser?.role === 'teacher' || currentUser?.role === 'TEACHER') && (
            <TeacherNotifications />
          )}

          {/* AI Agent Component */}
          <AIAgent 
            onOptimize={handleOptimize}
            onAnalyze={handleAnalyzeComplete}
            timetable={currentTimetable}
            user={user}
          />

          <div className="section-header">
        <h2 className="section-title">
          {viewMode === 'institutional' ? 'Institutional Timetable' : 
           viewMode === 'teacher' ? 'My Schedule' : 'Room Schedule'}
        </h2>
        
        <div className="view-selector">
          <button 
            className={viewMode === 'institutional' ? 'btn btn-active' : 'btn'}
            onClick={() => handleViewModeChange('institutional')}
          >
            Institutional
          </button>
          {user?.role === 'TEACHER' && (
            <button 
              className={viewMode === 'teacher' ? 'btn btn-active' : 'btn'}
              onClick={() => handleViewModeChange('teacher')}
            >
              My Schedule
            </button>
          )}
          <button 
            className={viewMode === 'room' ? 'btn btn-active' : 'btn'}
            onClick={() => handleViewModeChange('room')}
          >
            Room View
          </button>
        </div>
        
        <div className="actions">
          <button className="btn btn-primary" onClick={handleGenerateClick}>
            <i className="fas fa-robot"></i> AI Optimize Schedule
          </button>
          <button className="btn btn-secondary" onClick={handleRefreshTimetable}>
            <i className="fas fa-sync-alt"></i> Refresh from Classes
          </button>
          <button className="btn btn-secondary" onClick={handleExportTimetable}>
            <i className="fas fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <div className="timetable-filters">
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select name="type" value={filter.type} onChange={handleFilterChange}>
            <option value="all">All Types</option>
            <option value="lecture">Lectures</option>
            <option value="lab">Labs</option>
            <option value="tutorial">Tutorials</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Teacher:</label>
          <select name="teacher" value={filter.teacher} onChange={handleFilterChange}>
            <option value="all">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Room:</label>
          <select name="room" value={filter.room} onChange={handleFilterChange}>
            <option value="all">All Rooms</option>
            {rooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => setFilter({ type: 'all', teacher: 'all', room: 'all' })}
        >
          Clear Filters
        </button>
      </div>

      <div className="timetable-container">
        <div className="timetable-view">
          <div className="timetable-header">
            <div className="time-header">Time</div>
            {daysOfWeek.map(day => <div key={day}>{day.substring(0, 3)}</div>)}
          </div>
          
          {filteredTimetable.map((row, index) => (
            <div key={index} className="timetable-row">
              <div className="time-slot">{row.time}</div>
              {daysOfWeek.map(day => (
                <div key={day} className="timetable-cell">
                  {row.days[day] && (
                    <div 
                      className={`schedule-item ${row.days[day].type}`}
                      onClick={() => handleScheduleItemClick(
                        row.days[day].content, 
                        row.days[day].teacher, 
                        row.days[day].type
                      )}
                    >
                      <div className="class-title">{row.days[day].content}</div>
                      <div className="class-teacher">{row.days[day].teacher}</div>
                      <div className="class-type">{row.days[day].type}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <GenerateScheduleModal 
          onClose={() => setShowModal(false)} 
          onScheduleGenerated={handleScheduleGenerated}
          classes={classes} // Pass classes to the modal
        />
      )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;