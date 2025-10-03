// src/pages/Timetable.js
import React, { useState, useEffect, useCallback } from 'react';
import GenerateScheduleModal from '../components/GenerateScheduleModal';
import AddClassModal from '../components/AddClassModal';
import AIAgent from '../components/AIAgent';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import '../styles/Dashboard.css';
import './Timetable.css';

const Timetable = ({ excelData, timetableData, onTimetableUpdate, user }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [currentTimetable, setCurrentTimetable] = useState(timetableData || []);
  const [filter, setFilter] = useState({
    type: 'all',
    teacher: 'all',
    room: 'all'
  });
  const [viewMode, setViewMode] = useState('institutional'); // 'institutional', 'teacher', 'room'
  const [draggedItem, setDraggedItem] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    if (timetableData && timetableData.length > 0) {
      setCurrentTimetable(timetableData);
      detectConflicts(timetableData);
    } else {
      const defaultTimetable = getDefaultTimetable();
      setCurrentTimetable(defaultTimetable);
      detectConflicts(defaultTimetable);
    }
  }, [timetableData, getDefaultTimetable]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleScheduleItemClick = (content, teacher, type, timeSlot, day) => {
    if (content && isEditing) {
      setSelectedTimeSlot({ timeSlot, day, content, teacher, type });
      setShowAddClassModal(true);
    } else if (content) {
      showToast(`Class: ${content} | Teacher: ${teacher} | Type: ${type}`, 'info');
    }
  };

  const handleDragStart = (e, timeSlot, day, classInfo) => {
    if (!isEditing) return;
    setDraggedItem({ timeSlot, day, classInfo });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTimeSlot, targetDay) => {
    e.preventDefault();
    if (!draggedItem || !isEditing) return;

    // Check for conflicts
    const targetSlot = currentTimetable.find(slot => slot.time === targetTimeSlot);
    if (targetSlot?.days[targetDay]) {
      showToast('Time slot already occupied!', 'error');
      setDraggedItem(null);
      return;
    }

    // Move the class
    const newTimetable = currentTimetable.map(slot => {
      if (slot.time === draggedItem.timeSlot) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [draggedItem.day]: null
          }
        };
      }
      if (slot.time === targetTimeSlot) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [targetDay]: draggedItem.classInfo
          }
        };
      }
      return slot;
    });

    setCurrentTimetable(newTimetable);
    if (onTimetableUpdate) {
      onTimetableUpdate(newTimetable);
    }
    showToast('Class moved successfully!', 'success');
    setDraggedItem(null);
    detectConflicts(newTimetable);
  };

  const detectConflicts = (timetable) => {
    const conflictList = [];
    const teacherSchedule = {};
    const roomSchedule = {};

    timetable.forEach(timeSlot => {
      Object.entries(timeSlot.days).forEach(([day, classInfo]) => {
        if (!classInfo) return;

        const timeKey = `${day}-${timeSlot.time}`;
        const teacher = classInfo.teacher;
        const room = classInfo.content.match(/\((.*?)\)/)?.[1];

        // Check teacher conflicts
        if (teacherSchedule[teacher]) {
          teacherSchedule[teacher].push(timeKey);
        } else {
          teacherSchedule[teacher] = [timeKey];
        }

        // Check room conflicts
        if (room) {
          if (roomSchedule[room]) {
            roomSchedule[room].push(timeKey);
          } else {
            roomSchedule[room] = [timeKey];
          }
        }
      });
    });

    // Find conflicts
    Object.entries(teacherSchedule).forEach(([teacher, times]) => {
      if (times.length > 1) {
        conflictList.push({ type: 'teacher', resource: teacher, times });
      }
    });

    Object.entries(roomSchedule).forEach(([room, times]) => {
      if (times.length > 1) {
        conflictList.push({ type: 'room', resource: room, times });
      }
    });

    setConflicts(conflictList);
  };

  const handleAddClass = (newClass) => {
    if (!selectedTimeSlot) return;

    const newTimetable = currentTimetable.map(slot => {
      if (slot.time === selectedTimeSlot.timeSlot) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [selectedTimeSlot.day]: newClass
          }
        };
      }
      return slot;
    });

    setCurrentTimetable(newTimetable);
    if (onTimetableUpdate) {
      onTimetableUpdate(newTimetable);
    }
    setShowAddClassModal(false);
    setSelectedTimeSlot(null);
    showToast('Class added successfully!', 'success');
    detectConflicts(newTimetable);
  };

  const handleDeleteClass = (timeSlot, day) => {
    const newTimetable = currentTimetable.map(slot => {
      if (slot.time === timeSlot) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [day]: null
          }
        };
      }
      return slot;
    });

    setCurrentTimetable(newTimetable);
    if (onTimetableUpdate) {
      onTimetableUpdate(newTimetable);
    }
    showToast('Class deleted successfully!', 'success');
    detectConflicts(newTimetable);
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
            {excelData && (
              <div className="data-indicator">
                <i className="fas fa-check-circle"></i>
                <span>Using imported data</span>
              </div>
            )}
          </div>

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
          <button 
            className={`btn ${isEditing ? 'btn-success' : 'btn-warning'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <i className={`fas ${isEditing ? 'fa-check' : 'fa-edit'}`}></i> 
            {isEditing ? 'Save Changes' : 'Edit Mode'}
          </button>
          <button className="btn btn-primary" onClick={handleGenerateClick}>
            <i className="fas fa-robot"></i> AI Optimize
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

      {conflicts.length > 0 && (
        <div className="conflicts-alert">
          <h4><i className="fas fa-exclamation-triangle"></i> Schedule Conflicts Detected</h4>
          {conflicts.map((conflict, index) => (
            <div key={index} className="conflict-item">
              <strong>{conflict.type === 'teacher' ? 'Teacher' : 'Room'} Conflict:</strong> 
              {conflict.resource} has overlapping schedules
            </div>
          ))}
        </div>
      )}

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
                <div 
                  key={day} 
                  className={`timetable-cell ${isEditing ? 'editable' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, row.time, day)}
                  onClick={() => {
                    if (isEditing && !row.days[day]) {
                      setSelectedTimeSlot({ timeSlot: row.time, day });
                      setShowAddClassModal(true);
                    }
                  }}
                >
                  {row.days[day] ? (
                    <div 
                      className={`schedule-item ${row.days[day].type} ${isEditing ? 'draggable' : ''}`}
                      draggable={isEditing}
                      onDragStart={(e) => handleDragStart(e, row.time, day, row.days[day])}
                      onClick={() => handleScheduleItemClick(
                        row.days[day].content, 
                        row.days[day].teacher, 
                        row.days[day].type,
                        row.time,
                        day
                      )}
                    >
                      {isEditing && (
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(row.time, day);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                      <div className="class-title">{row.days[day].content}</div>
                      <div className="class-teacher">{row.days[day].teacher}</div>
                      <div className="class-type">{row.days[day].type}</div>
                    </div>
                  ) : isEditing ? (
                    <div className="empty-slot">
                      <i className="fas fa-plus"></i>
                      <span>Add Class</span>
                    </div>
                  ) : null}
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
          excelData={excelData}
        />
      )}

      {showAddClassModal && (
        <AddClassModal
          onClose={() => {
            setShowAddClassModal(false);
            setSelectedTimeSlot(null);
          }}
          onAddClass={handleAddClass}
          timeSlot={selectedTimeSlot}
          existingClass={selectedTimeSlot?.content ? {
            content: selectedTimeSlot.content,
            teacher: selectedTimeSlot.teacher,
            type: selectedTimeSlot.type
          } : null}
        />
      )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;