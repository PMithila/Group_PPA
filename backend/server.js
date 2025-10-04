import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { optionalAuth, authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import schedulerRoutes from './routes/scheduler.js';
import classRoutes from './routes/classes.js';
import facultyRoutes from './routes/faculty.js';
import labRoutes from './routes/labs.js';
import User from './models/User.js';
import Class from './models/Class.js';
import Faculty from './models/Faculty.js';
import Lab from './models/Lab.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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

// Example of a protected route
app.get('/api/protected', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or token is invalid' });
  }
  res.json({ message: 'This is a protected route', user: req.user });
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
    await User.createTable();
    await Class.createTable();
    await Faculty.createTable();
    await Lab.createTable();
    console.log('Database tables created or already exist.');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1); // Exit if database initialization fails
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