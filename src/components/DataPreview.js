// src/components/DataPreview.js
import React from 'react';

const DataPreview = ({ data, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'teachers', label: 'Teachers', icon: 'fa-user' },
    { id: 'subjects', label: 'Subjects', icon: 'fa-book' },
    { id: 'classrooms', label: 'Classrooms', icon: 'fa-building' },
    { id: 'constraints', label: 'Constraints', icon: 'fa-lock' }
  ];

  const renderTable = () => {
    const items = data[activeTab] || [];
    
    if (items.length === 0) {
      return <div className="empty-state">No {activeTab} data available</div>;
    }

    const headers = Object.keys(items[0] || {});

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header.charAt(0).toUpperCase() + header.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 10).map((item, index) => (
              <tr key={index}>
                {headers.map(header => (
                  <td key={header}>{item[header] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {items.length > 10 && (
          <div className="table-footer">
            Showing 10 of {items.length} records
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="data-preview card">
      <div className="card-header">
        <h3>Data Preview</h3>
        <p>Review your imported data</p>
      </div>
      <div className="card-body">
        <div className="preview-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
              <span className="badge">{data[tab.id]?.length || 0}</span>
            </button>
          ))}
        </div>
        
        <div className="preview-content">
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default DataPreview;