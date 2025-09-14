// src/utils/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const generateTimetable = async (excelData, constraints = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-timetable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ excel_data: excelData, constraints }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate timetable');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const analyzeTimetable = async (timetable) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-timetable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timetable }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze timetable');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};