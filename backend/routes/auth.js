import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  getTeachers,
  getUsers,
  createUser,
  updateUser
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('name').optional().trim(),
  body('department').optional().isNumeric().withMessage('Department must be a valid department ID.'),
  body('role').optional().isIn(['teacher', 'admin']).withMessage('Role must be either teacher or admin.')
], register);

router.post('/token', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail()
], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], resetPassword);

router.get('/me', authenticateToken, getCurrentUser);

router.put('/profile', authenticateToken, [
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().trim()
], updateProfile);

router.get('/teachers', authenticateToken, getTeachers);
router.get('/users', authenticateToken, getUsers);

router.post('/users', authenticateToken, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim(),
  body('role').optional().isIn(['teacher', 'admin'])
], createUser);

router.put('/users/:id', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  body('name').optional().trim(),
  body('role').optional().isIn(['teacher', 'admin'])
], updateUser);

export default router;
