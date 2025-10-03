// src/components/AddClassModal.js
import React, { useState, useEffect } from 'react';
import './AddClassModal.css';

const AddClassModal = ({ onClose, onAddClass, timeSlot, existingClass }) => {
  const [formData, setFormData] = useState({
    content: '',
    teacher: '',
    type: 'lecture',
    room: ''
  });

  useEffect(() => {
    if (existingClass) {
      const roomMatch = existingClass.content.match(/\((.*?)\)/);
      const room = roomMatch ? roomMatch[1] : '';
      const content = existingClass.content.replace(/\s*\(.*?\)\s*$/, '');
      
      setFormData({
        content,
        teacher: existingClass.teacher,
        type: existingClass.type,
        room
      });
    }
  }, [existingClass]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content || !formData.teacher) {
      alert('Please fill in all required fields');
      return;
    }

    const newClass = {
      content: formData.room ? `${formData.content} (${formData.room})` : formData.content,
      teacher: formData.teacher,
      type: formData.type
    };

    onAddClass(newClass);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-class-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{existingClass ? 'Edit Class' : 'Add New Class'}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="time-info">
            <i className="fas fa-clock"></i>
            <span>{timeSlot?.timeSlot} - {timeSlot?.day}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="content">
                <i className="fas fa-book"></i>
                Subject/Course *
              </label>
              <input
                type="text"
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="e.g., Computer Science 101"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="teacher">
                <i className="fas fa-user"></i>
                Teacher *
              </label>
              <input
                type="text"
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                placeholder="e.g., Dr. Smith"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">
                  <i className="fas fa-tag"></i>
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="room">
                  <i className="fas fa-door-open"></i>
                  Room
                </label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g., Room A12"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i>
                {existingClass ? 'Update Class' : 'Add Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClassModal;
