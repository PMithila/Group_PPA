// src/components/ErrorBoundary.js
import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <div className="error-content">
              <h1 className="error-title">Oops! Something went wrong</h1>
              <p className="error-description">
                We encountered an unexpected error. Don't worry, our team has been notified 
                and we're working to fix this issue.
              </p>
              
              <div className="error-actions">
                <button 
                  className="error-button primary"
                  onClick={this.handleReload}
                >
                  <i className="fas fa-redo"></i>
                  Reload Page
                </button>
                
                <button 
                  className="error-button secondary"
                  onClick={this.handleGoBack}
                >
                  <i className="fas fa-arrow-left"></i>
                  Go Back
                </button>
                
                <button 
                  className="error-button outline"
                  onClick={this.handleGoHome}
                >
                  <i className="fas fa-home"></i>
                  Go to Dashboard
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-details">
                  <summary>Error Details (Development Only)</summary>
                  <div className="error-stack">
                    <h4>Error:</h4>
                    <pre>{this.state.error.toString()}</pre>
                    
                    <h4>Component Stack:</h4>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
