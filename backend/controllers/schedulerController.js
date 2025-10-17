import xlsx from 'xlsx';
import { generateScheduleWithAI } from '../services/aiSchedulerService.js';
import { notifyTeacherAboutClass } from '../services/classNotificationService.js';
import Class from '../models/Class.js';
import { Subject } from '../models/Subject.js';
import { Department } from '../models/Department.js';
import { resolveTeacherContact } from '../utils/teacherContact.js';

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_TIME_SLOTS = [
  '7:30-8:10',
  '8:10-8:30',
  '8:30-9:10',
  '9:10-10:30',
  '10:50-11:30',
  '11:30-12:10',
  '12:10-12:50',
  '12:50-1:30'
];

export const runScheduler = async (req, res) => {
  try {
    const { algorithm = 'heuristic' } = req.body;

    const mockEvents = [
      {
        id: 1,
        subject: 'Mathematics',
        teacher: 'John Doe',
        room: 'Room 101',
        day: 'Monday',
        time: '09:00 - 10:00',
        class: 'Grade 10A'
      },
      {
        id: 2,
        subject: 'Science',
        teacher: 'Jane Smith',
        room: 'Lab 201',
        day: 'Monday',
        time: '10:00 - 11:00',
        class: 'Grade 10A'
      }
    ];

    res.json({
      algorithm,
      events: mockEvents,
      message: `Scheduler run with ${algorithm} algorithm`
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    res.status(500).json({ error: 'Scheduler failed to run' });
  }
};

export const getSchedulerHistory = async (req, res) => {
  try {
    const history = [
      {
        id: 1,
        algorithm: 'heuristic',
        run_at: new Date().toISOString(),
        events_count: 2,
        status: 'completed'
      }
    ];
    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduler history' });
  }
};

export const generateScheduleFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Excel file is required under field name "file"' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const [firstSheetName] = workbook.SheetNames;
    if (!firstSheetName) {
      return res.status(400).json({ error: 'Excel workbook has no sheets' });
    }

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Excel sheet is empty' });
    }

    const teacherRequests = rows
      .flatMap((row, index) => normalizeRequestRow(row, index + 2))
      .filter(Boolean);

    if (teacherRequests.length === 0) {
      return res.status(400).json({ error: 'No valid teacher rows found in the Excel sheet' });
    }

    const existingClasses = await Class.getAll();

    const aiContext = {
      teacherRequests,
      existingSessions: existingClasses,
      days: DEFAULT_DAYS,
      timeSlots: DEFAULT_TIME_SLOTS
    };

    const aiResult = await generateScheduleWithAI(aiContext);
    const aiSchedule = Array.isArray(aiResult?.schedule) ? aiResult.schedule : [];
    const aiConflicts = Array.isArray(aiResult?.conflicts) ? aiResult.conflicts : [];

    if (aiSchedule.length === 0) {
      return res.status(500).json({
        error: 'AI did not return any schedule suggestions',
        conflicts: aiConflicts
      });
    }

    const emailLookup = buildTeacherEmailLookup(teacherRequests);
    const creationResults = [];

    for (const suggestion of aiSchedule) {
      try {
        const { classRecord, contactEmail } = await createClassFromSuggestion(suggestion);
        const lookupEmail = emailLookup[getTeacherLookupKey(suggestion.teacher)];
        const overrideEmail =
          contactEmail ||
          suggestion.teacherEmail ||
          suggestion.teacher_email ||
          lookupEmail;
        await notifyTeacherAboutClass(classRecord, {
          action: 'automation',
          source: 'automation',
          overrideEmail
        });
        creationResults.push({
          status: 'created',
          class: classRecord
        });
      } catch (error) {
        console.error('Failed to create class from AI suggestion:', suggestion, error);
        creationResults.push({
          status: 'failed',
          suggestion,
          reason: error.message || 'Unknown error'
        });
      }
    }

    res.json({
      summary: {
        requested: teacherRequests.length,
        generated: aiSchedule.length,
        created: creationResults.filter((r) => r.status === 'created').length,
        failed: creationResults.filter((r) => r.status === 'failed').length
      },
      conflicts: aiConflicts,
      results: creationResults
    });
  } catch (error) {
    console.error('Failed to generate schedule from Excel:', error);
    if (error.code === 'OPENAI_CONFIG_ERROR') {
      return res.status(500).json({ error: error.message });
    }
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'OpenAI quota exceeded. Please check billing or retry later.'
      });
    }
    res.status(500).json({ error: 'Failed to generate schedule from Excel' });
  }
};

const normalizeRequestRow = (row, rowNumber) => {
  const entries = Object.entries(row).reduce((acc, [key, value]) => {
    acc[key.trim().toLowerCase()] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {});

  const teacher = entries.teacher || entries['teacher name'] || entries['teacher_name'];
  const rawSubject = entries.subject || entries['desired subject'] || entries['subject name'];
  const rawGrade = entries.grade || entries['class'] || entries['grade level'];
  const teacherEmail =
    entries['teacher email'] ||
    entries['teacher_email'] ||
    entries.teacheremail ||
    entries['email address'] ||
    entries.email ||
    entries['email_id'];

  const subjects = parseCsv(rawSubject);
  const grades = parseCsv(rawGrade);

  if (!teacher || subjects.length === 0 || grades.length === 0) {
    console.warn(`Skipping row ${rowNumber} - missing teacher/subject/grade information`);
    return [];
  }

  const preferredDays = parseCsv(entries['preferred days'] || entries['preferred_day']);
  const preferredTimeSlots = parseCsv(entries['preferred times'] || entries['preferred time slots']);
  const preferredRooms = parseCsv(entries['preferred room'] || entries['preferred rooms'] || entries.room);
  const durationMinutes = parseInteger(entries['duration'] || entries['duration_minutes']) || 60;
  const maxStudents = parseInteger(entries['max students'] || entries['max_students']) || 30;

  const requests = [];
  subjects.forEach((subjectName) => {
    grades.forEach((gradeValue) => {
      requests.push({
        teacher,
        teacherEmail: teacherEmail || undefined,
        subject: subjectName,
        grade: String(gradeValue),
        preferredDays,
        preferredTimeSlots,
        preferredRoom: preferredRooms[0] || undefined,
        preferredRooms,
        durationMinutes,
        maxStudents
      });
    });
  });

  return requests;
};

const parseCsv = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
};

const parseInteger = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const HONORIFICS = ['mr', 'ms', 'mrs', 'miss', 'dr', 'prof', 'sir', 'madam'];

const stripHonorifics = (name = '') => {
  if (!name) return '';
  const parts = name
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

const buildGradeCandidates = (gradeLabel) => {
  if (!gradeLabel) return [];
  const raw = gradeLabel.toString().trim();
  if (!raw) return [];

  const candidates = new Set();
  candidates.add(raw);

  const lower = raw.toLowerCase();
  if (!lower.startsWith('grade')) {
    candidates.add(`Grade ${raw}`);
  }

  const stripped = raw.replace(/grade\s*/i, '').trim();
  if (stripped) {
    candidates.add(`Grade ${stripped}`);
    candidates.add(stripped);
  }

  const numeric = stripped.replace(/[^0-9]/g, '');
  if (numeric) {
    candidates.add(`Grade ${numeric}`);
    candidates.add(numeric);
  }

  return Array.from(candidates);
};

const resolveDepartmentForGrade = async (gradeLabel, fallbackDepartmentId = null) => {
  const candidates = buildGradeCandidates(gradeLabel);

  for (const candidate of candidates) {
    const department = await Department.findByNameOrCodeLike(candidate);
    if (department) {
      return department;
    }
  }

  if (fallbackDepartmentId) {
    const fallback = await Department.getById(fallbackDepartmentId);
    if (fallback) {
      return fallback;
    }
  }

  return null;
};

const createClassFromSuggestion = async (suggestion) => {
  const teacherName = suggestion.teacher || suggestion.teacherName;
  const subjectName = suggestion.subject || suggestion.subjectName || 'General Studies';
  const gradeLabel = suggestion.grade || suggestion.gradeLevel || 'Unassigned';
  const day = suggestion.day || suggestion.dayOfWeek || '';
  const timeSlot = suggestion.timeSlot || suggestion.timeslot || suggestion.time || '';
  const room = suggestion.room || '';
  const duration = parseInteger(suggestion.durationMinutes) || 60;
  const maxStudents = parseInteger(suggestion.maxStudents) || 30;

  const normalizedTimeSlot = normalizeTimeSlot(timeSlot);
  const normalizedDay = normalizeDay(day);

  const subjectRecord = await ensureSubjectExists(subjectName);
  const resolvedDepartment = await resolveDepartmentForGrade(gradeLabel, subjectRecord?.department_id);

  const teacherEmailSuggestion =
    suggestion.teacherEmail || suggestion.teacher_email || suggestion.email || null;
  const teacherIdSuggestion =
    suggestion.teacher_id || suggestion.teacherId || null;

  const contact = await resolveTeacherContact(
    teacherEmailSuggestion || teacherIdSuggestion || teacherName
  );

  const resolvedTeacherId = contact?.user?.id
    ? Number(contact.user.id)
    : teacherIdSuggestion && Number.isFinite(Number(teacherIdSuggestion))
      ? Number(teacherIdSuggestion)
      : null;

  const resolvedTeacherName =
    teacherName || contact?.name || contact?.user?.name || contact?.user?.email || null;

  const resolvedTeacherEmail = contact?.email || teacherEmailSuggestion || null;

  const payload = {
    code: buildClassCode(subjectName, gradeLabel, normalizedDay, normalizedTimeSlot),
    name: `${subjectName} - Grade ${gradeLabel}`,
    subject_id: subjectRecord?.id || null,
    department_id: resolvedDepartment?.id || subjectRecord?.department_id || null,
    teacher: resolvedTeacherName,
    teacher_id: resolvedTeacherId,
    teacher_email: resolvedTeacherEmail,
    room: room || `Room ${gradeLabel}`,
    day: normalizedDay,
    time_slot: normalizedTimeSlot,
    max_students: maxStudents,
    duration
  };

  const classRecord = await Class.create(payload);
  return {
    classRecord,
    contactEmail: resolvedTeacherEmail
  };
};

const getTeacherLookupKey = (teacher) => {
  if (!teacher) return '';
  const stripped = stripHonorifics(teacher).trim().toLowerCase();
  return stripped || teacher.trim().toLowerCase();
};

const buildTeacherEmailLookup = (requests = []) => {
  const map = {};
  requests.forEach((request) => {
    if (request.teacher && request.teacherEmail) {
      const primary = request.teacher.trim().toLowerCase();
      const stripped = stripHonorifics(request.teacher).trim().toLowerCase();
      [primary, stripped].filter(Boolean).forEach((key) => {
        if (key && !map[key]) {
          map[key] = request.teacherEmail.trim();
        }
      });
    }
  });
  return map;
};

const ensureSubjectExists = async (name) => {
  if (!name) return null;
  const existing = await Subject.findByName(name);
  if (existing) return existing;

  const safeCode = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12) || `subj-${Date.now()}`;

  return Subject.create({
    code: safeCode,
    name,
    description: `Auto-generated subject for ${name}`
  });
};

const normalizeDay = (day) => {
  if (!day) return '';
  const normalized = day.toString().trim().toLowerCase();
  const abbreviationMap = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday'
  };

  if (abbreviationMap[normalized]) {
    return abbreviationMap[normalized];
  }

  const match = DEFAULT_DAYS.find((d) => d.toLowerCase() === normalized);
  return match || day;
};

const normalizeTimeSlot = (timeSlot) => {
  if (!timeSlot) return '';
  const normalized = timeSlot.toString().trim();
  const match = DEFAULT_TIME_SLOTS.find((slot) => slot.toLowerCase() === normalized.toLowerCase());
  return match || normalized;
};

const buildClassCode = (subjectName, gradeLabel, day, timeSlot) => {
  const base = `${subjectName}-${gradeLabel}-${day}-${timeSlot}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 40) || `class-${Date.now()}`;
};
