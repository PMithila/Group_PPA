import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept CSV and Excel files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload CSV endpoint
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For now, just return file info
    // In a real implementation, you'd process the file and store metadata in database
    const fileInfo = {
      id: Date.now(), // Mock ID
      filename: req.file.originalname,
      path: req.file.path,
      uploaded_by: req.user.id,
      uploaded_at: new Date().toISOString()
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// List uploads endpoint
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Mock response for now - in real implementation, fetch from database
    const mockUploads = [
      {
        id: 1,
        filename: 'teachers.csv',
        path: '/uploads/teachers-123456789.csv',
        uploaded_by: req.user.id,
        uploaded_at: new Date().toISOString()
      }
    ];
    res.json(mockUploads);
  } catch (error) {
    console.error('List uploads error:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

export default router;