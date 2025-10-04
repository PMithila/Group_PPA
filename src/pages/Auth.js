// src/pages/Auth.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login, register, setToken } from '../api';
import './Auth.css';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin, register: authRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const result = await authRegister({ email, password, name });
        if (result.success) {
          // All users are registered as teachers, so redirect to the teacher view
          navigate('/classes');
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        const result = await authLogin(email, password);
        if (result.success) {
          // Redirect based on user role
          if (result.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/classes');
          }
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      setError(isRegister ? 'Registration failed' : 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <i className="fas fa-calendar-alt"></i>
            <h1>Timetable Manager</h1>
          </div>
          <p>School Timetable Management System</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab ${!isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(false)}
          >
            Sign In
          </button>
          <button 
            className={`tab ${isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(true)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}
          
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-demo">
          <p>Demo Credentials:</p>
          <p>Admin: admin@school.edu / admin123</p>
          <p>Teacher: teacher@school.edu / teacher123</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;