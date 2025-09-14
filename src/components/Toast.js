// Enhanced Toast Notification Component
import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 20px',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '500',
      fontSize: '0.95rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      minWidth: '300px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      animation: isExiting ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    };

    const typeStyles = {
      success: {
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
      },
      error: {
        background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)'
      },
      warning: {
        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'
      },
      info: {
        background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)'
      }
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type];
  };

  return (
    <>
      <div style={getToastStyles()}>
        <i className={getIcon()}></i>
        <span>{message}</span>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose && onClose();
            }, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: 'auto',
            fontSize: '1.2rem',
            opacity: 0.7,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <style jsx="true">{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
