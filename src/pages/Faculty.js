// src/pages/Faculty.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getTeachers, createUser, updateUser, deleteUser } from '../api';

const Faculty = () => {
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      setError('Please log in to view users.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedFaculty = await getTeachers();
      setFaculty(fetchedFaculty);
    } catch (err) {
      setError('Failed to fetch users.');
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
      if (editingTeacher) {
        await updateUser(editingTeacher.id, formData);
      } else {
        await createUser(formData);
      }
      await fetchFaculty();
      resetForm();
    } catch (err) {
      setError('Failed to save user.');
      console.error(err);
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
        await deleteUser(id);
        await fetchFaculty();
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err);
      }
    }
  };

  const getColorVariant = (index) => {
    const variants = ['blue', 'green', 'orange', 'purple'];
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {faculty.map((teacher, index) => (
            <div 
              key={teacher.id} 
              className={`group relative bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isAdmin ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isAdmin && handleEdit(teacher)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  getColorVariant(index) === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  getColorVariant(index) === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  getColorVariant(index) === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  getColorVariant(index) === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-slate-500 to-slate-600'
                }`}>
                  <i className="fas fa-chalkboard-teacher text-white text-lg"></i>
                </div>
                
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    teacher.role === 'admin' || teacher.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {teacher.role?.toUpperCase() || 'TEACHER'}
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">{teacher.name}</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-envelope text-slate-400 w-4"></i>
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  {teacher.department && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-blue-500 w-4"></i>
                      <span>{teacher.department}</span>
                    </div>
                  )}
                  {teacher.specialization && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-graduation-cap text-green-500 w-4"></i>
                      <span>{teacher.specialization}</span>
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-phone text-orange-500 w-4"></i>
                      <span>{teacher.phone}</span>
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
                      handleEdit(teacher);
                    }}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(teacher.id);
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {editingTeacher ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      required={!editingTeacher}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="input-field"
                      placeholder="Enter password"
                    />
                  </div>
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