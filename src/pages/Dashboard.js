// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DashboardCards from '../components/DashboardCards';
import QuickActions from '../components/QuickActions';
import RecentActivities from '../components/RecentActivities';
// import TeacherNotifications from '../components/TeacherNotifications'; // Unused for now
import AnimatedBackground from '../components/AnimatedBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
// Removed old CSS import - using Tailwind CSS now

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalLabs: 0,
    upcomingClasses: [],
    recentActivities: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New timetable generated successfully",
      type: "success",
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      message: "Lab equipment maintenance scheduled",
      type: "warning",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: 3,
      message: "New faculty member added to system",
      type: "info",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ]);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  useEffect(() => {
    // Redirect teachers to their dashboard
    if (currentUser && !isAdmin) {
      navigate('/teacher-dashboard');
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      
      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Use provided data or generate sample data
      const effectiveTimetableData = [
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

      setDashboardData({
        totalClasses: effectiveTimetableData.length,
        totalTeachers: 5,
        totalStudents: 100,
        totalLabs: 3,
        upcomingClasses: effectiveTimetableData,
        recentActivities: [
          {
            id: 1,
            type: 'system',
            message: 'System initialized successfully',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            user: 'System',
            priority: 'low'
          },
          {
            id: 2,
            type: 'upload',
            message: 'Excel data imported successfully',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: 'Admin',
            priority: 'medium'
          },
          {
            id: 3,
            type: 'generate',
            message: 'AI generated optimized timetable with 98% efficiency',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            user: 'AI System',
            priority: 'high'
          }
        ],
        notifications: notifications
      });
      
      setLoading(false);
    };

    loadInitialData();
  }, [notifications, currentUser, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <AnimatedBackground variant="dashboard" />
        <div className="loading-container">
          <LoadingSpinner size="large" text="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <AnimatedBackground variant="dashboard" />
        <div className="loading-container">
          <div style={{ textAlign: 'center', color: '#e53e3e' }}>
            <i className="fas fa-lock" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
            <h2>Access Denied</h2>
            <p>You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatedBackground variant="dashboard" />
      <Header 
        notifications={notifications}
        onNotificationDismiss={(id) => setNotifications(notifications.filter(n => n.id !== id))}
        onSearch={() => console.log('Search clicked')}
        onProfileClick={() => navigate('/profile')}
        onSettingsClick={() => navigate('/settings')}
        onLogoClick={() => navigate('/dashboard')}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                    Dashboard
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Welcome back, {currentUser?.name || 'Admin'}! Here's what's happening with your schedule today.
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Last updated</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-calendar-check text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
              <DashboardCards 
                timetableData={dashboardData.upcomingClasses}
                teachers={[
                  { id: 1, name: 'Dr. Smith', department: 'Computer Science' },
                  { id: 2, name: 'Prof. Johnson', department: 'Physics' },
                  { id: 3, name: 'Prof. Davis', department: 'Mathematics' },
                  { id: 4, name: 'Dr. Williams', department: 'English' },
                  { id: 5, name: 'Dr. Wilson', department: 'Chemistry' }
                ]}
                classrooms={[
                  { id: 1, name: 'Room A12', capacity: 50, type: 'lecture' },
                  { id: 2, name: 'Room B5', capacity: 30, type: 'tutorial' },
                  { id: 3, name: 'Room C10', capacity: 40, type: 'lecture' },
                  { id: 4, name: 'Room D2', capacity: 35, type: 'lecture' },
                  { id: 5, name: 'Lab 1', capacity: 25, type: 'lab' },
                  { id: 6, name: 'Lab 2', capacity: 25, type: 'lab' },
                  { id: 7, name: 'Lab 3', capacity: 20, type: 'lab' }
                ]}
                subjects={[
                  'CS101', 'PHY101', 'MATH101', 'ENG101', 'CHEM101', 
                  'BIO101', 'HIST101', 'GEOG101', 'ECON101', 'PSYC101'
                ]}
                conflicts={0}
                onCardClick={(cardId, action) => {
                  console.log(`Card clicked: ${cardId}, Action: ${action}`);
                  // Navigate based on card type
                  switch(cardId) {
                    case 'classes':
                      navigate('/classes');
                      break;
                    case 'labs':
                      navigate('/labs');
                      break;
                    case 'faculty':
                      navigate('/faculty');
                      break;
                    case 'conflicts':
                      navigate('/timetable');
                      break;
                    case 'utilization':
                      navigate('/labs');
                      break;
                    case 'efficiency':
                      navigate('/timetable');
                      break;
                    case 'capacity':
                      navigate('/classes');
                      break;
                    default:
                      console.log('Unknown card:', cardId);
                  }
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
              <QuickActions 
                onGenerateSchedule={(scheduleData) => {
                  console.log('Schedule generated:', scheduleData);
                  // Update dashboard data with new schedule
                  setDashboardData(prev => ({
                    ...prev,
                    upcomingClasses: scheduleData
                  }));
                }}
                onDataUpload={(data) => {
                  console.log('Data uploaded:', data);
                  navigate('/import');
                }}
              />
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
              <RecentActivities activities={dashboardData.recentActivities} />
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AdminDashboard;