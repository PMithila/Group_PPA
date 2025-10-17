// src/pages/Classes.js
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { getClasses, createClass, updateClass, deleteClass, getTeachers, getSubjects, getDepartments } from '../api';
import { teacherNotificationService } from '../services/teacherNotificationService';

const HONORIFICS = ['mr', 'ms', 'mrs', 'miss', 'dr', 'prof', 'sir', 'madam'];

const stripHonorifics = (name = '') => {
  if (!name) return '';
  const parts = name
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

const Classes = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    subject_id: '',
    department_id: '',
    teacher_id: '',
    teacher_name: '',
    room: '',
    day: '',
    time_slot: '',
    max_students: 30
  });
  const fixedTimeSlots = [
    '7:30-8:10',
    '8:10-8:30',
    '8:30-9:10',
    '9:10-10:30',
    '10:50-11:30',
    '11:30-12:10',
    '12:10-12:50',
    '12:50-1:30'
  ];
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => {
      const nameA = a.name || a.email || '';
      const nameB = b.name || b.email || '';
      return nameA.localeCompare(nameB);
    });
  }, [teachers]);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  // Check if subjects are available
  const hasSubjects = subjects.length > 0;

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      console.log('Fetching classes...');
      const fetchedClasses = await getClasses();
      console.log('Classes fetched successfully:', fetchedClasses.length);
      setClasses(fetchedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setErrorMessage('Failed to fetch classes. Please check your connection and try again.');
      setClasses([]); // Set empty array instead of leaving undefined
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('Fetching teachers...');
      const fetchedTeachers = await getTeachers();
      console.log('Teachers fetched successfully:', fetchedTeachers.length);
      setTeachers(fetchedTeachers);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setTeachers([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects...');
      const fetchedSubjects = await getSubjects();
      console.log('Subjects fetched successfully:', fetchedSubjects.length);
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setSubjects([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const fetchedDepartments = await getDepartments();
      console.log('Departments fetched successfully:', fetchedDepartments.length);
      setDepartments(fetchedDepartments);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      // Normalize and validate payload to match backend expectations
      const selectedTeacher = teachers.find((t) => String(t.id) === formData.teacher_id);

      const payload = {
        code: (formData.code || '').trim(),
        name: (formData.name || '').trim(),
        subject_id: formData.subject_id && formData.subject_id !== '' ? Number(formData.subject_id) : null,
        department_id: formData.department_id && formData.department_id !== '' ? Number(formData.department_id) : null,
        teacher: selectedTeacher?.name || selectedTeacher?.email || formData.teacher_name || null,
        teacher_id: formData.teacher_id ? Number(formData.teacher_id) : null,
        teacher_email: selectedTeacher?.email || null,
        room: formData.room || null,
        day: formData.day || null,
        time_slot: formData.time_slot || null,
        max_students: formData.max_students ? Number(formData.max_students) : 30,
      };

      if (formData.teacher_name && !payload.teacher_id && !selectedTeacher) {
        setErrorMessage('Please select a teacher from the list to assign this class.');
        error('Please select a teacher from the list to assign this class.');
        return;
      }

      if (!payload.code || !payload.name || !payload.subject_id || payload.subject_id === 0) {
        setErrorMessage('Please select a subject (auto-fills code and name).');
        return;
      }

      if (!payload.teacher_id) {
        setErrorMessage('Please select a teacher for this class.');
        error('Please select a teacher for this class.');
        return;
      }

      // Validate that subject_id exists in subjects array
      const selectedSubject = subjects.find(s => s.id === payload.subject_id);
      if (!selectedSubject) {
        setErrorMessage('Selected subject is no longer available. Please refresh the page and try again.');
        return;
      }

      // Validate that department_id exists in departments array if provided
      if (payload.department_id) {
        const selectedDepartment = departments.find(d => d.id === payload.department_id);
        if (!selectedDepartment) {
          setErrorMessage('Selected department is no longer available. Please refresh the page and try again.');
          return;
        }
      }

      console.log('Creating/updating class with payload:', payload);

      if (editingClass) {
        await updateClass(editingClass.id, payload);
        console.log('Class updated successfully');
        success('Class updated successfully');
      } else {
        await createClass(payload);
        console.log('Class created successfully');
        success('Class created successfully');
      }

      if (payload.teacher_id) {
        await teacherNotificationService.emitScheduleSnapshot({
          id: payload.teacher_id,
          name: payload.teacher,
          email: selectedTeacher?.email
        });
      }

      await fetchClasses();
      resetForm();
    } catch (err) {
      console.error('Create/Update class failed:', err);
      const serverMsg = err?.response?.data?.error || err?.message || 'Failed to save class.';
      setErrorMessage(serverMsg);
      error(serverMsg || 'Failed to save class.');
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    let teacherId = cls.teacher_id ? String(cls.teacher_id) : '';

    if (!teacherId && cls.teacher) {
      const normalized = stripHonorifics(cls.teacher).trim().toLowerCase();
      const matchedTeacher = teachers.find((teacher) => {
        const teacherName = teacher.name ? stripHonorifics(teacher.name).trim().toLowerCase() : '';
        return teacherName && teacherName === normalized;
      });
      if (matchedTeacher) {
        teacherId = String(matchedTeacher.id);
      }
    }

    const selectedTeacher = teachers.find((teacher) => String(teacher.id) === teacherId);

    setFormData({
      code: cls.code || '',
      name: cls.name || '',
      subject_id: cls.subject_id || '',
      department_id: cls.department_id || '',
      teacher_id: teacherId,
      teacher_name: selectedTeacher?.name || cls.teacher || '',
      room: cls.room || '',
      day: cls.day || '',
      time_slot: cls.time_slot || '',
      max_students: cls.max_students || 30
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setErrorMessage(null);
        console.log('Deleting class with ID:', id);
        await deleteClass(id);
        console.log('Class deleted successfully');
        error('Class deleted successfully');
        await fetchClasses();
      } catch (err) {
        console.error('Delete class failed:', err);
        setErrorMessage('Failed to delete class.');
        error('Failed to delete class.');
      }
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const selectedSubject = subjects.find(subject => subject.id === parseInt(subjectId));

    if (subjectId && selectedSubject) {
      setFormData({
        ...formData,
        subject_id: subjectId,
        code: selectedSubject.code,
        name: selectedSubject.name
      });
    } else {
      setFormData({
        ...formData,
        subject_id: '',
        code: '',
        name: ''
      });
    }
  };

  const handleTeacherChange = (teacherId) => {
    if (!teacherId) {
      setFormData((prev) => ({
        ...prev,
        teacher_id: '',
        teacher_name: ''
      }));
      return;
    }

    const selectedTeacher = teachers.find((teacher) => String(teacher.id) === teacherId);
    setFormData((prev) => ({
      ...prev,
      teacher_id: teacherId,
      teacher_name: selectedTeacher?.name || selectedTeacher?.email || ''
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      subject_id: '',
      department_id: '',
      teacher_id: '',
      teacher_name: '',
      room: '',
      day: '',
      time_slot: '',
      max_students: 30
    });
    setEditingClass(null);
    setShowForm(false);
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
          <p className="text-slate-600">Loading classes...</p>
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
                Subjects
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <i className="fas fa-edit text-primary-500"></i> 
                    Manage all subjects for your timetable
                  </>
                ) : (
                  <>
                    <i className="fas fa-eye text-slate-400"></i> 
                    View all subjects (Read-only mode)
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

        {/* No Subjects Available Message */}
        {!loading && !hasSubjects && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
              <div>
                <h3 className="font-semibold text-yellow-800">No Subjects Available</h3>
                <p className="text-yellow-700">
                  You need to add subjects before you can create classes.
                  <a href="/subjects" className="ml-2 text-primary-600 hover:text-primary-700 underline">
                    Go to Subjects page →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classes.map((cls, index) => (
            <div 
              key={cls.id} 
              className={`glass-card group ${isAdmin ? 'glass-card--interactive' : ''}`}
              onClick={() => isAdmin && handleEdit(cls)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <span className="absolute -top-1 -left-1 h-14 w-14 rounded-full bg-primary-500/25 blur-2xl"></span>
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getColorVariant(index)} text-white shadow-lg`}>
                    <i className="fas fa-book text-lg"></i>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Course code</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{cls.code}</p>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    <i className="fas fa-users text-primary-500"></i>
                    {cls.max_students || 30} students
                  </span>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-5 space-y-3">
                <h4 className="text-xl font-semibold text-slate-800">{cls.name}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {cls.description || 'A curated learning experience tailored to your academic pathway.'}
                </p>
                <div className="space-y-3 text-sm text-slate-600">
                  {cls.subject_name && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <i className="fas fa-book-open text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Subject</p>
                        <p className="text-sm font-semibold text-slate-700">{cls.subject_name}</p>
                      </div>
                    </div>
                  )}
                  {cls.department_name && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <i className="fas fa-building text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
                        <p className="text-sm font-semibold text-slate-700">{cls.department_name}</p>
                      </div>
                    </div>
                  )}
                  {(cls.teacher_full_name || cls.teacher) && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                        <i className="fas fa-chalkboard-teacher text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Instructor</p>
                        <p className="text-sm font-semibold text-slate-700">{cls.teacher_full_name || cls.teacher}</p>
                      </div>
                    </div>
                  )}
                  {cls.room && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                        <i className="fas fa-door-open text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                        <p className="text-sm font-semibold text-slate-700">{cls.room}</p>
                      </div>
                    </div>
                  )}
                  {cls.day && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                        <i className="fas fa-calendar-day text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Day</p>
                        <p className="text-sm font-semibold text-slate-700">{cls.day}</p>
                      </div>
                    </div>
                  )}
                  {cls.time_slot && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                        <i className="fas fa-clock text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Time</p>
                        <p className="text-sm font-semibold text-slate-700">{cls.time_slot}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isAdmin && (
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Manage class</span>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(cls);
                      }}
                      title="Edit"
                      required
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cls.id);
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
        {classes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No classes found</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first class.</p>
            {isAdmin && (
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus mr-2"></i>
                Add First Class
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
                  {editingClass ? 'Edit Class' : 'Add New Class'}
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
                      value={formData.code}
                      className="input-field bg-slate-50 cursor-not-allowed"
                      placeholder="Auto-filled from subject"
                      readOnly
                    />
                    <p className="text-xs text-slate-500 mt-1">Automatically filled from selected subject</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      className="input-field bg-slate-50 cursor-not-allowed"
                      placeholder="Auto-filled from subject"
                      readOnly
                    />
                    <p className="text-xs text-slate-500 mt-1">Automatically filled from selected subject</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject_id}
                      onChange={handleSubjectChange}
                      className="input-field"
                      required
                      disabled={!hasSubjects}
                    >
                      <option value="">
                        {hasSubjects ? 'Select Subject' : 'No subjects available - please add subjects first'}
                      </option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                    {!hasSubjects && (
                      <p className="text-xs text-orange-600 mt-1">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Please add subjects in the Subjects section before creating classes.
                      </p>
                    )}
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Teacher
                    </label>
                    <select
                      value={formData.teacher_id}
                      onChange={(e) => handleTeacherChange(e.target.value)}
                      className="input-field"
                      disabled={!teachers.length}
                    >
                      <option value="">Select Teacher</option>
                      {sortedTeachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name || teacher.email || `Teacher #${teacher.id}`}
                        </option>
                      ))}
                    </select>
                    {!teachers.length && (
                      <p className="text-xs text-amber-600 mt-1">
                        No teachers available. Please add teachers before assigning classes.
                      </p>
                    )}
                    {formData.teacher_name && !formData.teacher_id && (
                      <p className="text-xs text-amber-600 mt-1">
                        Previously assigned to "{formData.teacher_name}". Please select the matching teacher from the list.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Room
                    </label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      className="input-field"
                      placeholder="e.g., Room A101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Day
                    </label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({...formData, day: e.target.value})}
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
                      Time Slot *
                    </label>
                    <select
                      value={formData.time_slot}
                      onChange={(e) => setFormData({...formData, time_slot: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select Time Slot</option>
                      {fixedTimeSlots.map(ts => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Students
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.max_students}
                      onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                      className="input-field"
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
                    disabled={!hasSubjects}
                  >
                    {editingClass ? 'Update Class' : 'Add Class'}
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

export default Classes;
