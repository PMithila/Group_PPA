import express from 'express';
import Lab from '../models/Lab.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all labs (accessible to all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const labs = await Lab.getAll();
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labs' });
  }
});

// Create a new lab (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newLab = await Lab.create(req.body);
    res.status(201).json(newLab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lab' });
  }
});

// Update a lab (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedLab = await Lab.update(req.params.id, req.body);
    if (!updatedLab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(updatedLab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lab' });
  }
});

// Delete a lab (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Lab.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lab' });
  }
});

export default router;
