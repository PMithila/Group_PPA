// src/components/QuickActions.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GenerateScheduleModal from './GenerateScheduleModal';
import { useToast } from '../hooks/useToast';

const QuickActions = ({ onGenerateSchedule, onDataUpload }) => {
  const navigate = useNavigate();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { success } = useToast();

  const handleGenerateTimetable = async () => {
    setShowGenerateModal(true);
  };

  const handleScheduleGenerated = async (scheduleData) => {
    setIsGenerating(true);
    try {
      // Simulate AI timetable generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onGenerateSchedule) {
        onGenerateSchedule(scheduleData);
      }
      
      setShowGenerateModal(false);
      // Show success notification
      success('🎉 Timetable generated successfully with AI optimization!');
    } catch (error) {
      console.error('Error generating schedule:', error);
      success('❌ Failed to generate timetable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManageClasses = () => {
    navigate('/classes');
  };

  const handleManageTeachers = () => {
    navigate('/faculty');
  };

  const handleManageLabs = () => {
    navigate('/labs');
  };

  const handleImportData = () => {
    navigate('/import');
  };

  const handleSystemSettings = () => {
    navigate('/settings');
  };

  const quickActions = [
    {
      id: 1,
      title: 'Generate Timetable',
      description: 'Create a new timetable using AI',
      icon: 'fas fa-robot',
      color: '#4361ee',
      action: handleGenerateTimetable,
      loading: isGenerating
    },
    {
      id: 2,
      title: 'Manage Classes',
      description: 'View and manage all classes',
      icon: 'fas fa-chalkboard',
      color: '#9c27b0',
      action: handleManageClasses
    },
    {
      id: 3,
      title: 'Manage Teachers',
      description: 'View and edit teacher information',
      icon: 'fas fa-users',
      color: '#f72585',
      action: handleManageTeachers
    },
    {
      id: 4,
      title: 'Manage Labs',
      description: 'Manage laboratory resources',
      icon: 'fas fa-flask',
      color: '#ff9800',
      action: handleManageLabs
    },
    {
      id: 5,
      title: 'Import Data',
      description: 'Import data from Excel files',
      icon: 'fas fa-file-excel',
      color: '#10b981',
      action: handleImportData
    },
    {
      id: 6,
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: 'fas fa-cog',
      color: '#64748b',
      action: handleSystemSettings
    }
  ];

  return (
    <>
      <div className="quick-actions">
        <div className="quick-actions-header">
          <h3>Quick Actions</h3>
          <p>Frequently used tasks and shortcuts</p>
        </div>
        
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <div 
              key={action.id} 
              className={`quick-action-card ${action.loading ? 'loading' : ''}`}
              onClick={action.loading ? undefined : action.action}
              style={{ cursor: action.loading ? 'not-allowed' : 'pointer' }}
            >
              <div 
                className="action-icon"
                style={{ backgroundColor: `${action.color}15`, color: action.color }}
              >
                {action.loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className={action.icon}></i>
                )}
              </div>
              
              <div className="action-content">
                <h4>{action.title}</h4>
                <p>{action.loading ? 'Processing...' : action.description}</p>
              </div>
              
              <div className="action-arrow">
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showGenerateModal && (
        <GenerateScheduleModal
          onClose={() => setShowGenerateModal(false)}
          onScheduleGenerated={handleScheduleGenerated}
          excelData={null}
        />
      )}
    </>
  );
};

export default QuickActions;