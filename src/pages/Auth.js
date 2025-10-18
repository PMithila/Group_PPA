// src/pages/Auth.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDepartments, requestPasswordReset, resetPassword } from '../api';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(''); // kept in state only, never rendered
  const { login: authLogin, register: authRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params (mode & token) so reset token can come from the reset link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qMode = params.get('mode');
    const qToken = params.get('token');
    if (qMode) setMode(qMode);
    if (qToken) setResetToken(qToken);
  }, [location.search]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
        if (depts.length > 0) {
          setDepartment(prev => prev || depts[0].id.toString());
        }
      } catch (err) {
        console.error('Error loading departments:', err);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    if (mode === 'register' && departments.length > 0) {
      setDepartment(prev => prev || departments[0].id.toString());
    }
  }, [mode, departments]);

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccessMessage('');
    setLoading(false);
    setPassword('');
    setConfirmPassword('');
    // Do NOT wipe resetToken when switching to reset from a URL link
    if (nextMode !== 'reset') setResetToken('');
  };

  const submitLabel = {
    login: 'Sign In',
    register: 'Create Account',
    forgot: 'Send Reset Link',
    reset: 'Reset Password'
  }[mode];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'register') {
        const result = await authRegister({ email, password, name, department, role: 'teacher' });
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Registration failed');
        }
      } else if (mode === 'login') {
        const result = await authLogin(email, password);
        if (result.success) {
          if (result.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/timetable');
          }
        } else {
          setError(result.error || 'Login failed');
        }
      } else if (mode === 'forgot') {
        // Ask backend to send reset email containing the tokenized link.
        const response = await requestPasswordReset(email);
        const baseMessage = response.message || 'If an account with that email exists, you will receive reset instructions shortly.';
        setSuccessMessage(baseMessage);

        // SECURITY: Do not expose the token in UI. If backend returns a token (for local dev),
        // stash it in state ONLY; do NOT render it.
        if (response.resetToken) setResetToken(response.resetToken);

        // Move user to reset screen (only password inputs). If you prefer, keep them on login.
        setMode('reset');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'reset') {
        if (!resetToken) {
          setError('Invalid or missing reset token. Please open the link from your email again.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await resetPassword(resetToken, password);
        setSuccessMessage('Password has been reset. You can now sign in.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setResetToken('');
      }
    } catch (err) {
      const responseMessage =
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.msg;

      if (responseMessage) {
        setError(responseMessage);
      } else if (mode === 'register') {
        setError('Registration failed');
      } else if (mode === 'login') {
        setError('Login failed');
      } else if (mode === 'forgot') {
        setError('Failed to request password reset');
      } else {
        setError('Password reset failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-calendar-alt text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">EduSync</h1>
              <p className="text-sm text-slate-600">School Timetable Management</p>
            </div>
          </div>

          <div className="mb-6 bg-slate-100 rounded-xl p-1 flex">
            <button
              type="button"
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isLogin ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => handleSwitchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isRegister ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => handleSwitchMode('register')}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">
              <i className="fas fa-check-circle mr-2"></i>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="input-field"
                />
              </div>
            )}

            {!isReset && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="input-field"
                />
              </div>
            )}

            {isRegister && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(isLogin || isRegister) && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  minLength="6"
                  className="input-field"
                />
              </div>
            )}

            {isReset && (
              <>
                {/* Token is NOT shown. It lives only in state. */}
                <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                  Enter your new password. (Open the reset link from your email on this device.)
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter a new password"
                    minLength="6"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your new password"
                    minLength="6"
                    className="input-field"
                  />
                </div>
              </>
            )}

            {isForgot && (
              <p className="text-sm text-slate-600">
                Enter the email associated with your account and we&apos;ll send password reset instructions.
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Processing...
                </span>
              ) : submitLabel}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                onClick={() => handleSwitchMode('forgot')}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {(isForgot || isReset) && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                onClick={() => handleSwitchMode('login')}
              >
                Back to sign in
              </button>
            </div>
          )}

          {isLogin && (
            <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              <p className="font-medium mb-1">Demo Credentials</p>
              <p>Admin: admin@school.edu / admin123</p>
              <p>Teacher: teacher@school.edu / teacher123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
