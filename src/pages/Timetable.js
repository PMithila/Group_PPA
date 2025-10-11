// src/pages/Timetable.js
import React, { useState, useEffect, useCallback } from 'react';
import GenerateScheduleModal from '../components/GenerateScheduleModal';
// Removed AIAgent import - component was deleted during cleanup
import TeacherNotifications from '../components/TeacherNotifications';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getClasses, getLabSessions } from '../api';

const Timetable = ({ timetableData, onTimetableUpdate, user }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currentTimetable, setCurrentTimetable] = useState(timetableData || []);
  const [classes, setClasses] = useState([]);
  const [labSessions, setLabSessions] = useState([]);
  const [filter, setFilter] = useState({
    type: 'all',
    teacher: 'all',
    room: 'all'
  });
  const [viewMode, setViewMode] = useState('institutional');

  // Convert classes data to timetable format
  const convertClassesToTimetable = useCallback((classesData, labData = []) => {
    // Fixed ascending time slots
    const fixedTimeSlots = [
      '7:30-8:10',
      '8:10-8:30',
      '8:30-9:10',
      '9:10-10:30',
      '10:50-11:30',
      '11:30-12:10',
      '12:10-12:50',
      '12:50-1:30'
    ];

    const timetable = fixedTimeSlots.map(timeSlot => {
      const formattedTime = timeSlot;
      const days = {
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
        Saturday: null,
        Sunday: null
      };

      // Add classes to timetable
      classesData.forEach(cls => {
        if (cls.time_slot === timeSlot && cls.day && days.hasOwnProperty(cls.day)) {
          days[cls.day] = {
            id: cls.id,
            code: cls.code,
            name: cls.name,
            teacher: cls.teacher,
            room: cls.room,
            subject_name: cls.subject_name,
            department_name: cls.department_name,
            duration: cls.duration,
            max_students: cls.max_students,
            type: 'class'
          };
        }
      });

      // Add lab sessions to timetable
      labData.forEach(lab => {
        if (lab.time_slot === timeSlot && lab.day && days.hasOwnProperty(lab.day) && !days[lab.day]) {
          days[lab.day] = {
            id: lab.id,
            code: lab.name, // Using name as code for labs
            name: lab.name,
            teacher: lab.teacher_name || lab.teacher,
            room: lab.room,
            subject_name: lab.subject_name || 'Lab Session',
            department_name: lab.department_name,
            duration: lab.duration,
            max_students: lab.max_students,
            capacity: lab.capacity,
            resources: lab.resources,
            type: 'lab'
          };
        }
      });

      return {
        time: formattedTime,
        days
      };
    });

    return timetable;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always create an empty timetable first so it displays permanently
        const emptyTimetable = createEmptyTimetable();
        setCurrentTimetable(emptyTimetable);
        
        // Fetch classes and lab sessions
        const [classesData, labsData] = await Promise.all([
          getClasses(),
          getLabSessions()
        ]);
        
        setClasses(classesData);
        setLabSessions(labsData);
        
        // Update timetable with the fetched data
        const timetable = convertClassesToTimetable(classesData, labsData);
        setCurrentTimetable(timetable);
      } catch (error) {
        console.error('Failed to fetch timetable data:', error);
      }
    };

    fetchData();
  }, [convertClassesToTimetable]);
  
  // Create an empty timetable structure
  const createEmptyTimetable = () => {
    const fixedTimeSlots = [
      '7:30-8:10',
      '8:10-8:30',
      '8:30-9:10',
      '9:10-10:30',
      '10:50-11:30',
      '11:30-12:10',
      '12:10-12:50',
      '12:50-1:30'
    ];
    
    return fixedTimeSlots.map(timeSlot => ({
      time: timeSlot,
      days: {
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
        Saturday: null,
        Sunday: null
      }
    }));
  };

  const handleTimetableUpdate = (newTimetable) => {
    setCurrentTimetable(newTimetable);
    if (onTimetableUpdate) {
      onTimetableUpdate(newTimetable);
    }
  };

  const filteredTimetable = currentTimetable.filter(slot => {
    const hasClasses = Object.values(slot.days).some(Boolean);
    if (!hasClasses) return false;

    if (filter.type === 'all' && filter.teacher === 'all' && filter.room === 'all') {
      return true;
    }

    return Object.values(slot.days).some(classData => {
      if (!classData) return false;
      
      const typeMatch = filter.type === 'all' || 
        (filter.type === 'lecture' && !classData.room?.toLowerCase().includes('lab')) ||
        (filter.type === 'lab' && classData.room?.toLowerCase().includes('lab'));
      
      const teacherMatch = filter.teacher === 'all' || classData.teacher === filter.teacher;
      const roomMatch = filter.room === 'all' || classData.room === filter.room;
      
      return typeMatch && teacherMatch && roomMatch;
    });
  });

  const getUniqueTeachers = () => {
    const teachers = new Set();
    currentTimetable.forEach(slot => {
      Object.values(slot.days).forEach(classData => {
        if (classData?.teacher) {
          teachers.add(classData.teacher);
        }
      });
    });
    return Array.from(teachers).sort();
  };

  const getUniqueRooms = () => {
    const rooms = new Set();
    currentTimetable.forEach(slot => {
      Object.values(slot.days).forEach(classData => {
        if (classData?.room) {
          rooms.add(classData.room);
        }
      });
    });
    return Array.from(rooms).sort();
  };

  const getClassColor = (classData) => {
    if (!classData) return '';
    
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800'
    ];
    
    const hash = classData.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={currentUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Timetable Management
              </h1>
              <p className="text-slate-600">
                View and manage your institutional timetable with AI-powered insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <i className="fas fa-magic"></i>
                Generate Schedule
              </button>
              
              <div className="flex items-center gap-2 bg-slate-100/80 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('institutional')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'institutional'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className="fas fa-building mr-2"></i>
                  Institutional
                </button>
                <button
                  onClick={() => setViewMode('teacher')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'teacher'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className="fas fa-chalkboard-teacher mr-2"></i>
                  Teacher
                </button>
                <button
                  onClick={() => setViewMode('room')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'room'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className="fas fa-door-open mr-2"></i>
                  Room
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({...filter, type: e.target.value})}
                  className="input-field w-40"
                >
                  <option value="all">All Types</option>
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Teacher</label>
                <select
                  value={filter.teacher}
                  onChange={(e) => setFilter({...filter, teacher: e.target.value})}
                  className="input-field w-48"
                >
                  <option value="all">All Teachers</option>
                  {getUniqueTeachers().map(teacher => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Room</label>
                <select
                  value={filter.room}
                  onChange={(e) => setFilter({...filter, room: e.target.value})}
                  className="input-field w-40"
                >
                  <option value="all">All Rooms</option>
                  {getUniqueRooms().map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setFilter({type: 'all', teacher: 'all', room: 'all'})}
                className="btn-secondary text-sm"
              >
                <i className="fas fa-times mr-2"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-[120px]">
                    Time
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Monday
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Tuesday
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Wednesday
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Thursday
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Friday
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Saturday
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[150px]">
                    Sunday
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetable.map((slot, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 bg-slate-50/50">
                      {slot.time}
                    </td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <td key={day} className="px-3 py-4 text-center">
                        {slot.days[day] ? (
                          <div className={`p-3 rounded-xl border-2 ${getClassColor(slot.days[day])} hover:shadow-md transition-all duration-200 cursor-pointer`}>
                            <div className="font-semibold text-sm mb-1">
                              {slot.days[day].code}
                            </div>
                            <div className="text-xs font-medium mb-1">
                              {slot.days[day].name}
                            </div>
                            {slot.days[day].teacher && (
                              <div className="text-xs opacity-75 mb-1">
                                <i className="fas fa-chalkboard-teacher mr-1"></i>
                                {slot.days[day].teacher}
                              </div>
                            )}
                            {slot.days[day].room && (
                              <div className="text-xs opacity-75 mb-1">
                                <i className="fas fa-door-open mr-1"></i>
                                {slot.days[day].room}
                              </div>
                            )}
                            {slot.days[day].subject_name && (
                              <div className="text-xs opacity-75">
                                <i className="fas fa-book-open mr-1"></i>
                                {slot.days[day].subject_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-300 text-sm">-</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredTimetable.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-table text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No timetable data found</h3>
            <p className="text-slate-600 mb-6">
              {currentTimetable.length === 0 
                ? "Generate your first timetable to get started."
                : "Try adjusting your filters to see more results."
              }
            </p>
            {currentTimetable.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                <i className="fas fa-magic mr-2"></i>
                Generate Timetable
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <GenerateScheduleModal
          onClose={() => setShowModal(false)}
          onTimetableGenerated={handleTimetableUpdate}
        />
      )}

      {/* Removed AIAgent component - was deleted during cleanup */}

      {/* Teacher Notifications */}
      <TeacherNotifications />
    </div>
  );
};

export default Timetable;