// src/pages/Auth.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDepartments } from '../api';
// import { login, register, setToken } from '../api'; // Unused for now
// Removed old CSS import - using Tailwind CSS now

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin, register: authRegister } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load departments for selection
    const loadDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
        // Set first department as default if available
        if (depts.length > 0 && !department) {
          setDepartment(depts[0].id.toString());
        }
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };
    loadDepartments();
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const result = await authRegister({ email, password, name, department, role: 'teacher' });
        if (result.success) {
          // All users are registered as teachers, so redirect to the teacher view
          navigate('/dashboard');
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        const result = await authLogin(email, password);
        if (result.success) {
          // Redirect based on user role
          if (result.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/classes');
          }
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      setError(isRegister ? 'Registration failed' : 'Login failed');
    }

    setLoading(false);
  };

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

          {/* Tabs */}
          <div className="mb-6 bg-slate-100 rounded-xl p-1 flex">
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${!isRegister ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setIsRegister(false)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isRegister ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setIsRegister(true)}
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength="6"
                className="input-field"
              />
            </div>

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
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            <p className="font-medium mb-1">Demo Credentials</p>
            <p>Admin: admin@school.edu / admin123</p>
            <p>Teacher: teacher@school.edu / teacher123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;