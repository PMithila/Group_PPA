import { validationResult } from 'express-validator';
import ScheduleChangeRequest, { CHANGE_REQUEST_STATUS } from '../models/ScheduleChangeRequest.js';
import Class from '../models/Class.js';
import { Lab } from '../models/Lab.js';

const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();

const HONORIFICS = ['mr', 'ms', 'mrs', 'miss', 'dr', 'prof', 'sir', 'madam'];

const stripHonorifics = (value = '') => {
  if (!value) return '';
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0].replace(/\./g, '').toLowerCase();
  if (HONORIFICS.includes(first)) {
    return parts.slice(1).join(' ');
  }
  return parts.join(' ');
};

const matchByName = (valueA = '', valueB = '') => {
  const normalizedA = stripHonorifics(valueA).trim().toLowerCase();
  const normalizedB = stripHonorifics(valueB).trim().toLowerCase();
  if (!normalizedA || !normalizedB) {
    return valueA.trim().toLowerCase() === valueB.trim().toLowerCase();
  }
  return normalizedA === normalizedB;
};

const normalizeArrayValue = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [String(value)];
    }
  }
  return [value];
};

const ensureTeacherOwnsSession = async (sessionType, sessionId, user) => {
  if (sessionType === 'class') {
    const classRecord = await Class.getById(sessionId);
    if (!classRecord) {
      return { ok: false, status: 404, message: 'Class not found' };
    }

    const teacherMatchesId =
      classRecord.teacher_id !== undefined &&
      classRecord.teacher_id !== null &&
      Number(classRecord.teacher_id) === Number(user.id);

    const teacherMatchesEmail =
      classRecord.teacher_email &&
      user.email &&
      classRecord.teacher_email.trim().toLowerCase() === user.email.trim().toLowerCase();

    const teacherMatch =
      teacherMatchesId ||
      teacherMatchesEmail ||
      (classRecord.teacher && user.name && matchByName(classRecord.teacher, user.name)) ||
      (classRecord.teacher && String(classRecord.teacher).trim() === String(user.id)) ||
      false;

    if (!teacherMatch) {
      return {
        ok: false,
        status: 403,
        message: 'You are not assigned to this class'
      };
    }

    return { ok: true, record: classRecord };
  }

  if (sessionType === 'lab') {
    const labRecord = await Lab.findById(sessionId);
    if (!labRecord) {
      return { ok: false, status: 404, message: 'Lab session not found' };
    }

    const numericTeacher = labRecord.teacher != null ? Number(labRecord.teacher) : null;
    const teacherMatch = Number(user.id) === numericTeacher;

    if (!teacherMatch) {
      return {
        ok: false,
        status: 403,
        message: 'You are not assigned to this lab session'
      };
    }

    return { ok: true, record: labRecord };
  }

  return {
    ok: false,
    status: 400,
    message: 'Invalid session type provided'
  };
};

export const createScheduleChangeRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (normalizeRole(req.user.role) !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can request schedule changes' });
    }

    const sessionType = req.body.sessionType?.toLowerCase();
    const sessionId = Number.parseInt(req.body.sessionId, 10);
    const reason = String(req.body.reason || '').trim();
    const desiredDay = req.body.desiredDay ? String(req.body.desiredDay).trim() : null;
    const desiredTimeSlot = req.body.desiredTimeSlot ? String(req.body.desiredTimeSlot).trim() : null;
    const desiredRoom = req.body.desiredRoom ? String(req.body.desiredRoom).trim() : null;
    const desiredNotes = req.body.desiredNotes ? String(req.body.desiredNotes).trim() : null;

    const ownership = await ensureTeacherOwnsSession(sessionType, sessionId, req.user);
    if (!ownership.ok) {
      return res.status(ownership.status).json({ error: ownership.message });
    }

    const classId = sessionType === 'class' ? sessionId : null;
    const labId = sessionType === 'lab' ? sessionId : null;

    const existingPending = await ScheduleChangeRequest.findPendingForSession({
      teacherId: req.user.id,
      classId,
      labId
    });

    if (existingPending) {
      return res.status(400).json({
        error: 'You already have a pending change request for this session.'
      });
    }

    const created = await ScheduleChangeRequest.create({
      teacherId: req.user.id,
      teacherName: req.user.name,
      classId,
      labId,
      reason,
      desiredDay,
      desiredTimeSlot,
      desiredRoom,
      desiredNotes
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating schedule change request:', error);
    return res.status(500).json({ error: 'Failed to submit schedule change request' });
  }
};

export const getScheduleChangeRequests = async (req, res) => {
  try {
    const role = normalizeRole(req.user.role);
    const data =
      role === 'admin'
        ? await ScheduleChangeRequest.getAll()
        : await ScheduleChangeRequest.getForTeacher(req.user.id);

    return res.json(data);
  } catch (error) {
    console.error('Error fetching schedule change requests:', error);
    return res.status(500).json({ error: 'Failed to fetch schedule change requests' });
  }
};

export const updateScheduleChangeRequestStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const request = await ScheduleChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Schedule change request not found' });
    }

    if (request.status !== CHANGE_REQUEST_STATUS.PENDING) {
      return res.status(400).json({ error: 'Schedule change request has already been processed' });
    }

    const updated = await ScheduleChangeRequest.updateStatus(id, {
      status,
      adminNotes: adminNotes?.trim() || null,
      adminId: req.user.id
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating schedule change request status:', error);
    return res.status(500).json({ error: 'Failed to update request status' });
  }
};

export const applyScheduleChangeRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const request = await ScheduleChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Schedule change request not found' });
    }

    if (request.status !== CHANGE_REQUEST_STATUS.PENDING) {
      return res.status(400).json({ error: 'Schedule change request has already been processed' });
    }

    const rawDay = req.body.day ?? req.body.desiredDay ?? null;
    const rawTimeSlot = req.body.time_slot ?? req.body.timeSlot ?? req.body.desiredTimeSlot ?? null;
    const rawRoom = req.body.room ?? req.body.desiredRoom ?? null;
    const rawTeacher =
      typeof req.body.teacher !== 'undefined'
        ? req.body.teacher
        : typeof req.body.teacherId !== 'undefined'
          ? req.body.teacherId
          : undefined;
    const rawDuration = req.body.duration ?? req.body.desiredDuration ?? undefined;
    const rawMaxStudents = req.body.max_students ?? req.body.maxStudents ?? undefined;

    const overrides = {
      day: rawDay ? String(rawDay).trim() : null,
      time_slot: rawTimeSlot ? String(rawTimeSlot).trim() : null,
      room: rawRoom ? String(rawRoom).trim() : null,
      teacher: rawTeacher,
      duration:
        typeof rawDuration !== 'undefined' && rawDuration !== null
          ? Number(rawDuration)
          : undefined,
      max_students:
        typeof rawMaxStudents !== 'undefined' && rawMaxStudents !== null
          ? Number(rawMaxStudents)
          : undefined,
      adminNotes: req.body.adminNotes ? String(req.body.adminNotes).trim() : null
    };

    if (!request.class_id && !request.lab_id) {
      return res.status(400).json({ error: 'Schedule change request is not linked to a session' });
    }

    if (request.class_id) {
      const classRecord = await Class.getById(request.class_id);
      if (!classRecord) {
        return res.status(404).json({ error: 'Associated class no longer exists' });
      }

      const resolvedCode =
        classRecord.code ||
        classRecord.subject_code ||
        `CLASS-${request.class_id}`;
      const resolvedName =
        classRecord.name ||
        classRecord.subject_name ||
        resolvedCode;

      const updatePayload = {
        code: resolvedCode,
        name: resolvedName,
        subject_id: classRecord.subject_id || null,
        department_id: classRecord.department_id || null,
        teacher:
          typeof overrides.teacher !== 'undefined'
            ? String(overrides.teacher)
            : classRecord.teacher || null,
        room: overrides.room || request.desired_room || classRecord.room || null,
        day: overrides.day || request.desired_day || classRecord.day || null,
        time_slot: overrides.time_slot || request.desired_time_slot || classRecord.time_slot || null,
        duration:
          typeof overrides.duration === 'number' && !Number.isNaN(overrides.duration)
            ? overrides.duration
            : classRecord.duration || null,
        max_students:
          typeof overrides.max_students === 'number' && !Number.isNaN(overrides.max_students)
            ? overrides.max_students
            : classRecord.max_students || null
      };

      await Class.update(request.class_id, updatePayload);
    } else if (request.lab_id) {
      const labRecord = await Lab.findById(request.lab_id);
      if (!labRecord) {
        return res.status(404).json({ error: 'Associated lab session no longer exists' });
      }

      if (!labRecord.subject_id) {
        return res.status(400).json({
          error: 'Associated lab session is missing subject information. Please update the lab manually.'
        });
      }

      const updatePayload = {
        name: labRecord.name || '',
        capacity: labRecord.capacity ?? 0,
        resources: normalizeArrayValue(labRecord.resources),
        subject_id: labRecord.subject_id,
        department_id: labRecord.department_id,
        teacher:
          typeof overrides.teacher !== 'undefined'
            ? Number(overrides.teacher)
            : labRecord.teacher ?? null,
        room: overrides.room || request.desired_room || labRecord.room || '',
        day: overrides.day || request.desired_day || labRecord.day || '',
        time_slot: overrides.time_slot || request.desired_time_slot || labRecord.time_slot || '',
        max_students:
          typeof overrides.max_students === 'number' && !Number.isNaN(overrides.max_students)
            ? overrides.max_students
            : labRecord.max_students ?? 30
      };

      await Lab.update(request.lab_id, updatePayload);
    }

    const resolved = await ScheduleChangeRequest.applyAndResolve(id, {
      adminId: req.user.id,
      adminNotes: overrides.adminNotes
    });

    return res.json(resolved);
  } catch (error) {
    console.error('Error applying schedule change request:', error);
    return res.status(500).json({ error: 'Failed to apply schedule change request' });
  }
};
