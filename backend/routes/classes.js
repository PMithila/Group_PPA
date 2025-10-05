import express from 'express';
import Class from '../models/Class.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all classes (accessible to all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const classes = await Class.getAll();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Create a new class (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
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
    res.status(500).json({ error: 'Failed to update class' });
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
