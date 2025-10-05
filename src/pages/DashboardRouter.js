// Role-based Dashboard Router
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './Dashboard';
import TeacherDashboard from './TeacherDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedBackground from '../components/AnimatedBackground';

const DashboardRouter = () => {
  const { currentUser, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="dashboard-page">
        <AnimatedBackground variant="dashboard" />
        <div className="loading-container">
          <LoadingSpinner size="large" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    window.location.href = '/login';
    return null;
  }

  // Route based on user role
  const userRole = currentUser.role?.toLowerCase();

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    default:
      // Default to teacher dashboard for unknown roles
      return <TeacherDashboard />;
  }
};

export default DashboardRouter;
