// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import DashboardRouter from './pages/DashboardRouter';
import Settings from './pages/Settings';
import Classes from './pages/Classes';
import Faculty from './pages/Faculty';
import Labs from './pages/Labs';
import ImportData from './pages/ImportData';
import Timetable from './pages/Timetable';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" />;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';
  
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#e53e3e' }}></i>
        <h2 style={{ color: '#e53e3e' }}>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button 
          onClick={() => window.history.back()}
          style={{ 
            padding: '10px 20px', 
            background: '#4299e1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/classes" 
              element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty" 
              element={
                <ProtectedRoute>
                  <Faculty />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/labs" 
              element={
                <ProtectedRoute>
                  <Labs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/import" 
              element={
                <AdminRoute>
                  <ImportData />
                </AdminRoute>
              } 
            />
            <Route 
              path="/timetable" 
              element={
                <ProtectedRoute>
                  <Timetable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;