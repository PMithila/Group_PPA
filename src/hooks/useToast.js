// Enhanced Toast Hook for Better UX
import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type: 'success', duration };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    return id;
  }, []);

  const error = useCallback((message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type: 'error', duration };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    return id;
  }, []);

  const warning = useCallback((message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type: 'warning', duration };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    return id;
  }, []);

  const info = useCallback((message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type: 'info', duration };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    return id;
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};
