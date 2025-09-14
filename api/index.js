// src/api/index.js
// Use process.env instead of import.meta.env for Create React App
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const setToken = (token) => {
  localStorage.setItem('stms_token', token);
};

export const getToken = () => {
  return localStorage.getItem('stms_token');
};

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  return response.json();
};

export const register = async (email, password, name) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, role: 'teacher' }),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return response.json();
};

// Add other API calls as needed