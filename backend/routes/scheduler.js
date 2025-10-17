import express from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  runScheduler,
  getSchedulerHistory,
  generateScheduleFromExcel
} from '../controllers/schedulerController.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/run', authenticateToken, runScheduler);
router.get('/history', authenticateToken, getSchedulerHistory);
router.post(
  '/generate-from-excel',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  generateScheduleFromExcel
);

export default router;
