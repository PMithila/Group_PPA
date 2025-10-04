// src/pages/Labs.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getLabs, createLab, updateLab, deleteLab } from '../api';
import '../styles/Dashboard.css';

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
    resources: []
  });

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

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleResourcesChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, resources: value.split(',').map(item => item.trim()) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLab) {
        const updated = await updateLab(editingLab.id, formData);
        setLabs(labs.map(l => (l.id === editingLab.id ? updated : l)));
      } else {
        const newLab = await createLab(formData);
        setLabs([...labs, newLab]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save lab.');
      console.error(err);
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData(lab);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        await deleteLab(id);
        setLabs(labs.filter(l => l.id !== id));
      } catch (err) {
        setError('Failed to delete lab.');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', capacity: 0, resources: [] });
    setEditingLab(null);
    setShowForm(false);
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
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Computer Lab 1" />
                    </div>
                    <div className="form-group">
                      <label>Capacity</label>
                      <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required min="1" placeholder="e.g., 30" />
                    </div>
                    <div className="form-group">
                      <label>Resources (comma-separated)</label>
                      <textarea name="resources" value={Array.isArray(formData.resources) ? formData.resources.join(', ') : ''} onChange={handleResourcesChange} placeholder="e.g., 25 Computers, Projector" rows="3" />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                      <button type="submit" className="btn btn-primary">{editingLab ? 'Update Lab' : 'Add Lab'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="cards-grid">
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading labs...</div>
              ) : error ? (
                <div className="alert alert-error">{error}</div>
              ) : labs.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-flask"></i>
                  <p>No laboratories found. Add your first lab to get started.</p>
                </div>
              ) : ( 
                labs.map(lab => (
                  <div key={lab.id} className="lab-card">
                    <div className="lab-card-header">
                      <h4>{lab.name}</h4>
                    </div>
                    <div className="lab-card-details">
                      <div className="detail-item">
                        <i className="fas fa-users"></i>
                        <span>Capacity: {lab.capacity} students</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-tools"></i>
                        <span>Resources: {Array.isArray(lab.resources) ? lab.resources.join(', ') : ''}</span>
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
                ))
              )}
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