import express from 'express';
import Class from '../models/Class.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all classes (accessible to all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Classes route accessed by user:', req.user?.email || 'No user');
    const classes = await Class.getAll();
    console.log('Classes fetched:', classes.length);
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Create a new class (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);

    // Provide more specific error messages
    if (error.message?.includes('SCHEDULE_CONFLICT')) {
      return res.status(400).json({ error: 'Schedule conflict: teacher already has a class at this time' });
    }

    if (error.message?.includes('violates foreign key constraint')) {
      if (error.message?.includes('subject_id')) {
        return res.status(400).json({ error: 'Invalid subject selected. Please ensure the subject exists.' });
      }
      if (error.message?.includes('department_id')) {
        return res.status(400).json({ error: 'Invalid department selected. Please ensure the department exists.' });
      }
      return res.status(400).json({ error: 'Invalid data provided. Please check your selections.' });
    }

    const status = error.status || 500;
    const message = error.status === 400 ? error.message : 'Failed to create class';
    res.status(status).json({ error: message });
  }
});

// Update a class (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedClass = await Class.update(req.params.id, req.body);
    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status === 400 ? 'Schedule conflict: teacher already has a class at this time' : 'Failed to update class';
    res.status(status).json({ error: message });
  }
});

// Delete a class (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Class.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

export default router;
