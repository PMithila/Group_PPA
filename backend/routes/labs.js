import express from 'express';
import Lab from '../models/Lab.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(optionalAuth);

// Get all labs
router.get('/', async (req, res) => {
  try {
    const labs = await Lab.getAll();
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labs' });
  }
});

// Create a new lab
router.post('/', async (req, res) => {
  try {
    const newLab = await Lab.create(req.body);
    res.status(201).json(newLab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lab' });
  }
});

// Update a lab
router.put('/:id', async (req, res) => {
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

// Delete a lab
router.delete('/:id', async (req, res) => {
  try {
    await Lab.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lab' });
  }
});

export default router;
