// src/pages/Labs.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getLabs, createLab, updateLab, deleteLab, getTeachers, getSubjects, getDepartments } from '../api';

const Labs = () => {
  const { currentUser } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    resources: [],
    subject_id: '',
    department_id: '',
    teacher: '',
    room: '',
    day: '',
    time_slot: '',
    duration: 60,
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

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const fetchedLabs = await getLabs();
      setLabs(fetchedLabs);
    } catch (err) {
      setError('Failed to fetch labs.');
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLab) {
        await updateLab(editingLab.id, formData);
      } else {
        await createLab(formData);
      }
      await fetchLabs();
      resetForm();
    } catch (err) {
      setError('Failed to save lab.');
      console.error(err);
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name || '',
      capacity: lab.capacity || 0,
      resources: lab.resources || [],
      subject_id: lab.subject_id || '',
      department_id: lab.department_id || '',
      teacher: lab.teacher || '',
      room: lab.room || '',
      day: lab.day || '',
      time_slot: lab.time_slot || '',
      duration: lab.duration || 60,
      max_students: lab.max_students || 30,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        await deleteLab(id);
        await fetchLabs();
      } catch (err) {
        setError('Failed to delete lab.');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 0,
      resources: [],
      subject_id: '',
      department_id: '',
      teacher: '',
      room: '',
      day: '',
      time_slot: '',
      duration: 60,
      max_students: 30,
    });
    setEditingLab(null);
    setShowForm(false);
  };

  const getColorVariant = (index) => {
    const variants = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'];
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Labs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {labs.map((lab, index) => (
            <div
              key={lab.id}
              className={`group relative bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isAdmin ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isAdmin && handleEdit(lab)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    getColorVariant(index) === 'blue'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : getColorVariant(index) === 'green'
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : getColorVariant(index) === 'orange'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                      : getColorVariant(index) === 'purple'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                      : getColorVariant(index) === 'red'
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  }`}
                >
                  <i className="fas fa-flask text-white text-lg"></i>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{lab.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-users"></i>
                    <span>{lab.capacity} students</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-3">Laboratory Details</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-calendar-alt text-purple-500 w-4 mt-1"></i>
                    <div>
                      <span className="font-medium">Schedule:</span>
                      {lab.day && lab.time_slot ? (
                        <div className="text-slate-700">
                          {lab.day}, {lab.time_slot}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">Not scheduled</div>
                      )}
                    </div>
                  </div>

                  {lab.teacher_name && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-user-tie text-indigo-500 w-4"></i>
                      <span>
                        <strong>Teacher:</strong> {lab.teacher_name}
                      </span>
                    </div>
                  )}

                  {lab.room && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-door-open text-green-500 w-4"></i>
                      <span>
                        <strong>Room:</strong> {lab.room}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-2">
                  <button
                    className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(lab);
                    }}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(lab.id);
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
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        min="30"
                        max="180"
                        step="15"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="input-field"
                      />
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
