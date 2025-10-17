// src/pages/Departments.js
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { getDepartments, getTeachers, createDepartment, updateDepartment, deleteDepartment } from '../api';

const Departments = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    head_of_department_id: '',
    contact_email: ''
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const fetchedDepartments = await getDepartments();
      setDepartments(fetchedDepartments);
    } catch (err) {
      setErrorMessage('Failed to fetch departments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const teacherList = await getTeachers();
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, []);

  const assignedHeadIds = useMemo(() => {
    const ids = new Set();
    departments.forEach((dept) => {
      if (!dept?.head_of_department_id) return;
      if (editingDepartment && dept.id === editingDepartment.id) return;
      ids.add(String(dept.head_of_department_id));
    });
    return ids;
  }, [departments, editingDepartment]);

  const availableTeacherOptions = useMemo(() => {
    return teachers.filter((teacher) => !assignedHeadIds.has(String(teacher.id)));
  }, [teachers, assignedHeadIds]);

  const teacherSelectOptions = useMemo(() => {
    const options = [...availableTeacherOptions];

    if (editingDepartment && formData.head_of_department_id) {
      const exists = options.some(
        (teacher) => String(teacher.id) === formData.head_of_department_id
      );
      if (!exists) {
        const fallback = teachers.find(
          (teacher) => String(teacher.id) === formData.head_of_department_id
        );
        if (fallback) {
          options.push(fallback);
        }
      }
    }

    return options.sort((a, b) => {
      const aName = a.name || a.email || '';
      const bName = b.name || b.email || '';
      return aName.localeCompare(bName);
    });
  }, [availableTeacherOptions, editingDepartment, formData.head_of_department_id, teachers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'head_of_department_id') {
      if (!value) {
        setFormData((prev) => ({
          ...prev,
          head_of_department_id: '',
          contact_email: prev.contact_email
        }));
        return;
      }

      const selectedTeacher = teachers.find((teacher) => String(teacher.id) === value);
      setFormData((prev) => ({
        ...prev,
        head_of_department_id: value,
        contact_email: prev.contact_email || selectedTeacher?.email || ''
      }));
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMessage('You do not have permission to perform this action.');
      error('You do not have permission to perform this action.');
      return;
    }

    try {
      setErrorMessage(null);
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        head_of_department_id: formData.head_of_department_id
          ? Number(formData.head_of_department_id)
          : null,
        contact_email: formData.contact_email.trim()
      };

      if (!payload.code || !payload.name) {
        setErrorMessage('Code and name are required.');
        error('Code and name are required.');
        return;
      }

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, payload);
        success('Department updated successfully');
      } else {
        await createDepartment(payload);
        success('Department created successfully');
      }
      await fetchDepartments();
      resetForm();
    } catch (err) {
      setErrorMessage('Failed to save department.');
      console.error(err);
      error('Failed to save department.');
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code || '',
      name: department.name || '',
      description: department.description || '',
      head_of_department_id: department.head_of_department_id
        ? String(department.head_of_department_id)
        : '',
      contact_email: department.contact_email || department.head_teacher_email || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setErrorMessage('You do not have permission to perform this action.');
      error('You do not have permission to perform this action.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setErrorMessage(null);
        await deleteDepartment(id);
        error('Department deleted successfully');
        await fetchDepartments();
      } catch (err) {
        setErrorMessage('Failed to delete department.');
        console.error(err);
        error('Failed to delete department.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      head_of_department_id: '',
      contact_email: ''
    });
    setEditingDepartment(null);
    setShowForm(false);
  };

  const getColorVariant = (index) => {
    const variants = ['blue', 'green', 'orange', 'purple', 'red', 'indigo', 'pink', 'teal', 'cyan', 'emerald'];
    return variants[index % variants.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading class...</p>
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
                Class Management
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <i className="fas fa-university text-primary-500"></i> 
                    Manage all academic class and faculties
                  </>
                ) : (
                  <>
                    <i className="fas fa-building text-slate-400"></i> 
                    View class directory (Read-only mode)
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
                Add New Class
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

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((department, index) => (
            <div 
              key={department.id} 
              className={`group relative bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isAdmin ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isAdmin && handleEdit(department)}
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
                  getColorVariant(index) === 'teal' ? 'bg-gradient-to-r from-teal-500 to-teal-600' :
                  getColorVariant(index) === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' :
                  'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}>
                  <i className="fas fa-university text-white text-lg"></i>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{department.code}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-users"></i>
                    <span>Class</span>
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-3">{department.name}</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-code text-blue-500 w-4"></i>
                    <span><strong>Code:</strong> {department.code}</span>
                  </div>
                  {(department.head_teacher_name || department.head_of_department) && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-user-tie text-green-500 w-4"></i>
                      <span>
                        <strong>Teacher:</strong>{' '}
                        {department.head_teacher_name || department.head_of_department}
                      </span>
                    </div>
                  )}
                  {(department.contact_email || department.head_teacher_email) && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-envelope text-purple-500 w-4"></i>
                      <span>
                        <strong>Email:</strong>{' '}
                        {department.contact_email || department.head_teacher_email}
                      </span>
                    </div>
                  )}
                  {department.description && (
                    <div className="flex items-start gap-2">
                      <i className="fas fa-info-circle text-orange-500 w-4 mt-1"></i>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {department.description}
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
                      handleEdit(department);
                    }}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(department.id);
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
        {departments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-university text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No cklass found</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first class.</p>
            {isAdmin && (
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus mr-2"></i>
                Add First class
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
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
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
                      Class Code *
                    </label>
                    <input
                      type="text"
                      required
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., CS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department Head
                    </label>
                    <select
                      name="head_of_department_id"
                      value={formData.head_of_department_id}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">No head assigned</option>
                      {teacherSelectOptions.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name || teacher.email || `Teacher #${teacher.id}`}
                        </option>
                      ))}
                    </select>
                    {teachers.length > 0 && teacherSelectOptions.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        All teachers are currently assigned as department heads. Remove an existing assignment to free a teacher.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., head@cs.university.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field h-24 resize-none"
                    placeholder="Enter department description..."
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
                    {editingDepartment ? 'Update Department' : 'Add Department'}
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

export default Departments;
