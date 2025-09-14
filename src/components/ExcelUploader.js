// src/components/ExcelUploader.js
import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { processWorkbookData, validateWorkbook } from '../utils/excelProcessor';

const ExcelUploader = ({ onDataUpload }) => {
  const [uploadState, setUploadState] = useState({
    status: 'idle', // 'idle', 'uploading', 'success', 'error'
    message: '',
    fileName: '',
    processedData: null,
    validationErrors: []
  });
  
  const fileInputRef = useRef(null);

  // Reset the upload state
  const resetUpload = useCallback(() => {
    setUploadState({
      status: 'idle',
      message: '',
      fileName: '',
      processedData: null,
      validationErrors: []
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        message: `Invalid file type. Please upload ${validExtensions.join(', ')} files.`,
        fileName: file.name
      }));
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        message: 'File size too large. Maximum size is 5MB.',
        fileName: file.name
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      status: 'uploading',
      message: 'Processing file...',
      fileName: file.name,
      validationErrors: []
    }));

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Validate workbook structure
        const validationResult = validateWorkbook(workbook);
        
        if (!validationResult.isValid) {
          setUploadState(prev => ({
            ...prev,
            status: 'error',
            message: 'Invalid file format. Please check the required sheets and columns.',
            validationErrors: validationResult.errors
          }));
          return;
        }
        
        // Process the workbook data
        const processedData = processWorkbookData(workbook);
        
        setUploadState(prev => ({
          ...prev,
          status: 'success',
          message: 'File processed successfully!',
          processedData,
          validationErrors: []
        }));
        
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

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to upload
  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Get status icon and color
  const getStatusConfig = useCallback(() => {
    switch (uploadState.status) {
      case 'uploading':
        return { icon: 'fa-spinner fa-spin', color: '#3b82f6', bgColor: '#dbeafe' };
      case 'success':
        return { icon: 'fa-check-circle', color: '#10b981', bgColor: '#d1fae5' };
      case 'error':
        return { icon: 'fa-exclamation-circle', color: '#ef4444', bgColor: '#fee2e2' };
      default:
        return { icon: 'fa-cloud-upload-alt', color: '#9ca3af', bgColor: '#f9fafb' };
    }
  }, [uploadState.status]);

  const statusConfig = getStatusConfig();

  return (
    <div className="excel-uploader">
      <div className="uploader-header">
        <h3>Upload Timetable Data</h3>
        <p>Import classroom, teacher, and subject information from Excel</p>
      </div>

      <div 
        className={`upload-area status-${uploadState.status}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        style={{ backgroundColor: statusConfig.bgColor }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <i className={`fas ${statusConfig.icon}`} style={{ color: statusConfig.color }}></i>
          
          {uploadState.status === 'idle' && (
            <>
              <p className="upload-title">Drag & drop your Excel file here</p>
              <p className="upload-subtitle">or click to browse</p>
              <div className="supported-formats">
                <span>Supported formats: .xlsx, .xls, .csv</span>
              </div>
            </>
          )}
          
          {uploadState.status === 'uploading' && (
            <>
              <p className="upload-title">Processing {uploadState.fileName}</p>
              <p className="upload-message">{uploadState.message}</p>
            </>
          )}
          
          {uploadState.status === 'success' && (
            <>
              <p className="upload-title">Upload Successful!</p>
              <p className="file-name">{uploadState.fileName}</p>
              <p className="upload-message">{uploadState.message}</p>
            </>
          )}
          
          {uploadState.status === 'error' && (
            <>
              <p className="upload-title">Upload Failed</p>
              <p className="file-name">{uploadState.fileName}</p>
              <p className="upload-message">{uploadState.message}</p>
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="upload-actions">
        {(uploadState.status === 'success' || uploadState.status === 'error') && (
          <button 
            className="btn btn-secondary"
            onClick={resetUpload}
          >
            <i className="fas fa-redo"></i> Upload Another File
          </button>
        )}
        
        {uploadState.status === 'idle' && uploadState.fileName && (
          <button 
            className="btn btn-secondary"
            onClick={resetUpload}
          >
            <i className="fas fa-times"></i> Clear
          </button>
        )}
      </div>

      {/* Validation errors */}
      {uploadState.validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Validation Issues:</h4>
          <ul>
            {uploadState.validationErrors.map((error, index) => (
              <li key={index}>
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data summary */}
      {uploadState.status === 'success' && uploadState.processedData && (
        <div className="data-summary">
          <h4>Data Summary:</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-count">{uploadState.processedData.classrooms?.length || 0}</span>
              <span className="summary-label">Classrooms</span>
            </div>
            <div className="summary-item">
              <span className="summary-count">{uploadState.processedData.teachers?.length || 0}</span>
              <span className="summary-label">Teachers</span>
            </div>
            <div className="summary-item">
              <span className="summary-count">{uploadState.processedData.subjects?.length || 0}</span>
              <span className="summary-label">Subjects</span>
            </div>
            <div className="summary-item">
              <span className="summary-count">{uploadState.processedData.constraints?.length || 0}</span>
              <span className="summary-label">Constraints</span>
            </div>
          </div>
        </div>
      )}

      {/* Format guidance */}
      <div className="format-guidance">
        <h4>Expected Format:</h4>
        <div className="format-examples">
          <div className="format-example">
            <h5>Classrooms Sheet</h5>
            <div className="example-table">
              <div className="example-row header">
                <span>Name</span>
                <span>Capacity</span>
                <span>Type</span>
              </div>
              <div className="example-row">
                <span>A101</span>
                <span>30</span>
                <span>Lecture Hall</span>
              </div>
            </div>
          </div>
          
          <div className="format-example">
            <h5>Teachers Sheet</h5>
            <div className="example-table">
              <div className="example-row header">
                <span>Name</span>
                <span>Subject</span>
                <span>Max Hours</span>
              </div>
              <div className="example-row">
                <span>Dr. Smith</span>
                <span>Mathematics</span>
                <span>18</span>
              </div>
            </div>
          </div>
          
          <div className="format-example">
            <h5>Subjects Sheet</h5>
            <div className="example-table">
              <div className="example-row header">
                <span>Code</span>
                <span>Name</span>
                <span>Hours/Week</span>
              </div>
              <div className="example-row">
                <span>CS101</span>
                <span>Computer Science</span>
                <span>4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;