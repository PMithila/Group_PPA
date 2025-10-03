// src/components/AnimatedButton.js
import React, { useState } from 'react';
import './AnimatedButton.css';

const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    
    if (onClick) {
      onClick(e);
    }
  };

  const buttonClass = `
    animated-button
    ${variant}
    ${size}
    ${disabled ? 'disabled' : ''}
    ${loading ? 'loading' : ''}
    ${fullWidth ? 'full-width' : ''}
    ${isClicked ? 'clicked' : ''}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <div className="button-content">
        {loading && (
          <div className="button-spinner">
            <div className="spinner-ring"></div>
          </div>
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className="button-icon left">
            <i className={icon}></i>
          </span>
        )}
        
        <span className="button-text">{children}</span>
        
        {icon && iconPosition === 'right' && !loading && (
          <span className="button-icon right">
            <i className={icon}></i>
          </span>
        )}
      </div>
      
      <div className="button-ripple"></div>
    </button>
  );
};

export default AnimatedButton;
