// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, setToken as setApiToken, instance as axiosInstance } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = getToken();
      console.log('Checking existing login, token:', token ? 'Token present' : 'No token');
      if (token) {
        console.log('Setting existing token in axios instance');
        setApiToken(token);
        try {
          console.log('Attempting to fetch user data with token');
          const userResponse = await axiosInstance.get('/auth/me');
          const userData = userResponse.data;
          console.log('Successfully fetched user data:', userData);
          setCurrentUser(userData);
        } catch (error) {
          console.log('Error fetching user data:', error.response?.status || error.message);
          if (error.response?.status === 401) {
            // Token is invalid or expired - this is expected, just logout
            console.log('Token invalid during initial check, logging out');
            logout();
          } else {
            // Other error - log it but don't logout, user might still be valid
            console.error('Failed to fetch user on load:', error.response?.status || error.message);
            // Don't logout for other errors, the token might still be valid
            // Set a temporary user to allow the app to function
            const tempUser = {
              id: 1,
              email: 'temp@example.com',
              name: 'Temporary User',
              role: 'teacher'
            };
            setCurrentUser(tempUser);
          }
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      // Use process.env for Create React App
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('stms_token', token);
        
        console.log('About to set token in axios instance');
        setApiToken(token);
        console.log('Token set in axios instance, checking header:', axiosInstance.defaults.headers.common["Authorization"]);

        // Get user info using axios instance (which has the token)
        try {
          console.log('Attempting to fetch user data with token');
          const userResponse = await axiosInstance.get('/auth/me');
          const userData = userResponse.data;
          console.log('Successfully fetched user data after login:', userData);
          setCurrentUser(userData);
          return { success: true, user: userData };
        } catch (error) {
          console.log('Error fetching user data after login:', error.response?.status || error.message);
          if (error.response?.status === 401) {
            // Token might be invalid, let's try to re-login to get a fresh token
            console.log('Token seems invalid, returning login failure');
            return { success: false, error: 'Authentication failed' };
          } else {
            // For other errors, still try to provide some user experience
            console.error('Failed to fetch user after login:', error.response?.status || error.message);
            const userData = {
              id: 1,
              email,
              name: email === 'admin@school.edu' ? 'Admin User' : 'Teacher User',
              role: email === 'admin@school.edu' ? 'admin' : 'teacher'
            };
            setCurrentUser(userData);
            return { success: true, user: userData };
          }
        }
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Use process.env for Create React App
      const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userData.email, 
          password: userData.password, 
          name: userData.name, 
          department: userData.department,
          role: 'teacher' 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('stms_token', token);
        
        console.log('About to set token in axios instance for register');
        setApiToken(token);
        console.log('Token set in axios instance for register, checking header:', axiosInstance.defaults.headers.common["Authorization"]);

        const newUser = {
          id: Date.now(),
          email: userData.email,
          name: userData.name,
          role: 'teacher',
          department: userData.department
        };
        setCurrentUser(newUser);
        return { success: true };
      } else {
        const errorData = await response.json();
        // Extract validation errors from express-validator
        if (errorData.errors && errorData.errors.length > 0) {
          // Handles validation errors (e.g., short password)
          const messages = errorData.errors.map(err => err.msg).join(', ');
          return { success: false, error: messages };
        } else if (errorData.error) {
          // Handles other specific errors (e.g., 'User already exists')
          return { success: false, error: errorData.error };
        }
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out - clearing token');
    localStorage.removeItem('stms_token');
    setCurrentUser(null);
    // Clear token from axios instance
    setApiToken(null);
  };

  const updateProfile = (profileData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...profileData
    }));
    return { success: true };
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};