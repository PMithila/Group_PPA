// src/pages/ImportData.js
import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { processExcelData, validateExcelData } from '../utils/excelProcessor';
import DataPreview from '../components/DataPreview';
import UploadArea from '../components/UploadArea';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const ImportData = ({ onDataUpload }) => {
  const { currentUser } = useAuth();
  const [uploadState, setUploadState] = useState({
    status: 'idle', // 'idle', 'uploading', 'success', 'error'
    message: '',
    importedData: null,
    validationErrors: [],
    activeTab: 'teachers'
  });

  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    setUploadState(prev => ({
      ...prev,
      status: 'uploading',
      message: 'Processing Excel file...',
      importedData: null,
      validationErrors: []
    }));

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Validate the workbook structure
        const validationResult = validateExcelData(workbook);
        
        if (!validationResult.isValid) {
          setUploadState(prev => ({
            ...prev,
            status: 'error',
            message: 'Invalid file format. Please check the required sheets and columns.',
            validationErrors: validationResult.errors
          }));
          return;
        }
        
        // Process the data
        const processedData = processExcelData(workbook);
        
        setUploadState(prev => ({
          ...prev,
          status: 'success',
          message: 'Data imported successfully!',
          importedData: processedData,
          validationErrors: []
        }));
        
        // Pass data to parent component
        if (onDataUpload) {
          onDataUpload(processedData);
        }
        
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadState(prev => ({
          ...prev,
          status: 'error',
          message: `Failed to process file: ${error.message}`,
          validationErrors: []
        }));
      }
    };
    
    reader.onerror = () => {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        message: 'Error reading file. Please try again.',
        validationErrors: []
      }));
    };
    
    reader.readAsArrayBuffer(file);
  }, [onDataUpload]);

  const handleSampleDownload = useCallback(() => {
    // Create comprehensive sample data
    const sampleData = {
      Teachers: [
        ['Name', 'Email', 'Subject', 'Availability', 'Max Hours', 'Constraints'],
        ['Dr. Sarah Smith', 's.smith@university.edu', 'Mathematics', 'Mon-Wed-Fri', '18', 'No early classes'],
        ['Prof. John Johnson', 'j.johnson@university.edu', 'Physics', 'Tue-Thu', '20', 'Prefer lab sessions'],
        ['Dr. Emily Williams', 'e.williams@university.edu', 'Computer Science', 'Full-time', '22', ''],
        ['Prof. Michael Brown', 'm.brown@university.edu', 'Chemistry', 'Mon-Tue-Wed', '16', 'Max 4 hours daily'],
        ['Dr. Lisa Davis', 'l.davis@university.edu', 'Biology', 'Thu-Fri', '14', 'Lab only']
      ],
      Subjects: [
        ['Code', 'Name', 'Type', 'Hours Per Week', 'Requirements', 'Teacher'],
        ['MATH101', 'Calculus I', 'Lecture', '4', 'Projector, Whiteboard', 'Dr. Sarah Smith'],
        ['MATH102', 'Calculus II', 'Lecture', '4', 'Projector', 'Dr. Sarah Smith'],
        ['PHY101', 'Physics Fundamentals', 'Lecture', '3', 'Demonstration equipment', 'Prof. John Johnson'],
        ['PHY102', 'Physics Lab', 'Lab', '2', 'Lab equipment', 'Prof. John Johnson'],
        ['CS101', 'Introduction to Programming', 'Lecture', '3', 'Computers', 'Dr. Emily Williams'],
        ['CS102', 'Programming Lab', 'Lab', '3', 'Computer lab', 'Dr. Emily Williams'],
        ['CHEM101', 'General Chemistry', 'Lecture', '3', 'Safety equipment', 'Prof. Michael Brown'],
        ['BIO101', 'Biology Fundamentals', 'Lecture', '3', 'Microscopes', 'Dr. Lisa Davis']
      ],
      Classrooms: [
        ['Name', 'Capacity', 'Type', 'Facilities', 'Availability', 'Restrictions'],
        ['Room A101', '30', 'Lecture Hall', 'Projector, Whiteboard, Sound System', 'Mon-Fri 8AM-6PM', ''],
        ['Room A102', '25', 'Lecture Hall', 'Projector, Whiteboard', 'Mon-Fri 8AM-6PM', ''],
        ['Lab B201', '20', 'Computer Lab', 'Computers, Projector, Network', 'Mon-Thu 9AM-5PM', 'No food/drinks'],
        ['Lab B202', '18', 'Science Lab', 'Lab equipment, Safety gear', 'Tue-Fri 10AM-4PM', 'Safety training required'],
        ['Room C301', '35', 'Seminar Room', 'Projector, Conference setup', 'Mon-Fri 8AM-8PM', ''],
        ['Room C302', '40', 'Auditorium', 'Projector, Stage, Sound System', 'Mon-Fri 9AM-5PM', 'Minimum 10 students']
      ],
      Constraints: [
        ['Type', 'Value', 'Description', 'Priority'],
        ['Teacher', 'Dr. Sarah Smith', 'No classes before 10AM', 'High'],
        ['Room', 'Lab B201', 'Maintenance every Wednesday 2-4PM', 'Medium'],
        ['Subject', 'PHY102', 'Must be scheduled in science lab', 'High'],
        ['General', 'Lunch', 'No classes between 12-1PM', 'Medium'],
        ['Teacher', 'Prof. Michael Brown', 'Max 2 consecutive hours', 'Low']
      ]
    };

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    Object.keys(sampleData).forEach(sheetName => {
      const ws = XLSX.utils.aoa_to_sheet(sampleData[sheetName]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Download the file
    XLSX.writeFile(wb, 'Timetable_Data_Template.xlsx');
  }, []);

  const handleTabChange = useCallback((tabName) => {
    setUploadState(prev => ({
      ...prev,
      activeTab: tabName
    }));
  }, []);

  const handleReset = useCallback(() => {
    setUploadState({
      status: 'idle',
      message: '',
      importedData: null,
      validationErrors: [],
      activeTab: 'teachers'
    });
  }, []);

  return (
    <div className="dashboard-container">
      <Header user={currentUser} />
      <div className="dashboard-content">
        <div className="page import-data-page">
          <div className="page-header">
            <h2>Import Timetable Data</h2>
            <p>Upload Excel files to import teachers, subjects, classrooms, and constraints</p>
          </div>

          <div className="import-container">
            {/* Upload Section */}
            <div className="upload-section card">
              <div className="card-header">
                <h3>Upload Data File</h3>
                <p>Download the template and fill in your institutional data</p>
              </div>
              
              <div className="card-body">
                <UploadArea
                  onFileUpload={handleFileUpload}
                  uploadState={uploadState}
                  onReset={handleReset}
                />
                
                <div className="template-section">
                  <div className="template-info">
                    <h4>Download Template</h4>
                    <p>Use our comprehensive template to ensure your data is formatted correctly with all required fields.</p>
                    <button className="btn btn-primary" onClick={handleSampleDownload}>
                      <i className="fas fa-download"></i> Download Excel Template
                    </button>
                  </div>
                  
                  <div className="template-features">
                    <h5>Template Includes:</h5>
                    <ul>
                      <li><i className="fas fa-check"></i> Teachers sheet with availability constraints</li>
                      <li><i className="fas fa-check"></i> Subjects with weekly hours and requirements</li>
                      <li><i className="fas fa-check"></i> Classrooms with capacities and facilities</li>
                      <li><i className="fas fa-check"></i> Custom constraints and rules</li>
                      <li><i className="fas fa-check"></i> Example data for guidance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {uploadState.validationErrors.length > 0 && (
              <div className="validation-errors card">
                <div className="card-header">
                  <h3>Validation Issues</h3>
                  <p>Please fix these issues in your Excel file</p>
                </div>
                <div className="card-body">
                  <div className="error-list">
                    {uploadState.validationErrors.map((error, index) => (
                      <div key={index} className="error-item">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Data Summary */}
            {uploadState.importedData && (
              <div className="import-summary card">
                <div className="card-header">
                  <h3>Imported Data Summary</h3>
                  <p>Successfully processed your timetable data</p>
                </div>
                <div className="card-body">
                  <div className="summary-stats">
                    <div className="stat-item">
                      <div className="stat-number">{uploadState.importedData.teachers?.length || 0}</div>
                      <div className="stat-label">Teachers</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{uploadState.importedData.subjects?.length || 0}</div>
                      <div className="stat-label">Subjects</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{uploadState.importedData.classrooms?.length || 0}</div>
                      <div className="stat-label">Classrooms</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{uploadState.importedData.constraints?.length || 0}</div>
                      <div className="stat-label">Constraints</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Preview */}
            {uploadState.importedData && (
              <DataPreview
                data={uploadState.importedData}
                activeTab={uploadState.activeTab}
                onTabChange={handleTabChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportData;