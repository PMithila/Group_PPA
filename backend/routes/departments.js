import express from 'express';
import { Department } from '../models/Department.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.getAll();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get departments with statistics
router.get('/stats', async (req, res) => {
  try {
    const departments = await Department.getWithStats();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ error: 'Failed to fetch department statistics' });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.getById(id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Get department by code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const department = await Department.getByCode(code);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Error fetching department by code:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Search departments
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const departments = await Department.search(term);
    res.json(departments);
  } catch (error) {
    console.error('Error searching departments:', error);
    res.status(500).json({ error: 'Failed to search departments' });
  }
});

// Create new department (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name, description, head_of_department, contact_email } = req.body;
    
    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    
    const department = await Department.create({
      code,
      name,
      description,
      head_of_department,
      contact_email
    });
    
    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Department code already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, head_of_department, contact_email } = req.body;
    
    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    
    const department = await Department.update(id, {
      code,
      name,
      description,
      head_of_department,
      contact_email
    });
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Department code already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Delete department (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Department.delete(id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
