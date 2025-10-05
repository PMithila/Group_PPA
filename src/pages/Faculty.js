// src/pages/Faculty.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getTeachers, createUser, updateUser, deleteUser } from '../api';
import '../styles/Dashboard.css';
import '../styles/EnhancedComponents.css';

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

  const fetchFaculty = async () => {
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
  };

  useEffect(() => {
    if (currentUser) {
      fetchFaculty();
    }
  }, [currentUser]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only administrators can modify users.');
      return;
    }
    try {
      if (editingTeacher) {
        await updateUser(editingTeacher.id, formData);
        setFaculty(faculty.map(user => 
          user.id === editingTeacher.id ? { ...user, ...formData } : user
        ));
      } else {
        const newUser = await createUser(formData);
        setFaculty([...faculty, newUser]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user.');
      console.error(err);
    }
  };

  const handleEdit = (teacher) => {
    if (!isAdmin) {
      setError('Only administrators can edit users.');
      return;
    }
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      role: teacher.role || 'teacher',
      password: '' // Don't pre-fill password for security
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError('Only administrators can delete users.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setFaculty(faculty.filter(user => user.id !== id));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user.');
        console.error(err);
      }
    }
  };

  return (
    <div className="page">
      <Header />
      <div className="dashboard-header">
        <h2>Faculty Management</h2>
        <p>Manage users and their roles in the system</p>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {isAdmin && (
          <div className="form-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowForm(true)}
            >
              <i className="fas fa-plus"></i> Add User
            </button>
          </div>
        )}

        {showForm && (
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <h3>{editingTeacher ? 'Edit User' : 'Add New User'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">
                    Password {editingTeacher ? '(leave blank to keep current)' : '(required)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingTeacher}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeacher ? 'Update' : 'Create'} User
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <div className="table-header">
            <h3>All Users</h3>
          </div>
          
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {faculty.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="empty-state">
                      <i className="fas fa-users"></i>
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  faculty.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || <span className="text-muted">No name</span>}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      {isAdmin && (
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon" 
                              onClick={() => handleEdit(user)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn-icon" 
                              onClick={() => handleDelete(user.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faculty;
