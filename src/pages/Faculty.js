// src/pages/Faculty.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Faculty = ({ excelData }) => {
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subjects: '',
    status: 'Active'
  });

  useEffect(() => {
    const savedFaculty = localStorage.getItem('stms_faculty');
    if (savedFaculty) {
      setFaculty(JSON.parse(savedFaculty));
    } else {
      setFaculty([
        { id: 1, name: 'Dr. Smith', email: 'smith@school.edu', phone: '555-1234', department: 'Mathematics', subjects: 'Calculus, Algebra', status: 'Active' },
        { id: 2, name: 'Prof. Johnson', email: 'johnson@school.edu', phone: '555-5678', department: 'Physics', subjects: 'Mechanics, Thermodynamics', status: 'Active' },
        { id: 3, name: 'Dr. Williams', email: 'williams@school.edu', phone: '555-9012', department: 'Computer Science', subjects: 'Programming, Algorithms', status: 'On Leave' }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stms_faculty', JSON.stringify(faculty));
  }, [faculty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTeacher) {
      setFaculty(faculty.map(teacher => 
        teacher.id === editingTeacher.id ? { ...teacher, ...formData } : teacher
      ));
    } else {
      const newTeacher = {
        id: Date.now(),
        ...formData
      };
      setFaculty([...faculty, newTeacher]);
    }
    
    setFormData({ name: '', email: '', phone: '', department: '', subjects: '', status: 'Active' });
    setEditingTeacher(null);
    setShowForm(false);
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department,
      subjects: teacher.subjects,
      status: teacher.status
    });
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      setFaculty(faculty.filter(teacher => teacher.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'warning';
      case 'Inactive': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="page faculty-page">
          <div className="page-header">
            <h2>Faculty Management</h2>
            <p>Manage all teaching faculty members and their details</p>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Faculty Members</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus"></i> Add New Faculty
              </button>
            </div>

            {showForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>{editingTeacher ? 'Edit Faculty Member' : 'Add New Faculty Member'}</h3>
                    <button 
                      className="btn-icon"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTeacher(null);
                        setFormData({ name: '', email: '', phone: '', department: '', subjects: '', status: 'Active' });
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Dr. Smith"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., smith@school.edu"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 555-1234"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Subjects</label>
                      <input
                        type="text"
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Calculus, Algebra"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowForm(false);
                          setEditingTeacher(null);
                          setFormData({ name: '', email: '', phone: '', department: '', subjects: '', status: 'Active' });
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingTeacher ? 'Update Faculty' : 'Add Faculty'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Subjects</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map(teacher => (
                    <tr key={teacher.id}>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.phone}</td>
                      <td>{teacher.department}</td>
                      <td>{teacher.subjects}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(teacher.status)}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon"
                            onClick={() => handleEdit(teacher)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-icon"
                            onClick={() => handleDelete(teacher.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {faculty.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-users"></i>
                  <p>No faculty members found. Add your first faculty member to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faculty;