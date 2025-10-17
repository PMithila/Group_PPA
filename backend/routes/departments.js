import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getDepartments,
  getDepartmentStats,
  getDepartmentById,
  getDepartmentByCode,
  searchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentsController.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/stats', getDepartmentStats);
router.get('/code/:code', getDepartmentByCode);
router.get('/search/:term', searchDepartments);
router.get('/:id', getDepartmentById);

router.post('/', authenticateToken, createDepartment);
router.put('/:id', authenticateToken, updateDepartment);
router.delete('/:id', authenticateToken, deleteDepartment);

export default router;
