// Enhanced Form Validation Component
import React, { useState } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (validateAll()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Validation Rules
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return '';
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return '';
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return '';
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return '';
  },

  numeric: (value) => {
    if (value && isNaN(value)) {
      return 'Must be a valid number';
    }
    return '';
  },

  positiveNumber: (value) => {
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      return 'Must be a positive number';
    }
    return '';
  },

  phoneNumber: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return '';
  }
};

// Enhanced Input Component with Validation
export const ValidatedInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  touched,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          disabled={disabled}
          className={`form-input ${error && touched ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        />
        {error && touched && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
          font-size: 0.95rem;
        }
        
        .required-asterisk {
          color: #e53e3e;
          margin-left: 4px;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 1);
        }
        
        .form-input.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }
        
        .form-input.disabled {
          background: #f7fafc;
          color: #a0aec0;
          cursor: not-allowed;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          color: #e53e3e;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .error-message i {
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

// Enhanced Select Component with Validation
export const ValidatedSelect = ({
  name,
  label,
  options,
  value,
  error,
  touched,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  placeholder = 'Select an option...',
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          disabled={disabled}
          className={`form-select ${error && touched ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && touched && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .select-wrapper {
          position: relative;
        }
        
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          cursor: pointer;
        }
        
        .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 1);
        }
        
        .form-select.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }
        
        .form-select.disabled {
          background: #f7fafc;
          color: #a0aec0;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
