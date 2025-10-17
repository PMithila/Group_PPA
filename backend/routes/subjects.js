import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getSubjects,
  getSubjectById,
  getSubjectsByDepartment,
  searchSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjectsController.js';

const router = express.Router();

router.get('/', getSubjects);
router.get('/department/:departmentId', getSubjectsByDepartment);
router.get('/search/:term', searchSubjects);
router.get('/:id', getSubjectById);

router.post('/', authenticateToken, createSubject);
router.put('/:id', authenticateToken, updateSubject);
router.delete('/:id', authenticateToken, deleteSubject);

export default router;
