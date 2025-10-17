import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus
} from '../controllers/leavesController.js';
import { LEAVE_STATUS } from '../models/LeaveRequest.js';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  [
    body('startDate').isISO8601().withMessage('Start date is required'),
    body('endDate').isISO8601().withMessage('End date is required'),
    body('reason')
      .isLength({ min: 3 })
      .withMessage('Reason must be at least 3 characters long')
  ],
  createLeaveRequest
);

router.get('/', authenticateToken, getLeaveRequests);

router.put(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  [
    body('status')
      .isIn([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED])
      .withMessage('Status must be approved or rejected'),
    body('decisionNote')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Decision note must be less than 1000 characters')
  ],
  updateLeaveStatus
);

export default router;
