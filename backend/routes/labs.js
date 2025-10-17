import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getLabs,
  createLab,
  updateLab,
  deleteLab,
  scheduleLab
} from '../controllers/labsController.js';

const router = express.Router();

router.get('/', authenticateToken, getLabs);
router.post('/', authenticateToken, requireAdmin, createLab);
router.put('/:id', authenticateToken, requireAdmin, updateLab);
router.delete('/:id', authenticateToken, requireAdmin, deleteLab);
router.post('/:id/schedule', authenticateToken, requireAdmin, scheduleLab);

export default router;
