// src/pages/Subjects.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject, updateSubject, deleteSubject, getDepartments } from '../api';

const Subjects = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department_id: ''
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const fetchedSubjects = await getSubjects();
      setSubjects(fetchedSubjects);
    } catch (err) {
      setErrorMessage('Failed to fetch subjects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const fetchedDepartments = await getDepartments();
      setDepartments(fetchedDepartments);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        department_id: formData.department_id ? Number(formData.department_id) : null
      };

      if (!payload.code || !payload.name) {
        setErrorMessage('Code and name are required.');
        error('Code and name are required.');
        return;
      }

      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
        success('Subject updated successfully');
      } else {
        await createSubject(payload);
        success('Subject created successfully');
      }
      await fetchSubjects();
      resetForm();
    } catch (err) {
      setErrorMessage('Failed to save subject.');
      console.error(err);
      error('Failed to save subject.');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code || '',
      name: subject.name || '',
      description: subject.description || '',
      department_id: subject.department_id ? String(subject.department_id) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        setErrorMessage(null);
        await deleteSubject(id);
        error('Subject deleted successfully');
        await fetchSubjects();
      } catch (err) {
        setErrorMessage('Failed to delete subject.');
        console.error(err);
        error('Failed to delete subject.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      department_id: ''
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  const getColorVariant = (index) => {
    const gradients = [
      'from-blue-500 via-blue-500 to-indigo-600',
      'from-emerald-400 via-emerald-500 to-teal-600',
      'from-amber-400 via-orange-500 to-rose-500',
      'from-purple-400 via-fuchsia-500 to-indigo-600',
      'from-rose-400 via-red-500 to-amber-500',
      'from-indigo-400 via-blue-500 to-purple-600',
      'from-pink-400 via-fuchsia-500 to-rose-500',
      'from-teal-400 via-cyan-500 to-sky-500'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading subjects...</p>
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
                Subject Management
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <i className="fas fa-book-open text-primary-500"></i> 
                    Manage all academic subjects and courses
                  </>
                ) : (
                  <>
                    <i className="fas fa-graduation-cap text-slate-400"></i> 
                    View subject catalog (Read-only mode)
                  </>
                )}
              </p>
            </div>
            {isAdmin && (
              <button 
                className="btn-primary flex items-center gap-2"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus"></i> 
                Add New Subject
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

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <div 
              key={subject.id} 
              className={`glass-card group ${isAdmin ? 'glass-card--interactive' : ''}`}
              onClick={() => isAdmin && handleEdit(subject)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <span className="absolute -top-1 -left-1 h-14 w-14 rounded-full bg-primary-500/20 blur-2xl"></span>
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getColorVariant(index)} text-white shadow-lg`}>
                    <i className="fas fa-book text-lg"></i>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Subject code</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{subject.code}</p>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-5 space-y-3">
                <h4 className="text-xl font-semibold text-slate-800">{subject.name}</h4>
                {subject.description && (
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {subject.description}
                  </p>
                )}
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <i className="fas fa-code text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Code</p>
                      <p className="text-sm font-medium text-slate-700">{subject.code}</p>
                    </div>
                  </div>
                  {subject.department_name && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                        <i className="fas fa-building text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
                        <p className="text-sm font-medium text-slate-700">{subject.department_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isAdmin && (
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Manage subject</span>
                  <div className="flex gap-2">
                    <button 
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(subject);
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
                        handleDelete(subject.id);
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
        {subjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No subjects found</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first subject.</p>
            {isAdmin && (
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus mr-2"></i>
                Add First Subject
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
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="input-field"
                      placeholder="e.g., CS101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field"
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field h-24 resize-none"
                    placeholder="Enter subject description..."
                  />
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
                    {editingSubject ? 'Update Subject' : 'Add Subject'}
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

export default Subjects;
