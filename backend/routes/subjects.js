import express from 'express';
import { Subject } from '../models/Subject.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.getAll();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.getById(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// Get subjects by department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const subjects = await Subject.getByDepartment(departmentId);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects by department:', error);
    res.status(500).json({ error: 'Failed to fetch subjects by department' });
  }
});

// Search subjects
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const subjects = await Subject.search(term);
    res.json(subjects);
  } catch (error) {
    console.error('Error searching subjects:', error);
    res.status(500).json({ error: 'Failed to search subjects' });
  }
});

// Create new subject (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name, description, credits, department_id } = req.body;
    
    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    
    const subject = await Subject.create({
      code,
      name,
      description,
      credits: credits || 3,
      department_id
    });
    
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Subject code already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Update subject (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, credits, department_id } = req.body;
    
    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    
    const subject = await Subject.update(id, {
      code,
      name,
      description,
      credits,
      department_id
    });
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Subject code already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.delete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
