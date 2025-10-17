// src/pages/Labs.js
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { getLabs, createLab, updateLab, deleteLab, getTeachers, getSubjects, getDepartments } from '../api';

const Labs = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  const [formData, setFormData] = useState({
    capacity: 0,
    resources: [],
    subject_id: '',
    department_id: '',
    teacher: '',
    room: '',
    day: '',
    time_slot: '',
    max_students: 30,
  });

  const fixedTimeSlots = [
    '7:30-8:10',
    '8:10-8:30',
    '8:30-9:10',
    '9:10-10:30',
    '10:50-11:30',
    '11:30-12:10',
    '12:10-12:50',
    '12:50-1:30',
  ];

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const subjectsById = useMemo(() => {
    const map = {};
    subjects.forEach(subject => {
      if (subject?.id != null) {
        map[String(subject.id)] = subject;
      }
    });
    return map;
  }, [subjects]);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const fetchedLabs = await getLabs();
      setLabs(fetchedLabs);
    } catch (err) {
      setErrorMessage('Failed to fetch labs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const fetchedSubjects = await getSubjects();
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
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
    fetchLabs();
    fetchTeachers();
    fetchSubjects();
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject_id') {
      const selectedSubject = subjectsById[value];
      setFormData(prev => ({
        ...prev,
        subject_id: value,
        department_id: selectedSubject?.department_id
          ? String(selectedSubject.department_id)
          : prev.department_id
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      if (editingLab) {
        await updateLab(editingLab.id, formData);
        success('Lab updated successfully');
      } else {
        await createLab(formData);
        success('Lab created successfully');
      }
      await fetchLabs();
      resetForm();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to save lab.';
      setErrorMessage(message);
      console.error('Failed to save lab:', err);
      error(message || 'Failed to save lab.');
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      capacity: lab.capacity || 0,
      resources: lab.resources || [],
      subject_id: lab.subject_id ? String(lab.subject_id) : '',
      department_id: lab.department_id ? String(lab.department_id) : '',
      teacher: lab.teacher ? String(lab.teacher) : '',
      room: lab.room || '',
      day: lab.day || '',
      time_slot: lab.time_slot || '',
      max_students: lab.max_students || 30,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        setErrorMessage(null);
        await deleteLab(id);
        error('Lab deleted successfully');
        await fetchLabs();
      } catch (err) {
        setErrorMessage('Failed to delete lab.');
        console.error(err);
        error('Failed to delete lab.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      capacity: 0,
      resources: [],
      subject_id: '',
      department_id: '',
      teacher: '',
      room: '',
      day: '',
      time_slot: '',
      max_students: 30,
    });
    setEditingLab(null);
    setShowForm(false);
  };

  const getColorVariant = (index) => {
    const variants = [
      'from-violet-400 via-purple-500 to-indigo-600',
      'from-teal-400 via-emerald-500 to-lime-500',
      'from-rose-400 via-orange-500 to-amber-500',
      'from-sky-400 via-blue-500 to-cyan-500',
      'from-fuchsia-400 via-rose-500 to-red-500',
      'from-indigo-400 via-purple-500 to-blue-600'
    ];
    return variants[index % variants.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading laboratories...</p>
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
                Laboratory Management
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <i className="fas fa-flask text-primary-500"></i>
                    Manage laboratory sessions and scheduling
                  </>
                ) : (
                  <>
                    <i className="fas fa-microscope text-slate-400"></i>
                    View laboratory directory (Read-only mode)
                  </>
                )}
              </p>
            </div>
            {isAdmin && (
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-calendar-plus"></i>
                Schedule Lab Session
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Labs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {labs.map((lab, index) => (
            <div
              key={lab.id}
              className={`glass-card group ${isAdmin ? 'glass-card--interactive' : ''}`}
              onClick={() => isAdmin && handleEdit(lab)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <span className="absolute -top-1 -left-1 h-14 w-14 rounded-full bg-purple-500/20 blur-2xl"></span>
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getColorVariant(index)} text-white shadow-lg`}
                  >
                    <i className="fas fa-flask text-lg"></i>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Laboratory</p>
                  <div className="mt-1 text-lg font-semibold text-slate-800">{lab.subject_name || lab.name}</div>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    <i className="fas fa-users text-primary-500"></i>
                    Capacity {lab.capacity || lab.max_students || 0}
                  </span>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                <h4 className="text-xl font-semibold text-slate-800">Laboratory Details</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Equip your students with hands-on exploration inside a modern, well-resourced workspace.
                </p>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                      <i className="fas fa-calendar-alt text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Schedule</p>
                      {lab.day && lab.time_slot ? (
                        <p className="text-sm font-semibold text-slate-700">
                          {lab.day}, {lab.time_slot}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-slate-500 italic">Not scheduled</p>
                      )}
                    </div>
                  </div>

                  {lab.teacher_name && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                        <i className="fas fa-user-tie text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Lead Instructor</p>
                        <p className="text-sm font-semibold text-slate-700">{lab.teacher_name}</p>
                      </div>
                    </div>
                  )}

                  {lab.room && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                        <i className="fas fa-door-open text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                        <p className="text-sm font-semibold text-slate-700">{lab.room}</p>
                      </div>
                    </div>
                  )}

                  {Array.isArray(lab.resources) && lab.resources.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                        <i className="fas fa-toolbox text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Resources</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {lab.resources.slice(0, 3).join(', ')}
                          {lab.resources.length > 3 && '…'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Manage session</span>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(lab);
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
                        handleDelete(lab.id);
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

        {/* Empty state */}
        {labs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-flask text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No laboratories found</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first laboratory.</p>
            {isAdmin && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus mr-2"></i>
                Add First Laboratory
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-h-[90vh] overflow-y-auto w-full max-w-3xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingLab ? 'Edit Lab Session' : 'Schedule Lab Session'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-slate-400"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-t border-slate-200 pt-6 mb-4">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">
                    Lab Session Scheduling
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Department
                      </label>
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleInputChange}
                        className="input-field"
                      required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subject
                      </label>
                      <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleInputChange}
                        className="input-field"
                      required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teacher
                      </label>
                      <select
                        name="teacher"
                        value={formData.teacher}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Room
                      </label>
                      <input
                        type="text"
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Room 101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Day
                      </label>
                      <select
                        name="day"
                        value={formData.day}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Time Slot
                      </label>
                      <select
                        name="time_slot"
                        value={formData.time_slot}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select Time Slot</option>
                        {fixedTimeSlots.map((slot, index) => (
                          <option key={index} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Max Students
                      </label>
                      <input
                        type="number"
                        name="max_students"
                        min="1"
                        max="100"
                        value={formData.max_students}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingLab ? 'Update Lab Session' : 'Schedule Lab Session'}
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

export default Labs;
