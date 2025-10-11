// Teacher Dashboard Component
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TeacherNotifications from '../components/TeacherNotifications';
import AnimatedBackground from '../components/AnimatedBackground';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { getClasses, getLabSessions } from '../api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toasts, removeToast, warning } = useToast();
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

  const loadTeacherData = useCallback(async () => {
    if (!currentUser?.name) return;

    setLoading(true);
    try {
      // Fetch both classes and lab sessions
      const [classes, labs] = await Promise.all([
        getClasses(),
        getLabSessions()
      ]);

      // Filter classes for this teacher
      const teacherClasses = classes.filter(cls =>
        cls.teacher === currentUser.name
      ).map(cls => ({ ...cls, type: 'class' }));

      // Filter labs for this teacher
      const teacherLabs = labs.filter(lab =>
        lab.teacher === currentUser.name
      ).map(lab => ({ ...lab, type: 'lab' }));

      // Combine classes and labs
      const allSessions = [...teacherClasses, ...teacherLabs];

      // Get today's sessions
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todays = allSessions.filter(session => session.day === today);

      // Get upcoming sessions (next 7 days)
      const upcoming = allSessions.filter(session => {
        const sessionDay = session.day;
        const todayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(today);
        const sessionDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(sessionDay);

        if (sessionDayIndex > todayIndex) return true;
        if (sessionDayIndex === todayIndex) {
          const sessionTime = parseTimeSlot(session.time_slot);
          if (sessionTime) {
            const sessionDateTime = new Date();
            sessionDateTime.setHours(sessionTime.hours, sessionTime.minutes, 0, 0);
            return sessionDateTime > new Date();
          }
        }
        return false;
      });

      // Calculate weekly hours (assuming 1 hour per class/lab)
      const weeklyHours = allSessions.reduce((total, session) => {
        return total + 1;
      }, 0);

      setTodaysClasses(todays);
      setUpcomingClasses(upcoming);
      setWeeklySchedule(allSessions);
      setStats({
        totalClasses: allSessions.length,
        todaysClasses: todays.length,
        upcomingClasses: upcoming.length,
        weeklyHours: weeklyHours
      });

    } catch (error) {
      console.error('Failed to load teacher data:', error);
      warning('Failed to load your class and lab schedule');
    } finally {
      setLoading(false);
    }
  }, [currentUser, warning]);

  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

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
      '7pm-8pm': { hours: 19, minutes: 0 },
      '8pm-9pm': { hours: 20, minutes: 0 }
    };
    return timeMapping[timeSlot] || null;
  };

  const getTimeColor = (timeSlot) => {
    const time = parseTimeSlot(timeSlot);
    if (!time) return 'text-slate-500';
    
    const currentHour = new Date().getHours();
    if (time.hours === currentHour) return 'text-red-600 font-bold';
    if (time.hours > currentHour) return 'text-green-600';
    return 'text-slate-500';
  };

  const getDayColor = (day) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day === today ? 'text-primary-600 font-bold' : 'text-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={currentUser} />
      <AnimatedBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Welcome back, {currentUser?.name}!
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                <i className="fas fa-chalkboard-teacher text-primary-500"></i>
                Your teaching dashboard and class schedule
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Today's Date</div>
                <div className="text-lg font-semibold text-slate-800">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Classes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-chalkboard text-white text-lg"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today's Classes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.todaysClasses}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar-day text-white text-lg"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming</p>
                <p className="text-3xl font-bold text-slate-800">{stats.upcomingClasses}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-white text-lg"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Weekly Hours</p>
                <p className="text-3xl font-bold text-slate-800">{stats.weeklyHours}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Classes */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-calendar-day text-primary-500"></i>
                Today's Sessions
              </h2>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {todaysClasses.length} sessions
              </span>
            </div>

            {todaysClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-coffee text-slate-400 text-2xl"></i>
                </div>
                <p className="text-slate-600">No classes or labs scheduled for today!</p>
                <p className="text-sm text-slate-500 mt-1">Enjoy your free time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysClasses.map((session, index) => (
                  <div key={index} className="bg-white/80 rounded-xl p-4 border border-white/40 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        {session.name}
                        {session.type === 'lab' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Lab
                          </span>
                        )}
                      </h3>
                      <span className={`text-sm font-medium ${getTimeColor(session.time_slot)}`}>
                        {session.time_slot}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-door-open text-blue-500"></i>
                        {session.room}
                      </span>
                      {session.type === 'class' ? (
                        <>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-users text-green-500"></i>
                            {session.max_students || 'N/A'} students
                          </span>
                          {session.subject_name && (
                            <span className="flex items-center gap-1">
                              <i className="fas fa-book text-purple-500"></i>
                              {session.subject_name}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-flask text-green-500"></i>
                            {session.capacity || 'N/A'} capacity
                          </span>
                          {session.resources && session.resources.length > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="fas fa-tools text-orange-500"></i>
                              {session.resources.length} resources
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-clock text-orange-500"></i>
                Upcoming Classes
              </h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {upcomingClasses.length} classes
              </span>
            </div>

            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar-check text-slate-400 text-2xl"></i>
                </div>
                <p className="text-slate-600">No upcoming classes this week!</p>
                <p className="text-sm text-slate-500 mt-1">Your schedule is clear.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.slice(0, 5).map((cls, index) => (
                  <div key={index} className="bg-white/80 rounded-xl p-4 border border-white/40 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                      <span className={`text-sm font-medium ${getTimeColor(cls.time_slot)}`}>
                        {cls.time_slot}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className={`flex items-center gap-1 ${getDayColor(cls.day)}`}>
                        <i className="fas fa-calendar text-blue-500"></i>
                        {cls.day}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-door-open text-green-500"></i>
                        {cls.room}
                      </span>
                      {cls.subject_name && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-book text-purple-500"></i>
                          {cls.subject_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {upcomingClasses.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-slate-500">
                      +{upcomingClasses.length - 5} more classes
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-calendar-week text-purple-500"></i>
              Weekly Schedule
            </h2>
            <button 
              onClick={() => navigate('/timetable')}
              className="btn-secondary text-sm"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              View Full Timetable
            </button>
          </div>

          {weeklySchedule.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-times text-slate-400 text-2xl"></i>
              </div>
              <p className="text-slate-600">No classes scheduled this week!</p>
              <p className="text-sm text-slate-500 mt-1">Contact admin to add your classes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const dayClasses = weeklySchedule.filter(cls => cls.day === day);
                return (
                  <div key={day} className="bg-white/80 rounded-xl p-4 border border-white/40">
                    <h3 className={`font-semibold mb-3 ${getDayColor(day)}`}>{day}</h3>
                    {dayClasses.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No classes</p>
                    ) : (
                      <div className="space-y-2">
                        {dayClasses.map((session, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`font-medium text-slate-800 ${session.type === 'lab' ? 'text-purple-600' : 'text-slate-800'}`}>
                                {session.code || session.name}
                                {session.type === 'lab' && (
                                  <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Lab</span>
                                )}
                              </div>
                            </div>
                            <div className="text-slate-600">{session.time_slot} • {session.room}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Teacher Notifications */}
        <div className="mt-8">
          <TeacherNotifications />
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TeacherDashboard;