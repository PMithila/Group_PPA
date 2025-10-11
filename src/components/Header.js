// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getClasses, getLabSessions } from '../api';

const Header = ({ user, viewMode, onViewModeChange, notifications = [], onNotificationDismiss }) => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is a teacher
  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER';

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSidebarClose = () => {
    setShowSidebar(false);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('stms_token');
    navigate('/auth');
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Define search keywords and their corresponding routes
    const searchMappings = {
      // Teachers/Faculty related
      'teacher': '/faculty',
      'teachers': '/faculty',
      'faculty': '/faculty',
      'staff': '/faculty',
      'instructor': '/faculty',
      'instructors': '/faculty',
      'professor': '/faculty',
      'professors': '/faculty',

      // Timetable/Schedule related
      'timetable': '/timetable',
      'schedule': '/timetable',
      'calendar': '/timetable',
      'time table': '/timetable',
      'scheduling': '/timetable',

      // Classes/Courses related
      'class': '/classes',
      'classes': '/classes',
      'course': '/classes',
      'courses': '/classes',
      'subject': '/subjects',
      'subjects': '/subjects',
      'lesson': '/classes',
      'lessons': '/classes',

      // Labs related
      'lab': '/labs',
      'labs': '/labs',
      'laboratory': '/labs',
      'laboratories': '/labs',
      'lab session': '/labs',
      'lab sessions': '/labs',

      // Department related
      'department': '/departments',
      'departments': '/departments',
      'dept': '/departments',

      // Settings/Profile related
      'settings': '/settings',
      'setting': '/settings',
      'profile': '/settings',
      'account': '/settings',
      'preferences': '/settings',

      // Dashboard related
      'dashboard': '/dashboard',
      'home': '/dashboard',
      'main': '/dashboard',

      // Import related (admin only)
      'import': '/import',
      'upload': '/import',
      'data': '/import',
      'excel': '/import'
    };

    // Convert search query to lowercase for case-insensitive matching
    const query = searchQuery.toLowerCase().trim();

    // Check for exact matches first, then partial matches
    let route = null;

    // Exact matches
    if (searchMappings[query]) {
      route = searchMappings[query];
    } else {
      // Partial matches - check if query contains any of the keywords
      for (const [keyword, mappedRoute] of Object.entries(searchMappings)) {
        if (query.includes(keyword) || keyword.includes(query)) {
          route = mappedRoute;
          break;
        }
      }
    }

    // Navigate to the matched route or dashboard if no match
    if (route) {
      navigate(route);
    } else {
      // If no match found, you could show a "no results" message or navigate to search page
      console.log('No matching route found for search:', query);
      // For now, just navigate to dashboard
      navigate('/dashboard');
    }

    // Close search and reset query
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleNotificationClick = async () => {
    if (!isTeacher) return;

    setShowScheduleDropdown(!showScheduleDropdown);

    if (!showScheduleDropdown) {
      setLoadingSchedule(true);
      try {
        // Fetch today's schedule for the teacher
        const [classes, labs] = await Promise.all([
          getClasses(),
          getLabSessions()
        ]);

        // Filter for today's classes and labs for this teacher
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const teacherClasses = classes.filter(cls =>
          cls.teacher === user.name && cls.day === today
        ).map(cls => ({ ...cls, type: 'class' }));

        const teacherLabs = labs.filter(lab =>
          lab.teacher === user.name && lab.day === today
        ).map(lab => ({ ...lab, type: 'lab' }));

        const combinedSchedule = [...teacherClasses, ...teacherLabs].sort((a, b) => {
          // Sort by time slot
          const timeA = a.time_slot || '';
          const timeB = b.time_slot || '';
          return timeA.localeCompare(timeB);
        });

        setTodaysSchedule(combinedSchedule);
      } catch (error) {
        console.error('Error fetching today\'s schedule:', error);
        setTodaysSchedule([]);
      } finally {
        setLoadingSchedule(false);
      }
    }
  };

  const formatTimeSlot = (timeSlot) => {
    const timeMapping = {
      '7:30-8:10': '7:30 AM - 8:10 AM',
      '8:10-8:30': '8:10 AM - 8:30 AM',
      '8:30-9:10': '8:30 AM - 9:10 AM',
      '9:10-10:30': '9:10 AM - 10:30 AM',
      '10:50-11:30': '10:50 AM - 11:30 AM',
      '11:30-12:10': '11:30 AM - 12:10 PM',
      '12:10-12:50': '12:10 PM - 12:50 PM',
      '12:50-1:30': '12:50 PM - 1:30 PM'
    };
    return timeMapping[timeSlot] || timeSlot;
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Sidebar Toggle */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <button
                onClick={handleSidebarToggle}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
                title="Menu"
              >
                <i className="fas fa-bars text-lg"></i>
              </button>

              {/* Logo */}
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={handleLogoClick}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <i className="fas fa-calendar-alt text-white text-lg"></i>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  EduSync
                </span>
              </div>

              {/* Search Bar - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:block relative">
                {showSearch ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pages (teachers, timetable, class, lab...)"
                        className="w-64 px-4 py-2 pl-10 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        autoFocus
                      />
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                      <button
                        type="button"
                        onClick={handleSearchToggle}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
                    title="Search"
                  >
                    <i className="fas fa-search text-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications - Only show for teachers */}
              {isTeacher && (
                <div className="hidden lg:block relative">
                  <button
                    onClick={handleNotificationClick}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
                    title="Today's Schedule"
                  >
                    <i className="fas fa-bell text-lg"></i>
                    {todaysSchedule.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {todaysSchedule.length}
                      </span>
                    )}
                  </button>

                  {/* Schedule Dropdown */}
                  {showScheduleDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-50 animate-slide-down">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-slate-800">
                            <i className="fas fa-calendar-day text-primary-500 mr-2"></i>
                            Today's Schedule
                          </h3>
                          <button
                            onClick={() => setShowScheduleDropdown(false)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <i className="fas fa-times text-slate-400"></i>
                          </button>
                        </div>

                        {loadingSchedule ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            <span className="ml-2 text-slate-600">Loading...</span>
                          </div>
                        ) : todaysSchedule.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <i className="fas fa-coffee text-slate-400 text-lg"></i>
                            </div>
                            <p className="text-slate-600 text-sm">No classes or labs scheduled for today!</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {todaysSchedule.map((session, index) => (
                              <div key={index} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-slate-800 text-sm">
                                    {session.code || session.name}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    session.type === 'lab'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {session.type === 'lab' ? 'Lab' : 'Class'}
                                  </span>
                                </div>

                                <div className="space-y-1 text-xs text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <i className="fas fa-clock text-slate-400 w-3"></i>
                                    <span>{formatTimeSlot(session.time_slot)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <i className="fas fa-door-open text-slate-400 w-3"></i>
                                    <span>{session.room || 'TBA'}</span>
                                  </div>
                                  {session.type === 'class' && session.subject_name && (
                                    <div className="flex items-center gap-2">
                                      <i className="fas fa-book text-slate-400 w-3"></i>
                                      <span>{session.subject_name}</span>
                                    </div>
                                  )}
                                  {session.type === 'lab' && session.resources && session.resources.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <i className="fas fa-flask text-slate-400 w-3"></i>
                                      <span>{session.resources.length} resources needed</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile */}
              <div className="relative">
                <div
                  onClick={handleUserClick}
                  className="flex items-center space-x-3 p-2 hover:bg-white/50 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-slate-800 truncate max-w-32">
                      {user?.name || user?.email || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user?.role || 'Administrator'}
                    </p>
                  </div>
                  <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
                </div>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-50 animate-slide-down">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <i className="fas fa-user text-slate-400"></i>
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <i className="fas fa-cog text-slate-400"></i>
                        <span>Settings</span>
                      </button>
                      <div className="border-t border-slate-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt text-red-400"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={handleSidebarClose}
        notifications={notifications}
        onNotificationDismiss={onNotificationDismiss}
      />
    </>
  );
};

export default Header;