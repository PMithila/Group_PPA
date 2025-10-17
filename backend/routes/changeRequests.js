import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  createScheduleChangeRequest,
  getScheduleChangeRequests,
  updateScheduleChangeRequestStatus,
  applyScheduleChangeRequest
} from '../controllers/scheduleChangeRequestsController.js';
import { CHANGE_REQUEST_STATUS } from '../models/ScheduleChangeRequest.js';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  [
    body('sessionType')
      .isIn(['class', 'lab'])
      .withMessage('Session type must be either "class" or "lab"'),
    body('sessionId')
      .isInt({ min: 1 })
      .withMessage('A valid session ID must be provided'),
    body('reason')
      .isLength({ min: 5 })
      .withMessage('Reason must be at least 5 characters long'),
    body('desiredDay')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Desired day must be less than 50 characters'),
    body('desiredTimeSlot')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Desired time slot must be less than 50 characters'),
    body('desiredRoom')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Desired room must be less than 100 characters'),
    body('desiredNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Additional notes must be less than 1000 characters')
  ],
  createScheduleChangeRequest
);

router.get('/', authenticateToken, getScheduleChangeRequests);

router.put(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  [
    body('status')
      .isIn([CHANGE_REQUEST_STATUS.RESOLVED, CHANGE_REQUEST_STATUS.REJECTED])
      .withMessage('Status must be resolved or rejected'),
    body('adminNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Admin notes must be less than 1000 characters')
  ],
  updateScheduleChangeRequestStatus
);

router.put(
  '/:id/apply',
  authenticateToken,
  requireAdmin,
  [
    body('day')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Day must be less than 50 characters'),
    body('time_slot')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Time slot must be less than 50 characters'),
    body('timeSlot')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Time slot must be less than 50 characters'),
    body('room')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Room must be less than 100 characters'),
    body('teacher')
      .optional()
      .isLength({ min: 1 })
      .withMessage('Teacher value must not be empty'),
    body('teacherId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Teacher ID must be a positive integer'),
    body('duration')
      .optional()
      .isInt({ min: 10, max: 600 })
      .withMessage('Duration must be between 10 and 600 minutes'),
    body('max_students')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Maximum students must be between 1 and 1000'),
    body('maxStudents')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Maximum students must be between 1 and 1000'),
    body('adminNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Admin notes must be less than 1000 characters')
  ],
  applyScheduleChangeRequest
);

export default router;
