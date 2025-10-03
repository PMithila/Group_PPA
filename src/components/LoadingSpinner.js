// Enhanced Loading Spinner Component
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  color = 'primary',
  overlay = false,
  fullScreen = false 
}) => {
  const containerClass = `
    loading-spinner-container 
    ${overlay ? 'overlay' : ''} 
    ${fullScreen ? 'fullscreen' : ''}
  `.trim();

  return (
    <div className={containerClass}>
      <div className="loading-spinner-wrapper">
        <div className={`loading-spinner ${size} ${color}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
