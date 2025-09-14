// src/components/UploadArea.js
import React, { useCallback, useRef } from 'react';

const UploadArea = ({ onFileUpload, uploadState, onReset }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStatusConfig = useCallback(() => {
    switch (uploadState.status) {
      case 'uploading':
        return { icon: 'fa-spinner fa-spin', color: '#3b82f6' };
      case 'success':
        return { icon: 'fa-check-circle', color: '#10b981' };
      case 'error':
        return { icon: 'fa-exclamation-circle', color: '#ef4444' };
      default:
        return { icon: 'fa-cloud-upload-alt', color: '#9ca3af' };
    }
  }, [uploadState.status]);

  const statusConfig = getStatusConfig();

  return (
    <div className="upload-area">
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".xlsx, .xls, .csv" 
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      <div 
        className={`upload-box status-${uploadState.status}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={uploadState.status === 'idle' ? handleClickUpload : undefined}
      >
        <div className="upload-content">
          <i className={`fas ${statusConfig.icon}`} style={{ color: statusConfig.color }}></i>
          
          {uploadState.status === 'idle' && (
            <>
              <h4>Drag & Drop Your Excel File</h4>
              <p>or click to browse your files</p>
              <div className="supported-formats">
                <span>Supported formats: .xlsx, .xls, .csv</span>
              </div>
            </>
          )}
          
          {uploadState.status === 'uploading' && (
            <>
              <h4>Processing File</h4>
              <p>{uploadState.message}</p>
            </>
          )}
          
          {uploadState.status === 'success' && (
            <>
              <h4>Upload Successful!</h4>
              <p>{uploadState.message}</p>
            </>
          )}
          
          {uploadState.status === 'error' && (
            <>
              <h4>Upload Failed</h4>
              <p>{uploadState.message}</p>
            </>
          )}
        </div>
      </div>

      <div className="upload-actions">
        {(uploadState.status === 'success' || uploadState.status === 'error') && (
          <button className="btn btn-secondary" onClick={onReset}>
            <i className="fas fa-redo"></i> Upload Another File
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadArea;