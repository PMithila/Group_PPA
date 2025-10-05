// Teacher Dashboard Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TeacherNotifications from '../components/TeacherNotifications';
import AnimatedBackground from '../components/AnimatedBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { getClasses } from '../api';
import '../styles/Dashboard.css';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toasts, success, warning, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    todaysClasses: 0,
    upcomingClasses: 0,
    weeklyHours: 0
  });

  useEffect(() => {
    loadTeacherData();
  }, [currentUser]);

  const loadTeacherData = async () => {
    if (!currentUser?.name) return;
    
    setLoading(true);
    try {
      const classes = await getClasses();
      const teacherClasses = classes.filter(cls => cls.teacher === currentUser.name);
      
      // Get today's classes
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todays = teacherClasses.filter(cls => cls.day === today);
      
      // Get upcoming classes (next 7 days)
      const upcoming = teacherClasses.filter(cls => {
        const classDate = new Date();
        const classDay = cls.day;
        const todayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(today);
        const classDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(classDay);
        
        if (classDayIndex > todayIndex) return true;
        if (classDayIndex === todayIndex) {
          const classTime = parseTimeSlot(cls.time_slot);
          if (classTime) {
            const classDateTime = new Date();
            classDateTime.setHours(classTime.hours, classTime.minutes, 0, 0);
            return classDateTime > new Date();
          }
        }
        return false;
      });

      // Calculate weekly hours
      const weeklyHours = teacherClasses.reduce((total, cls) => {
        return total + 1; // Assuming 1 hour per class
      }, 0);

      setTodaysClasses(todays);
      setUpcomingClasses(upcoming);
      setWeeklySchedule(teacherClasses);
      setStats({
        totalClasses: teacherClasses.length,
        todaysClasses: todays.length,
        upcomingClasses: upcoming.length,
        weeklyHours: weeklyHours
      });

    } catch (error) {
      console.error('Failed to load teacher data:', error);
      warning('Failed to load your class schedule');
    } finally {
      setLoading(false);
    }
  };

  const parseTimeSlot = (timeSlot) => {
    const timeMapping = {
      '8am-9am': { hours: 8, minutes: 0 },
      '9am-10am': { hours: 9, minutes: 0 },
      '10am-11am': { hours: 10, minutes: 0 },
      '11am-12pm': { hours: 11, minutes: 0 },
      '12pm-1pm': { hours: 12, minutes: 0 },
      '1pm-2pm': { hours: 13, minutes: 0 },
      '2pm-3pm': { hours: 14, minutes: 0 },
      '3pm-4pm': { hours: 15, minutes: 0 },
      '4pm-5pm': { hours: 16, minutes: 0 },
      '5pm-6pm': { hours: 17, minutes: 0 },
      '6pm-7pm': { hours: 18, minutes: 0 },
      '7pm-8pm': { hours: 19, minutes: 0 }
    };
    return timeMapping[timeSlot] || null;
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

  const getNextClass = () => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    return todaysClasses.find(cls => {
      const classTime = parseTimeSlot(cls.time_slot);
      if (!classTime) return false;
      
      const classDateTime = new Date();
      classDateTime.setHours(classTime.hours, classTime.minutes, 0, 0);
      
      return classDateTime > now;
    });
  };

  const getClassTypeColor = (className) => {
    const name = className.toLowerCase();
    if (name.includes('lab')) return '#e53e3e';
    if (name.includes('tutorial')) return '#38a169';
    if (name.includes('seminar')) return '#805ad5';
    return '#4299e1';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <AnimatedBackground variant="dashboard" />
        <div className="loading-container">
          <LoadingSpinner size="large" text="Loading your schedule..." />
        </div>
      </div>
    );
  }

  const nextClass = getNextClass();

  return (
    <div className="dashboard-page">
      <AnimatedBackground variant="dashboard" />
      <Header 
        user={currentUser}
        onSearch={() => console.log('Search clicked')}
        onProfileClick={() => navigate('/profile')}
        onSettingsClick={() => navigate('/settings')}
        onLogoClick={() => navigate('/dashboard')}
      />
      
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-main">
            <div className="dashboard-header">
              <h1>Welcome, {currentUser?.name || 'Teacher'}!</h1>
              <p>Here's your teaching schedule and upcoming classes.</p>
            </div>

            {/* Teacher Stats Cards */}
            <div className="teacher-stats-grid">
              <div className="stat-card blue">
                <div className="card-header">
                  <div className="icon-container">
                    <div className="icon blue">
                      <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                  </div>
                  <div className="value">
                    <h3>{stats.totalClasses}</h3>
                    <span>Total Classes</span>
                  </div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="card-header">
                  <div className="icon-container">
                    <div className="icon green">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                  </div>
                  <div className="value">
                    <h3>{stats.todaysClasses}</h3>
                    <span>Today's Classes</span>
                  </div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="card-header">
                  <div className="icon-container">
                    <div className="icon purple">
                      <i className="fas fa-clock"></i>
                    </div>
                  </div>
                  <div className="value">
                    <h3>{stats.upcomingClasses}</h3>
                    <span>Upcoming</span>
                  </div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="card-header">
                  <div className="icon-container">
                    <div className="icon orange">
                      <i className="fas fa-hourglass-half"></i>
                    </div>
                  </div>
                  <div className="value">
                    <h3>{stats.weeklyHours}</h3>
                    <span>Weekly Hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Class Card */}
            {nextClass && (
              <div className="next-class-section">
                <h2>
                  <i className="fas fa-clock"></i>
                  Next Class
                </h2>
                <div className="next-class-card">
                  <div className="class-info">
                    <h3>{nextClass.code} - {nextClass.name}</h3>
                    <p className="class-time">{formatTimeSlot(nextClass.time_slot)}</p>
                    <p className="class-room">Room: {nextClass.room || 'TBA'}</p>
                  </div>
                  <div className="class-type" style={{ backgroundColor: getClassTypeColor(nextClass.name) }}>
                    {nextClass.name.toLowerCase().includes('lab') ? 'Lab' : 
                     nextClass.name.toLowerCase().includes('tutorial') ? 'Tutorial' : 'Lecture'}
                  </div>
                </div>
              </div>
            )}

            {/* Today's Classes */}
            {todaysClasses.length > 0 && (
              <div className="todays-classes-section">
                <h2>
                  <i className="fas fa-calendar-day"></i>
                  Today's Classes
                </h2>
                <div className="classes-grid">
                  {todaysClasses.map((cls, index) => (
                    <div key={cls.id} className="class-card">
                      <div className="class-header">
                        <div className="class-time">{formatTimeSlot(cls.time_slot)}</div>
                        <div className="class-type-badge" style={{ backgroundColor: getClassTypeColor(cls.name) }}>
                          {cls.name.toLowerCase().includes('lab') ? 'Lab' : 
                           cls.name.toLowerCase().includes('tutorial') ? 'Tutorial' : 'Lecture'}
                        </div>
                      </div>
                      <div className="class-details">
                        <h4>{cls.code} - {cls.name}</h4>
                        <p className="class-room">
                          <i className="fas fa-door-open"></i>
                          {cls.room || 'TBA'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Schedule */}
            {weeklySchedule.length > 0 && (
              <div className="weekly-schedule-section">
                <h2>
                  <i className="fas fa-calendar-week"></i>
                  Weekly Schedule
                </h2>
                <div className="schedule-table">
                  <div className="schedule-header">
                    <div>Day</div>
                    <div>Time</div>
                    <div>Class</div>
                    <div>Room</div>
                  </div>
                  {weeklySchedule.map((cls, index) => (
                    <div key={cls.id} className="schedule-row">
                      <div className="day">{cls.day}</div>
                      <div className="time">{formatTimeSlot(cls.time_slot)}</div>
                      <div className="class-info">
                        <div className="class-name">{cls.code} - {cls.name}</div>
                      </div>
                      <div className="room">{cls.room || 'TBA'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions for Teachers */}
            <div className="teacher-actions">
              <h2>
                <i className="fas fa-bolt"></i>
                Quick Actions
              </h2>
              <div className="actions-grid">
                <button 
                  className="action-card"
                  onClick={() => navigate('/timetable')}
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>View Timetable</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/classes')}
                >
                  <i className="fas fa-book"></i>
                  <span>View Classes</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/faculty')}
                >
                  <i className="fas fa-chalkboard-teacher"></i>
                  <span>View Faculty</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/labs')}
                >
                  <i className="fas fa-flask"></i>
                  <span>View Labs</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/import')}
                >
                  <i className="fas fa-file-import"></i>
                  <span>Import Info</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print"></i>
                  <span>Print Schedule</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => {
                    const schedule = weeklySchedule.map(cls => 
                      `${cls.day} - ${formatTimeSlot(cls.time_slot)} - ${cls.code} - ${cls.name} - ${cls.room || 'TBA'}`
                    ).join('\n');
                    navigator.clipboard.writeText(schedule);
                    success('Schedule copied to clipboard!');
                  }}
                >
                  <i className="fas fa-copy"></i>
                  <span>Copy Schedule</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar with Notifications */}
          <div className="dashboard-sidebar">
            <TeacherNotifications />
          </div>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={() => {}} />
    </div>
  );
};

export default TeacherDashboard;
