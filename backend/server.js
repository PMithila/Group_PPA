// server.js
import 'dotenv/config'; // <-- must be first so env is ready for imported files

import express from 'express';
import cors from 'cors';
import { optionalAuth, authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import schedulerRoutes from './routes/scheduler.js';
import classRoutes from './routes/classes.js';
import facultyRoutes from './routes/faculty.js';
import labRoutes from './routes/labs.js';
import subjectRoutes from './routes/subjects.js';
import departmentRoutes from './routes/departments.js';
import { User } from './models/User.js';
import Class from './models/Class.js';
import Faculty from './models/Faculty.js';
import Lab from './models/Lab.js';
import { Subject } from './models/Subject.js';
import { Department } from './models/Department.js';
import { seedSampleData } from './migrations/seed_sample_data.js';
import pool from './config/database.js';

const app = express();
const PORT = process.env.PORT || 8000;


// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth required)
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

// Apply authentication middleware to all /api routes
app.use('/api', optionalAuth);

// API routes (now protected)
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/departments', departmentRoutes);

// Example of a protected route
app.get('/api/protected', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or token is invalid' });
  }
  res.json({ message: 'This is a protected route', user: req.user });
});

// Search API endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Search across multiple entities
    const results = [];
    
    // Search departments
    try {
      const departments = await Department.search(q);
      departments.forEach(dept => {
        results.push({
          type: 'department',
          id: dept.id,
          title: dept.name,
          description: dept.code,
        });
      });
    } catch (error) {
      console.error('Department search error:', error);
    }
    
    // Search subjects
    try {
      const subjects = await Subject.search(q);
      subjects.forEach(subject => {
        results.push({
          type: 'subject',
          id: subject.id,
          title: subject.name,
          description: `${subject.code} - ${subject.department_name || 'No Department'}`,
        });
      });
    } catch (error) {
      console.error('Subject search error:', error);
    }
    
    // Search teachers (users with role 'teacher')
    try {
      const query = `
        SELECT id, name, email, role FROM users 
        WHERE role = 'teacher' AND (name ILIKE $1 OR email ILIKE $1)
      `;
      const { rows: teachers } = await pool.query(query, [`%${q}%`]);
      teachers.forEach(teacher => {
        results.push({
          type: 'teacher',
          id: teacher.id,
          title: teacher.name || teacher.email,
          description: teacher.email,
        });
      });
    } catch (error) {
      console.error('Teacher search error:', error);
    }
    
    // Search classes
    try {
      const query = `
        SELECT c.*, s.name as subject_name, d.name as department_name 
        FROM classes c
        LEFT JOIN subjects s ON c.subject_id = s.id
        LEFT JOIN departments d ON c.department_id = d.id
        WHERE c.name ILIKE $1 OR c.code ILIKE $1 OR c.teacher ILIKE $1
      `;
      const { rows: classes } = await pool.query(query, [`%${q}%`]);
      classes.forEach(cls => {
        results.push({
          type: 'class',
          id: cls.id,
          title: cls.name,
          description: `${cls.code} - ${cls.subject_name || cls.department_name || 'No Department'}`,
        });
      });
    } catch (error) {
      console.error('Class search error:', error);
    }
    
    // Search labs
    try {
      const query = `
        SELECT * FROM labs 
        WHERE name ILIKE $1
      `;
      const { rows: labs } = await pool.query(query, [`%${q}%`]);
      labs.forEach(lab => {
        results.push({
          type: 'lab',
          id: lab.id,
          title: lab.name,
          description: `Capacity: ${lab.capacity || 'Unknown'}`,
        });
      });
    } catch (error) {
      console.error('Lab search error:', error);
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Demo endpoint to list users (remove in production)
app.get('/debug/users', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, email, name, role, created_at FROM users';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Function to initialize database tables
const initializeDatabase = async () => {
  try {
    // Create tables in order to respect foreign key constraints
    await Department.createTable();
    await Subject.createTable();
    await User.createTable();
    await Class.createTable();
    await Faculty.createTable();
    await Lab.createTable();
    
    // Run migrations for existing tables
    await runMigrations();
    
    // Seed sample data
    await seedSampleData();
    
    console.log('Database tables created or already exist.');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1); // Exit if database initialization fails
  }
};

// Function to run database migrations
const runMigrations = async () => {
  try {
    // Add new columns to classes table if they don't exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='classes' 
      AND column_name IN ('day', 'time_slot', 'subject_id', 'department_id', 'duration', 'max_students');
    `;
    const result = await pool.query(checkQuery);
    const existingColumns = result.rows.map(row => row.column_name);
    
    const columnsToAdd = [
      { name: 'day', type: 'VARCHAR(50)' },
      { name: 'time_slot', type: 'VARCHAR(50)' },
      { name: 'subject_id', type: 'INTEGER REFERENCES subjects(id) ON DELETE SET NULL' },
      { name: 'department_id', type: 'INTEGER REFERENCES departments(id) ON DELETE SET NULL' },
      { name: 'duration', type: 'INTEGER DEFAULT 60' },
      { name: 'max_students', type: 'INTEGER DEFAULT 30' }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        await pool.query(`ALTER TABLE classes ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✓ Added "${column.name}" column to classes table`);
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
    // Don't exit on migration errors, just log them
  }
};

// Start the server after initializing the database
const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();