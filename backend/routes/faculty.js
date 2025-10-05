import express from 'express';
import Faculty from '../models/Faculty.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all faculty (accessible to all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const faculty = await Faculty.getAll();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get faculty', error: error.message });
  }
});

// Create new faculty (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newFaculty = await Faculty.create(req.body);
    res.status(201).json(newFaculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create faculty', error: error.message });
  }
});

// Update faculty (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedFaculty = await Faculty.update(req.params.id, req.body);
    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update faculty', error: error.message });
  }
});

// Delete faculty (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Faculty.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete faculty', error: error.message });
  }
});

export default router;
