// src/pages/Faculty.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import {
  getTeachers,
  getDepartments,
  getClasses,
  createUser,
  updateUser,
  deleteUser
} from '../api';

const HONORIFICS = ['mr', 'ms', 'mrs', 'miss', 'dr', 'prof', 'sir', 'madam'];

const normalizeName = (value = '') => {
  if (!value) return '';
  return value.trim().toLowerCase();
};

const stripHonorifics = (value = '') => {
  if (!value) return '';
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0].replace(/\./g, '').toLowerCase();
  if (HONORIFICS.includes(first)) {
    return parts.slice(1).join(' ');
  }
  return parts.join(' ');
};

const Faculty = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [faculty, setFaculty] = useState([]);
  const [enrichedFaculty, setEnrichedFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    password: ''
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const fetchFaculty = useCallback(async () => {
    if (!currentUser) {
      setErrorMessage('Please log in to view users.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [teacherData, departmentData, classData] = await Promise.all([
        getTeachers(),
        getDepartments(),
        getClasses()
      ]);

      const teacherList = Array.isArray(teacherData) ? teacherData : [];
      const departmentList = Array.isArray(departmentData) ? departmentData : [];
      const classList = Array.isArray(classData) ? classData : [];


      const deptMap = new Map();
      departmentList.forEach((dept) => {
        if (!dept.head_of_department_id) return;
        const existing = deptMap.get(dept.head_of_department_id) || [];
        existing.push({ id: dept.id, name: dept.name, code: dept.code });
        deptMap.set(dept.head_of_department_id, existing);
      });

      const classMapById = new Map();
      const classMapByName = new Map();

      classList.forEach((cls) => {
        const label = cls.name || cls.subject_name || cls.subject || cls.code || 'Class';
        if (cls.teacher_id) {
          const existing = classMapById.get(cls.teacher_id) || new Set();
          existing.add(label);
          classMapById.set(cls.teacher_id, existing);
        }

        if (cls.teacher) {
          const baseName = normalizeName(cls.teacher);
          const strippedName = normalizeName(stripHonorifics(cls.teacher));
          [baseName, strippedName].filter(Boolean).forEach((key) => {
            const existing = classMapByName.get(key) || new Set();
            existing.add(label);
            classMapByName.set(key, existing);
          });
        }
      });

      const enriched = teacherList.map((teacher) => {
        const departmentsLed = deptMap.get(teacher.id) || [];
        const idSubjects = classMapById.get(teacher.id);
        let taughtSubjects = idSubjects ? Array.from(idSubjects) : [];

        if (!taughtSubjects.length && teacher.name) {
          const key = normalizeName(teacher.name);
          const stripped = normalizeName(stripHonorifics(teacher.name));
          const nameSubjects =
            classMapByName.get(stripped) || classMapByName.get(key) || null;
          if (nameSubjects) {
            taughtSubjects = Array.from(nameSubjects);
          }
        }

        taughtSubjects.sort((a, b) => a.localeCompare(b));

        return {
          ...teacher,
          departmentsLed,
          taughtSubjects
        };
      });

      setFaculty(teacherList);
      setEnrichedFaculty(enriched);
    } catch (err) {
      setErrorMessage('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchFaculty();
    }
  }, [currentUser, fetchFaculty]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'teacher',
      password: ''
    });
    setEditingTeacher(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      if (editingTeacher) {
        const { name, email, role } = formData;
        await updateUser(editingTeacher.id, { name, email, role });
        success('Faculty member updated successfully');
      } else {
        await createUser(formData);
        success('Faculty member added');
      }
      await fetchFaculty();
      resetForm();
    } catch (err) {
      setErrorMessage('Failed to save user.');
      console.error(err);
      error('Failed to save user.');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      role: teacher.role || 'teacher',
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        setErrorMessage(null);
        await deleteUser(id);
        await fetchFaculty();
        error('Faculty member removed');
      } catch (err) {
        setErrorMessage('Failed to delete user.');
        console.error(err);
        error('Failed to delete user.');
      }
    }
  };

  const getColorVariant = (index) => {
    const variants = [
      'from-sky-400 via-sky-500 to-blue-600',
      'from-emerald-400 via-emerald-500 to-teal-600',
      'from-amber-400 via-orange-500 to-rose-500',
      'from-purple-400 via-fuchsia-500 to-indigo-600'
    ];
    return variants[index % variants.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading faculty members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Header user={currentUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Faculty Management
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <i className="fas fa-users-cog text-primary-500"></i> 
                    Manage all faculty members and their roles
                  </>
                ) : (
                  <>
                    <i className="fas fa-users text-slate-400"></i> 
                    View faculty directory (Read-only mode)
                  </>
                )}
              </p>
            </div>
            {isAdmin && (
              <button 
                className="btn-primary flex items-center gap-2"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-user-plus"></i> 
                Add Faculty Member
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrichedFaculty.map((teacher, index) => (
            <div 
              key={teacher.id} 
              className={`glass-card group ${isAdmin ? 'glass-card--interactive' : ''}`}
              onClick={() => isAdmin && handleEdit(teacher)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <span className="absolute -top-1 -left-1 h-14 w-14 rounded-full bg-primary-500/20 blur-2xl"></span>
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getColorVariant(index)} text-white shadow-lg`}>
                    <i className="fas fa-chalkboard-teacher text-lg"></i>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
                  <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    teacher.role === 'admin' || teacher.role === 'ADMIN'
                      ? 'bg-rose-50 text-rose-500'
                      : 'bg-sky-50 text-sky-600'
                  }`}>
                    <i className={`fas ${teacher.role === 'admin' || teacher.role === 'ADMIN' ? 'fa-crown' : 'fa-user'}`}></i>
                    {teacher.role?.toUpperCase() || 'TEACHER'}
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-5 space-y-3">
                <div>
                  <h4 className="text-xl font-semibold text-slate-800">{teacher.name}</h4>
                  <p className="text-sm text-slate-500">Dedicated educator shaping the future classroom experience.</p>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <i className="fas fa-envelope text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                      <p className="text-sm font-medium text-slate-700 truncate">{teacher.email}</p>
                    </div>
                  </div>
                  {(teacher.departmentsLed?.length || teacher.department) && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <i className="fas fa-building text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Departments</p>
                        {teacher.departmentsLed?.length ? (
                          <ul className="text-sm font-medium text-slate-700 space-y-1">
                            {teacher.departmentsLed.map((dept) => (
                              <li key={dept.id}>{dept.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm font-medium text-slate-700">
                            {teacher.department}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                      <i className="fas fa-graduation-cap text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Subjects / Classes</p>
                      {teacher.taughtSubjects?.length ? (
                        <ul className="text-sm font-medium text-slate-700 space-y-1">
                          {teacher.taughtSubjects.map((subject, idx) => (
                            <li key={idx}>{subject}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">No classes assigned yet.</p>
                      )}
                    </div>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                        <i className="fas fa-phone text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Contact</p>
                        <p className="text-sm font-medium text-slate-700">{teacher.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isAdmin && (
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Manage profile</span>
                  <div className="flex gap-2">
                    <button 
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(teacher);
                      }}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button 
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(teacher.id);
                      }}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {faculty.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No faculty members found</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first faculty member.</p>
            {isAdmin && (
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-user-plus mr-2"></i>
                Add First Faculty Member
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingTeacher ? 'Edit Faculty Member' : 'Add New Faculty Member'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-slate-400"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field"
                      placeholder="e.g., Dr. John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field"
                      placeholder="e.g., john.smith@university.edu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Role *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="input-field"
                    >
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {!editingTeacher && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="input-field"
                        placeholder="Enter password"
                      />
                    </div>
                  )}

                  {editingTeacher && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl p-4">
                      Passwords can no longer be updated by admins. Ask the teacher to use the &ldquo;Forgot password&rdquo; option on the sign-in page.
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingTeacher ? 'Update Faculty Member' : 'Add Faculty Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
