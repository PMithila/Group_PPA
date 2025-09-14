// Enhanced Loading Spinner Component
import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    success: 'border-green-500',
    white: 'border-white'
  };

  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner-wrapper">
        <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
          <div className="spinner-inner"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
      
      <style jsx="true">{`
        .loading-spinner-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .loading-spinner-wrapper {
          text-align: center;
        }
        
        .loading-spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #667eea;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
          position: relative;
        }
        
        .spinner-inner {
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          border: 2px solid transparent;
          border-top: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          animation: spin 2s linear infinite reverse;
        }
        
        .loading-text {
          color: #718096;
          font-size: 0.95rem;
          font-weight: 500;
          margin: 0;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .w-4 { width: 1rem; height: 1rem; }
        .w-8 { width: 2rem; height: 2rem; }
        .w-12 { width: 3rem; height: 3rem; }
        
        .border-blue-500 { border-top-color: #667eea; }
        .border-purple-500 { border-top-color: #764ba2; }
        .border-green-500 { border-top-color: #48bb78; }
        .border-white { border-top-color: #ffffff; }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
