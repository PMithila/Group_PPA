// src/pages/Classes.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getClasses, createClass, updateClass, deleteClass } from '../api';
import '../styles/Dashboard.css';

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
    duration: '1 hour',
    room: ''
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const fetchedClasses = await getClasses();
      setClasses(fetchedClasses);
    } catch (err) {
      setError('Failed to fetch classes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setError('Failed to save class.');
      console.error(err);
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData(cls);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(id);
        setClasses(classes.filter(cls => cls.id !== id));
      } catch (err) {
        setError('Failed to delete class.');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', teacher: '', duration: '1 hour', room: '' });
    setEditingClass(null);
    setShowForm(false);
  };

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="page classes-page">
          <div className="page-header">
            <h2>Classes & Subjects</h2>
            <p>View and manage all subjects for the timetable. You can add, edit, or delete classes below.</p>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>Classes List</h3>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus"></i> Add New Class
              </button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {showForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>{editingClass ? 'Edit Class' : 'Add New Class'}</h3>
                    <button className="btn-icon" onClick={resetForm}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Class Code</label>
                      <input type="text" name="code" value={formData.code} onChange={handleInputChange} required placeholder="e.g., CS101" />
                    </div>
                    <div className="form-group">
                      <label>Class Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Introduction to Computer Science" />
                    </div>
                    <div className="form-group">
                      <label>Teacher</label>
                      <input type="text" name="teacher" value={formData.teacher} onChange={handleInputChange} placeholder="e.g., Dr. Smith" />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <select name="duration" value={formData.duration} onChange={handleInputChange} required>
                        <option value="1 hour">1 hour</option>
                        <option value="1.5 hours">1.5 hours</option>
                        <option value="2 hours">2 hours</option>
                        <option value="3 hours">3 hours</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Room</label>
                      <input type="text" name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g., Room A12" />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                      <button type="submit" className="btn btn-primary">{editingClass ? 'Update Class' : 'Add Class'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="table-container">
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading classes...</div>
              ) : (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Teacher</th>
                        <th>Duration</th>
                        <th>Room</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(cls => (
                        <tr key={cls.id}>
                          <td>{cls.code}</td>
                          <td>{cls.name}</td>
                          <td>{cls.teacher}</td>
                          <td>{cls.duration}</td>
                          <td>{cls.room}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" onClick={() => handleEdit(cls)} title="Edit">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-icon" onClick={() => handleDelete(cls.id)} title="Delete">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {classes.length === 0 && !loading && (
                    <div className="empty-state">
                      <i className="fas fa-chalkboard"></i>
                      <p>No classes found. Add your first class to get started.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;