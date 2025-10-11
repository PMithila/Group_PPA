// src/pages/Subjects.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject, updateSubject, deleteSubject, getDepartments } from '../api';

const Subjects = () => {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
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
      setError('Failed to fetch subjects.');
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
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
      } else {
        await createSubject(formData);
      }
      await fetchSubjects();
      resetForm();
    } catch (err) {
      setError('Failed to save subject.');
      console.error(err);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code || '',
      name: subject.name || '',
      description: subject.description || '',
      credits: subject.credits || 3,
      department_id: subject.department_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
        await fetchSubjects();
      } catch (err) {
        setError('Failed to delete subject.');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      credits: 3,
      department_id: ''
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  const getColorVariant = (index) => {
    const variants = ['blue', 'green', 'orange', 'purple', 'red', 'indigo', 'pink', 'teal'];
    return variants[index % variants.length];
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <div 
              key={subject.id} 
              className={`group relative bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isAdmin ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isAdmin && handleEdit(subject)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  getColorVariant(index) === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  getColorVariant(index) === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  getColorVariant(index) === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  getColorVariant(index) === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  getColorVariant(index) === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  getColorVariant(index) === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                  getColorVariant(index) === 'pink' ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                  'bg-gradient-to-r from-teal-500 to-teal-600'
                }`}>
                  <i className="fas fa-book text-white text-lg"></i>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{subject.code}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-star"></i>
                    <span>{subject.credits} credits</span>
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-3">{subject.name}</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-code text-blue-500 w-4"></i>
                    <span><strong>Code:</strong> {subject.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-yellow-500 w-4"></i>
                    <span><strong>Credits:</strong> {subject.credits}</span>
                  </div>
                  {subject.department_name && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-green-500 w-4"></i>
                      <span><strong>Department:</strong> {subject.department_name}</span>
                    </div>
                  )}
                  {subject.description && (
                    <div className="flex items-start gap-2">
                      <i className="fas fa-info-circle text-purple-500 w-4 mt-1"></i>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {subject.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isAdmin && (
                <div className="flex justify-end gap-2">
                  <button 
                    className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(subject);
                    }}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(subject.id);
                    }}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
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
                      Credits *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                      className="input-field"
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