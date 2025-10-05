// src/pages/Classes.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getClasses, createClass, updateClass, deleteClass, getTeachers } from '../api';
import '../styles/Dashboard.css';
import '../styles/EnhancedComponents.css';

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
    teacher: '',
    room: '',
    day: '',
    time_slot: ''
  });
  const [teachers, setTeachers] = useState([]);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  const fetchClasses = async () => {
    try {
      setLoading(false);
      const fetchedClasses = await getClasses();
      setClasses(fetchedClasses);
    } catch (err) {
      setError('Failed to fetch classes.');
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

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only administrators can modify classes.');
      return;
    }
    try {
      if (editingClass) {
        const updated = await updateClass(editingClass.id, formData);
        setClasses(classes.map(cls => (cls.id === editingClass.id ? updated : cls)));
      } else {
        const newClass = await createClass(formData);
        setClasses([...classes, newClass]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save class.');
      console.error(err);
    }
  };

  const handleEdit = (cls) => {
    if (!isAdmin) {
      setError('Only administrators can edit classes.');
      return;
    }
    setEditingClass(cls);
    setFormData(cls);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError('Only administrators can delete classes.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(id);
        setClasses(classes.filter(cls => cls.id !== id));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete class.');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', teacher: '', room: '', day: '', time_slot: '' });
    setEditingClass(null);
    setShowForm(false);
  };

  // Get color variant based on index for consistent styling
  const getColorVariant = (index) => {
    const variants = ['blue', 'green', 'purple', 'red', 'orange', 'teal'];
    return variants[index % variants.length];
  };

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="page classes-page">
          <div className="dashboard-header">
            <div>
              <h2>Classes & Subjects</h2>
              <p className="last-updated">
                {isAdmin ? (
                  <>
                    <i className="fas fa-edit"></i> Manage all subjects for your timetable
                  </>
                ) : (
                  <>
                    <i className="fas fa-eye"></i> View all subjects (Read-only mode)
                  </>
                )}
              </p>
            </div>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus"></i> Add New Class
              </button>
            )}
          </div>

          <div className="dashboard-cards">
            <div className="cards-grid">
              {classes.map((cls, index) => (
                <div 
                  key={cls.id} 
                  className={`stat-card ${getColorVariant(index)} ${!isAdmin ? 'read-only' : ''}`}
                  onClick={() => isAdmin && handleEdit(cls)}
                  style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                >
                  <div className="card-header">
                    <div className="icon-container">
                      <div className={`icon ${getColorVariant(index)}`}>
                        <i className="fas fa-book"></i>
                      </div>
                    </div>
                    <div className="value">
                      <h3>{cls.code}</h3>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h4>{cls.name}</h4>
                    <p className="description">
                      {cls.teacher && (
                        <>
                          <strong>Teacher:</strong> {cls.teacher}<br />
                        </>
                      )}
                      {cls.room && (
                        <>
                          <strong>Room:</strong> {cls.room}<br />
                        </>
                      )}
                      {cls.day && (
                        <>
                          <strong>Day:</strong> {cls.day}<br />
                        </>
                      )}
                      {cls.time_slot && (
                        <>
                          <strong>Time:</strong> {cls.time_slot}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="card-footer">
                    <span className={`trend ${getColorVariant(index)}`}>
                      <i className="fas fa-clock"></i>
                    </span>
                    {isAdmin && (
                      <div className="action-buttons">
                        <button 
                          className="card-action" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(cls);
                          }}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="card-action" 
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
                </div>
              ))}
              
              {/* Add New Class Card - Only visible to admins */}
              {isAdmin && (
                <div 
                  className="stat-card empty purple"
                  onClick={() => setShowForm(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-header">
                    <div className="icon purple">
                      <i className="fas fa-plus"></i>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h4>Add New Class</h4>
                    <p className="description">
                      Click to create a new class or subject for your timetable
                    </p>
                  </div>

                  <div className="card-footer">
                    <span className="trend purple">
                      <i className="fas fa-plus-circle"></i>
                      New
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="modal-overlay">
              <div className="modal-content wide-modal">
                <div className="modal-header">
                  <h3>{editingClass ? 'Edit Class' : 'Add New Class'}</h3>
                  <button className="btn-icon" onClick={resetForm}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="scrollable-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Class Code</label>
                      <input 
                        type="text" 
                        name="code" 
                        value={formData.code} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="e.g., CS101" 
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Class Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="e.g., Introduction to Computer Science" 
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Teacher</label>
                      <select 
                        name="teacher" 
                        value={formData.teacher} 
                        onChange={handleInputChange} 
                        required
                        className="form-input"
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.name}>
                            {teacher.name} ({teacher.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Day</label>
                      <select 
                        name="day" 
                        value={formData.day} 
                        onChange={handleInputChange} 
                        required 
                        className="form-input"
                      >
                        <option value="">Select a day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Slot</label>
                      <select 
                        name="time_slot" 
                        value={formData.time_slot} 
                        onChange={handleInputChange} 
                        required 
                        className="form-input"
                      >
                        <option value="">Select a time slot</option>
                        <option value="8am-9am">8:00 AM - 9:00 AM</option>
                        <option value="9am-10am">9:00 AM - 10:00 AM</option>
                        <option value="10am-11am">10:00 AM - 11:00 AM</option>
                        <option value="11am-12pm">11:00 AM - 12:00 PM</option>
                        <option value="12pm-1pm">12:00 PM - 1:00 PM</option>
                        <option value="1pm-2pm">1:00 PM - 2:00 PM</option>
                        <option value="2pm-3pm">2:00 PM - 3:00 PM</option>
                        <option value="3pm-4pm">3:00 PM - 4:00 PM</option>
                        <option value="4pm-5pm">4:00 PM - 5:00 PM</option>
                        <option value="5pm-6pm">5:00 PM - 6:00 PM</option>
                        <option value="6pm-7pm">6:00 PM - 7:00 PM</option>
                        <option value="7pm-8pm">7:00 PM - 8:00 PM</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Room</label>
                      <input 
                        type="text" 
                        name="room" 
                        value={formData.room} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Room A12" 
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingClass ? 'Update Class' : 'Add Class'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i> 
              <span>Loading classes...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Classes;
