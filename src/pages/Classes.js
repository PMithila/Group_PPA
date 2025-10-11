// src/pages/Classes.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getClasses, createClass, updateClass, deleteClass, getTeachers, getSubjects, getDepartments } from '../api';

const Classes = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    subject_id: '',
    department_id: '',
    teacher: '',
    room: '',
    day: '',
    time_slot: '',
    duration: 60,
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

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  // Check if subjects are available
  const hasSubjects = subjects.length > 0;

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching classes...');
      const fetchedClasses = await getClasses();
      console.log('Classes fetched successfully:', fetchedClasses.length);
      setClasses(fetchedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes. Please check your connection and try again.');
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
      setError(null);
      // Normalize and validate payload to match backend expectations
      const payload = {
        code: (formData.code || '').trim(),
        name: (formData.name || '').trim(),
        subject_id: formData.subject_id && formData.subject_id !== '' ? Number(formData.subject_id) : null,
        department_id: formData.department_id && formData.department_id !== '' ? Number(formData.department_id) : null,
        teacher: formData.teacher || null,
        room: formData.room || null,
        day: formData.day || null,
        time_slot: formData.time_slot || null,
        duration: formData.duration ? Number(formData.duration) : 60,
        max_students: formData.max_students ? Number(formData.max_students) : 30,
      };

      if (!payload.code || !payload.name || !payload.subject_id || payload.subject_id === 0) {
        setError('Please select a subject (auto-fills code and name).');
        return;
      }

      // Validate that subject_id exists in subjects array
      const selectedSubject = subjects.find(s => s.id === payload.subject_id);
      if (!selectedSubject) {
        setError('Selected subject is no longer available. Please refresh the page and try again.');
        return;
      }

      // Validate that department_id exists in departments array if provided
      if (payload.department_id) {
        const selectedDepartment = departments.find(d => d.id === payload.department_id);
        if (!selectedDepartment) {
          setError('Selected department is no longer available. Please refresh the page and try again.');
          return;
        }
      }

      console.log('Creating/updating class with payload:', payload);

      if (editingClass) {
        await updateClass(editingClass.id, payload);
        console.log('Class updated successfully');
      } else {
        await createClass(payload);
        console.log('Class created successfully');
      }
      await fetchClasses();
      resetForm();
    } catch (err) {
      console.error('Create/Update class failed:', err);
      const serverMsg = err?.response?.data?.error || err?.message || 'Failed to save class.';
      setError(serverMsg);
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      code: cls.code || '',
      name: cls.name || '',
      subject_id: cls.subject_id || '',
      department_id: cls.department_id || '',
      teacher: cls.teacher || '',
      room: cls.room || '',
      day: cls.day || '',
      time_slot: cls.time_slot || '',
      duration: cls.duration || 60,
      max_students: cls.max_students || 30
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setError(null);
        console.log('Deleting class with ID:', id);
        await deleteClass(id);
        console.log('Class deleted successfully');
        await fetchClasses();
      } catch (err) {
        console.error('Delete class failed:', err);
        setError('Failed to delete class.');
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

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      subject_id: '',
      department_id: '',
      teacher: '',
      room: '',
      day: '',
      time_slot: '',
      duration: 60,
      max_students: 30
    });
    setEditingClass(null);
    setShowForm(false);
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
          <p className="text-slate-600">Loading classes...</p>
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
                Classes & Subjects
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <p className="text-red-700">{error}</p>
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
              className={`group relative bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isAdmin ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isAdmin && handleEdit(cls)}
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
                  <i className="fas fa-book text-white text-lg"></i>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{cls.code}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    <span>{cls.duration || 60}min</span>
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-3">{cls.name}</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  {cls.subject_name && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-book-open text-primary-500 w-4"></i>
                      <span><strong>Subject:</strong> {cls.subject_name}</span>
                    </div>
                  )}
                  {cls.department_name && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-blue-500 w-4"></i>
                      <span><strong>Department:</strong> {cls.department_name}</span>
                    </div>
                  )}
                  {cls.teacher && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-chalkboard-teacher text-green-500 w-4"></i>
                      <span><strong>Teacher:</strong> {cls.teacher}</span>
                    </div>
                  )}
                  {cls.room && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-door-open text-orange-500 w-4"></i>
                      <span><strong>Room:</strong> {cls.room}</span>
                    </div>
                  )}
                  {cls.day && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar-day text-purple-500 w-4"></i>
                      <span><strong>Day:</strong> {cls.day}</span>
                    </div>
                  )}
                  {cls.time_slot && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-clock text-red-500 w-4"></i>
                      <span><strong>Time:</strong> {cls.time_slot}</span>
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
                      handleEdit(cls);
                    }}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cls.id);
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
                      Teacher *
                    </label>
                    <select
                      value={formData.teacher}
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.name}>
                          {teacher.name} - {teacher.department || 'No Department'}
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
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="180"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="input-field"
                    />
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