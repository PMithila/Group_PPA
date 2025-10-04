import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Run scheduler endpoint
router.post('/run', authenticateToken, async (req, res) => {
  try {
    const { algorithm = 'heuristic' } = req.body;

    // Mock scheduler response for now
    // In a real implementation, you'd integrate with actual scheduling logic
    const mockEvents = [
      {
        id: 1,
        subject: 'Mathematics',
        teacher: 'John Doe',
        room: 'Room 101',
        day: 'Monday',
        time: '09:00 - 10:00',
        class: 'Grade 10A'
      },
      {
        id: 2,
        subject: 'Science',
        teacher: 'Jane Smith',
        room: 'Lab 201',
        day: 'Monday',
        time: '10:00 - 11:00',
        class: 'Grade 10A'
      }
    ];

    res.json({
      algorithm,
      events: mockEvents,
      message: `Scheduler run with ${algorithm} algorithm`
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    res.status(500).json({ error: 'Scheduler failed to run' });
  }
});

// Get scheduler status or history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // Mock history response
    const history = [
      {
        id: 1,
        algorithm: 'heuristic',
        run_at: new Date().toISOString(),
        events_count: 2,
        status: 'completed'
      }
    ];
    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduler history' });
  }
});

export default router;