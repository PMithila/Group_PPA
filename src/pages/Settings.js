// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Settings = () => {
  const { user, updateProfile, currentUser } = useAuth();
  const [settings, setSettings] = useState({
    universityName: 'University of Technology',
    timeFormat: '12h',
    startTime: '8:00 AM',
    endTime: '5:00 PM',
    timeInterval: '60',
    enableNotifications: true,
    autoSave: false,
    theme: 'light'
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: ''
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('stms_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load profile data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('stms_settings', JSON.stringify(settings));
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleSaveProfile = () => {
    const result = updateProfile(profileData);
    if (result.success) {
      setSaveStatus('Profile updated successfully!');
    } else {
      setSaveStatus('Error updating profile: ' + result.error);
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const exportData = () => {
    const data = {
      settings,
      profile: profileData,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'stms_backup.json';
    link.click();
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('stms_settings');
      setSettings({
        universityName: 'University of Technology',
        timeFormat: '12h',
        startTime: '8:00 AM',
        endTime: '5:00 PM',
        timeInterval: '60',
        enableNotifications: true,
        autoSave: false,
        theme: 'light'
      });
      setSaveStatus('Settings reset to default!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="page">
          <div className="page-header">
            <h2>System Settings</h2>
            <p>Configure application preferences and manage your profile</p>
          </div>

      <div className="card">
        <div className="settings-tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="fas fa-cog"></i> Preferences
          </button>
          <button 
            className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <i className="fas fa-download"></i> Backup & Reset
          </button>
        </div>

        {saveStatus && (
          <div className="save-status">
            <i className="fas fa-check-circle"></i>
            {saveStatus}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3>Profile Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  placeholder="Enter your department"
                />
              </div>
            </div>
            
            <button className="btn btn-primary" onClick={handleSaveProfile}>
              Save Profile Changes
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="settings-section">
            <h3>Application Preferences</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>University Name</label>
                <input
                  type="text"
                  name="universityName"
                  value={settings.universityName}
                  onChange={handleSettingsChange}
                  placeholder="Enter university name"
                />
              </div>
              
              <div className="form-group">
                <label>Time Format</label>
                <select
                  name="timeFormat"
                  value={settings.timeFormat}
                  onChange={handleSettingsChange}
                >
                  <option value="12h">12-hour format</option>
                  <option value="24h">24-hour format</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={settings.startTime}
                  onChange={handleSettingsChange}
                />
              </div>
              
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={settings.endTime}
                  onChange={handleSettingsChange}
                />
              </div>
              
              <div className="form-group">
                <label>Time Interval (minutes)</label>
                <input
                  type="number"
                  name="timeInterval"
                  value={settings.timeInterval}
                  onChange={handleSettingsChange}
                  min="15"
                  max="120"
                  step="15"
                />
              </div>
              
              <div className="form-group">
                <label>Theme</label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleSettingsChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={handleSettingsChange}
                />
                <span className="checkmark"></span>
                Enable Notifications
              </label>
              
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="autoSave"
                  checked={settings.autoSave}
                  onChange={handleSettingsChange}
                />
                <span className="checkmark"></span>
                Auto Save Changes
              </label>
            </div>
            
            <button className="btn btn-primary" onClick={handleSaveSettings}>
              Save Preferences
            </button>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="settings-section">
            <h3>Backup & Reset</h3>
            
            <div className="backup-options">
              <div className="backup-card">
                <i className="fas fa-download"></i>
                <h4>Export Data</h4>
                <p>Download a backup of your settings and profile data</p>
                <button className="btn btn-secondary" onClick={exportData}>
                  Export Data
                </button>
              </div>
              
              <div className="backup-card">
                <i className="fas fa-undo"></i>
                <h4>Reset Settings</h4>
                <p>Restore all settings to their default values</p>
                <button className="btn btn-danger" onClick={resetSettings}>
                  Reset to Defaults
                </button>
              </div>
            </div>
            
            <div className="danger-zone">
              <h4>Danger Zone</h4>
              <p>These actions are irreversible. Please proceed with caution.</p>
              
              <button 
                className="btn btn-danger-outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                <i className="fas fa-trash"></i>
                Clear All Local Data
              </button>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;