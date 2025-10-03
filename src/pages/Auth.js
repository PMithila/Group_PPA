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
        // Use API for registration
        const data = await register(email, password, name);
        const token = data.access_token;
        localStorage.setItem('stms_token', token);
        setToken(token);
        navigate('/dashboard');
      } else {
        // Use API for login
        const data = await login(email, password);
        const token = data.access_token;
        localStorage.setItem('stms_token', token);
        setToken(token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.response?.status === 400 && err.response?.data?.detail === 'User exists') {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(isRegister ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      }
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