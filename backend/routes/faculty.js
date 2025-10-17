import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from '../controllers/facultyController.js';

const router = express.Router();

router.get('/', authenticateToken, getFaculty);
router.post('/', authenticateToken, requireAdmin, createFaculty);
router.put('/:id', authenticateToken, requireAdmin, updateFaculty);
router.delete('/:id', authenticateToken, requireAdmin, deleteFaculty);

export default router;
