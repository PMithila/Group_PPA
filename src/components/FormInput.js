// src/components/FormInput.js
import React, { useState, useRef } from 'react';
import './FormInput.css';

const FormInput = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  helperText,
  maxLength,
  rows = 4,
  options = [],
  multiple = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (onChange) onChange(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasValue = value && value.toString().length > 0;

  const containerClass = `
    form-input-container
    ${isFocused ? 'focused' : ''}
    ${hasValue ? 'has-value' : ''}
    ${error ? 'error' : ''}
    ${success ? 'success' : ''}
    ${disabled ? 'disabled' : ''}
    ${className}
  `.trim();

  const renderInput = () => {
    const commonProps = {
      ref: inputRef,
      value: value || '',
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      placeholder: isFocused || !label ? placeholder : '',
      maxLength,
      className: 'form-input',
      ...props
    };

    switch (type) {
      case 'textarea':
        return <textarea {...commonProps} rows={rows} />;
      
      case 'select':
        return (
          <select {...commonProps} multiple={multiple}>
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      default:
        return <input {...commonProps} type={inputType} />;
    }
  };

  return (
    <div className={containerClass}>
      <div className="input-wrapper">
        {icon && iconPosition === 'left' && (
          <div className="input-icon left">
            <i className={icon}></i>
          </div>
        )}

        <div className="input-field">
          {label && (
            <label className="input-label">
              {label}
              {required && <span className="required-indicator">*</span>}
            </label>
          )}
          
          {renderInput()}
          
          <div className="input-border"></div>
        </div>

        {type === 'password' && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        )}

        {icon && iconPosition === 'right' && type !== 'password' && (
          <div className="input-icon right">
            <i className={icon}></i>
          </div>
        )}
      </div>

      {(error || success || helperText) && (
        <div className="input-feedback">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          
          {success && !error && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}
          
          {helperText && !error && !success && (
            <div className="helper-text">
              <span>{helperText}</span>
            </div>
          )}
        </div>
      )}

      {maxLength && (
        <div className="character-count">
          {(value || '').length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default FormInput;
