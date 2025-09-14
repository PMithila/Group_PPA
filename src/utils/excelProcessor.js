// src/utils/excelProcessor.js
import * as XLSX from 'xlsx';
// Validate Excel workbook structure
export const validateExcelData = (workbook) => {
  const errors = [];
  const sheetNames = workbook.SheetNames.map(name => name.toLowerCase());
  
  // Check for required sheets
  const requiredSheets = ['teachers', 'subjects', 'classrooms'];
  const missingSheets = requiredSheets.filter(sheet => !sheetNames.includes(sheet));
  
  if (missingSheets.length > 0) {
    errors.push(`Missing required sheets: ${missingSheets.join(', ')}`);
  }
  
  // Validate each sheet structure
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length <= 1) {
      errors.push(`Sheet "${sheetName}" is empty or has no data rows`);
      return;
    }
    
    const headers = jsonData[0].map(h => h ? h.toString().toLowerCase().trim() : '');
    switch (sheetName.toLowerCase()) {
      case 'teachers':
        if (!headers.includes('name') || !headers.includes('subject')) {
          errors.push(`Teachers sheet must include "Name" and "Subject" columns`);
        }
        break;
        
      case 'subjects':
        if (!headers.includes('code') || !headers.includes('name')) {
          errors.push(`Subjects sheet must include "Code" and "Name" columns`);
        }
        break;
        
      case 'classrooms':
        if (!headers.includes('name') || !headers.includes('capacity')) {
          errors.push(`Classrooms sheet must include "Name" and "Capacity" columns`);
        }
        break;
      default:
        // No validation for other sheets
        break;
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Process Excel data into structured format
export const processExcelData = (workbook) => {
  const result = {
    teachers: [],
    subjects: [],
    classrooms: [],
    constraints: []
  };
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length <= 1) return;
    
    const headers = jsonData[0].map(h => h ? h.toString().toLowerCase().trim() : '');
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const item = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          item[header] = row[index];
        }
      });

      switch (sheetName.toLowerCase()) {
        case 'teachers':
          result.teachers.push(item);
          break;
        case 'subjects':
          result.subjects.push(item);
          break;
        case 'classrooms':
          result.classrooms.push(item);
          break;
        case 'constraints':
          result.constraints.push(item);
          break;
        default:
          // No action for other sheets
          break;
      }
    }
  });

  return result;
};