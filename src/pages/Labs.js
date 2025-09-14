// src/pages/Labs.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Labs = ({ excelData }) => {
  const { currentUser } = useAuth();
  const [labs, setLabs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    equipment: '',
    supervisor: '',
    status: 'Available'
  });

  useEffect(() => {
    const savedLabs = localStorage.getItem('stms_labs');
    if (savedLabs) {
      setLabs(JSON.parse(savedLabs));
    } else {
      setLabs([
        { id: 1, name: 'Computer Lab 1', capacity: 30, equipment: '25 Computers, Projector', supervisor: 'Dr. Smith', status: 'Available' },
        { id: 2, name: 'Physics Lab', capacity: 25, equipment: 'Oscilloscopes, Multimeters', supervisor: 'Prof. Johnson', status: 'Available' },
        { id: 3, name: 'Chemistry Lab', capacity: 20, equipment: 'Bunsen Burners, Beakers', supervisor: 'Dr. Williams', status: 'Maintenance' }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stms_labs', JSON.stringify(labs));
  }, [labs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingLab) {
      setLabs(labs.map(lab => 
        lab.id === editingLab.id ? { ...lab, ...formData } : lab
      ));
    } else {
      const newLab = {
        id: Date.now(),
        ...formData,
        capacity: parseInt(formData.capacity)
      };
      setLabs([...labs, newLab]);
    }
    
    setFormData({ name: '', capacity: '', equipment: '', supervisor: '', status: 'Available' });
    setEditingLab(null);
    setShowForm(false);
  };

  const handleEdit = (lab) => {
    setFormData({
      name: lab.name,
      capacity: lab.capacity,
      equipment: lab.equipment,
      supervisor: lab.supervisor,
      status: lab.status
    });
    setEditingLab(lab);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      setLabs(labs.filter(lab => lab.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Occupied': return 'warning';
      case 'Maintenance': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="page labs-page">
          <div className="page-header">
            <h2>Lab Management</h2>
            <p>Manage all laboratory resources and equipment</p>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Laboratories</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus"></i> Add New Lab
              </button>
            </div>

            {showForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>{editingLab ? 'Edit Lab' : 'Add New Lab'}</h3>
                    <button 
                      className="btn-icon"
                      onClick={() => {
                        setShowForm(false);
                        setEditingLab(null);
                        setFormData({ name: '', capacity: '', equipment: '', supervisor: '', status: 'Available' });
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Lab Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Computer Lab 1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        placeholder="e.g., 30"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Equipment</label>
                      <textarea
                        name="equipment"
                        value={formData.equipment}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 25 Computers, Projector"
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Supervisor</label>
                      <input
                        type="text"
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Dr. Smith"
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
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowForm(false);
                          setEditingLab(null);
                          setFormData({ name: '', capacity: '', equipment: '', supervisor: '', status: 'Available' });
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingLab ? 'Update Lab' : 'Add Lab'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="cards-grid">
              {labs.map(lab => (
                <div key={lab.id} className="lab-card">
                  <div className="lab-card-header">
                    <h4>{lab.name}</h4>
                    <span className={`status-badge ${getStatusColor(lab.status)}`}>
                      {lab.status}
                    </span>
                  </div>
                  
                  <div className="lab-card-details">
                    <div className="detail-item">
                      <i className="fas fa-users"></i>
                      <span>Capacity: {lab.capacity} students</span>
                    </div>
                    
                    <div className="detail-item">
                      <i className="fas fa-tools"></i>
                      <span>Equipment: {lab.equipment}</span>
                    </div>
                    
                    <div className="detail-item">
                      <i className="fas fa-user-tie"></i>
                      <span>Supervisor: {lab.supervisor}</span>
                    </div>
                  </div>
                  
                  <div className="lab-card-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEdit(lab)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => handleDelete(lab.id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {labs.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-flask"></i>
                <p>No laboratories found. Add your first lab to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labs;