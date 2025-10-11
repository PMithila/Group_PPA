// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUserProfile, getDepartments } from '../api';

const Settings = () => {
  const { user, currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    department: '',
    role: ''
  });
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load user data and departments
    const loadData = async () => {
      if (user || currentUser) {
        const userData = user || currentUser;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          department: userData.department || '',
          role: userData.role || ''
        });

        // Load departments and find the department name
        try {
          const depts = await getDepartments();
          setDepartments(depts);

          // Find the department name based on the department ID
          if (userData.department) {
            const department = depts.find(dept => dept.id.toString() === userData.department.toString());
            setDepartmentName(department ? department.name : 'Unknown Department');
          }
        } catch (error) {
          console.error('Error loading departments:', error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [user, currentUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setProfileData({
      ...profileData,
      department: departmentId
    });

    // Update department name display
    if (departmentId) {
      const department = departments.find(dept => dept.id.toString() === departmentId);
      setDepartmentName(department ? department.name : 'Unknown Department');
    } else {
      setDepartmentName('');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await updateCurrentUserProfile(profileData);
      if (result.success) {
        setSaveStatus('Profile updated successfully!');
        // Update the user context
        window.location.reload(); // Simple refresh to update context
      } else {
        setSaveStatus('Error updating profile: ' + result.error);
      }
    } catch (error) {
      setSaveStatus('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const exportData = () => {
    const data = {
      profile: profileData,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'profile_backup.json';
    link.click();
  };

  const resetProfile = () => {
    if (window.confirm('Are you sure you want to reset your profile to default values?')) {
      setProfileData({
        name: '',
        email: '',
        department: '',
        role: ''
      });
      setDepartmentName('');
      setSaveStatus('Profile reset to default!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={currentUser} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Profile Settings
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                <i className="fas fa-user text-primary-500"></i>
                Manage your personal information and account details
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Last Updated</div>
                <div className="text-lg font-semibold text-slate-800">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveStatus && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-check-circle text-green-500"></i>
              <p className="text-green-700">{saveStatus}</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-user text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
              <p className="text-slate-600">Update your profile information and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              {isAdmin ? (
                <select
                  name="department"
                  value={profileData.department}
                  onChange={handleDepartmentChange}
                  className="input-field"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="input-field bg-slate-50 text-slate-700 flex items-center">
                  <span className="flex-1">{departmentName || 'No department assigned'}</span>
                  <i className="fas fa-lock text-slate-400 text-sm"></i>
                </div>
              )}
              {!isAdmin && (
                <p className="text-xs text-slate-500 mt-1">Contact admin to change department</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={profileData.role}
                onChange={handleProfileChange}
                className="input-field"
                disabled
              >
                <option value="admin">Administrator</option>
                <option value="teacher">Teacher</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Role cannot be changed</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={resetProfile}
              className="btn-secondary"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
            <button
              className="btn-primary"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backup Section */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-download text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Data Management</h2>
              <p className="text-slate-600">Export your profile data or reset to defaults</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-download text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Export Data</h3>
                  <p className="text-sm text-slate-600">Download a backup of your profile data</p>
                </div>
              </div>
              <button className="btn-secondary w-full" onClick={exportData}>
                <i className="fas fa-download mr-2"></i>
                Export Profile Data
              </button>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-undo text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Reset Profile</h3>
                  <p className="text-sm text-slate-600">Clear all profile information</p>
                </div>
              </div>
              <button className="btn-secondary w-full" onClick={resetProfile}>
                <i className="fas fa-undo mr-2"></i>
                Reset Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;