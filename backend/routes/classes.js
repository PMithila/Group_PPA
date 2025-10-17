import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classesController.js';

const router = express.Router();

router.get('/', authenticateToken, getClasses);
router.post('/', authenticateToken, requireAdmin, createClass);
router.put('/:id', authenticateToken, requireAdmin, updateClass);
router.delete('/:id', authenticateToken, requireAdmin, deleteClass);

export default router;
