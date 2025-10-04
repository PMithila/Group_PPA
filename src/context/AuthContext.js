// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, setToken as setApiToken } from '../api';

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
      if (token) {
        setApiToken(token);
        try {
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
          const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData);
          } else {
            // Token is invalid or expired
            logout();
          }
        } catch (error) {
          console.error('Failed to fetch user on load', error);
          logout();
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
        
        // Get user info
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
          return { success: true, user: userData };
        }
        
        // Fallback if /auth/me endpoint doesn't exist
        const userData = {
          id: 1,
          email,
          name: email === 'admin@school.edu' ? 'Admin User' : 'Teacher User',
          role: email === 'admin@school.edu' ? 'admin' : 'teacher'
        };
        setCurrentUser(userData);
        return { success: true };
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
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userData.email, 
          password: userData.password, 
          name: userData.name, 
          role: 'teacher' 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('stms_token', token);
        
        const newUser = {
          id: Date.now(),
          email: userData.email,
          name: userData.name,
          role: 'teacher'
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
    localStorage.removeItem('stms_token');
    setCurrentUser(null);
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