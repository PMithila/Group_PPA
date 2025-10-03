// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Classes from './pages/Classes';
import Faculty from './pages/Faculty';
import Labs from './pages/Labs';
import ImportData from './pages/ImportData';
import Timetable from './pages/Timetable';
import './App.css';
import './styles/ProfessionalTheme.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/classes" 
                element={
                  <ProtectedRoute>
                    <Layout><Classes /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/faculty" 
                element={
                  <ProtectedRoute>
                    <Layout><Faculty /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/labs" 
                element={
                  <ProtectedRoute>
                    <Layout><Labs /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/import" 
                element={
                  <ProtectedRoute>
                    <Layout><ImportData /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/timetable" 
                element={
                  <ProtectedRoute>
                    <Layout><Timetable /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;