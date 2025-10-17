import { validationResult } from 'express-validator';
import { LeaveRequest, LEAVE_STATUS } from '../models/LeaveRequest.js';
import { sendEmail, isEmailConfigured } from '../services/emailService.js';

const normalizeRole = (role) => (role || '').toLowerCase();

export const createLeaveRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (normalizeRole(req.user.role) !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can apply for leave' });
    }

    const { startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date range provided' });
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before or equal to end date' });
    }

    const created = await LeaveRequest.create({
      teacherId: req.user.id,
      startDate: startDate,
      endDate: endDate,
      reason: reason.trim()
    });

    const detailed = await LeaveRequest.findById(created.id);

    await maybeSendSubmissionEmail(detailed, req.user);

    res.status(201).json(detailed);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const role = normalizeRole(req.user.role);
    const data =
      role === 'admin'
        ? await LeaveRequest.getAll()
        : await LeaveRequest.getForTeacher(req.user.id);

    res.json(data);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, decisionNote } = req.body;

    const existing = await LeaveRequest.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (existing.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({ error: 'Leave request has already been processed' });
    }

    await LeaveRequest.updateStatus(id, {
      status,
      decisionNote: decisionNote?.trim() || null,
      decisionBy: req.user.id
    });

    const updated = await LeaveRequest.findById(id);

    await maybeSendDecisionEmail(updated, status);

    res.json(updated);
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ error: 'Failed to update leave request status' });
  }
};

const maybeSendSubmissionEmail = async (leaveRecord, fallbackUser) => {
  if (!leaveRecord || !isEmailConfigured()) {
    return;
  }

  try {
    const teacherName = leaveRecord.teacher_name || fallbackUser?.name || 'there';
    const text = [
      `Hello ${teacherName},`,
      '',
      `Your leave request from ${leaveRecord.start_date} to ${leaveRecord.end_date} has been submitted successfully.`,
      'The administration team will review it soon and you will receive another email once a decision is made.',
      '',
      `Reason provided: ${leaveRecord.reason}`,
      '',
      'Regards,',
      'Administration Team'
    ].join('\n');

    const html = `
      <p>Hello ${teacherName},</p>
      <p>Your leave request from <strong>${leaveRecord.start_date}</strong> to <strong>${leaveRecord.end_date}</strong> has been submitted successfully.</p>
      <p>The administration team will review it soon and you will receive another email once a decision is made.</p>
      <p><strong>Reason provided:</strong> ${leaveRecord.reason}</p>
      <p>Regards,<br/>Administration Team</p>
    `;

    await sendEmail({
      to: leaveRecord.teacher_email || fallbackUser?.email,
      subject: 'Leave request submitted',
      text,
      html
    });
  } catch (emailError) {
    console.error('Failed to send leave submission email:', emailError);
  }
};

const maybeSendDecisionEmail = async (leaveRecord, status) => {
  if (!leaveRecord || !isEmailConfigured()) {
    return;
  }

  try {
    const statusText = status === LEAVE_STATUS.APPROVED ? 'approved' : 'rejected';
    const adminMessage = leaveRecord.decision_note?.trim();
    const messageLines = [
      `Hello ${leaveRecord.teacher_name || 'there'},`,
      '',
      `Your leave request from ${leaveRecord.start_date} to ${leaveRecord.end_date} has been ${statusText}.`,
      `Reason provided: ${leaveRecord.reason}`,
      '',
      `Administrator message: ${adminMessage || 'No additional message provided.'}`,
      '',
      'Regards,',
      'Administration Team'
    ];

    const text = messageLines.join('\n');

    const html = `
      <p>Hello ${leaveRecord.teacher_name || 'there'},</p>
      <p>Your leave request from <strong>${leaveRecord.start_date}</strong> to <strong>${leaveRecord.end_date}</strong> has been <strong>${statusText}</strong>.</p>
      <p><strong>Reason provided:</strong> ${leaveRecord.reason}</p>
      <p><strong>Administrator message:</strong> ${adminMessage || 'No additional message provided.'}</p>
      <p>Regards,<br/>Administration Team</p>
    `;

    await sendEmail({
      to: leaveRecord.teacher_email,
      subject: `Leave request ${statusText}`,
      text,
      html
    });
  } catch (emailError) {
    console.error('Failed to send leave decision email:', emailError);
  }
};
