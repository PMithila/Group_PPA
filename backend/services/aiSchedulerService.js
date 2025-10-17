import OpenAI from 'openai';

const FALLBACK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const FALLBACK_SLOTS = [
  '7:30-8:10',
  '8:10-8:30',
  '8:30-9:10',
  '9:10-10:30',
  '10:50-11:30',
  '11:30-12:10',
  '12:10-12:50',
  '12:50-1:30'
];

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const scheduleSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['schedule', 'conflicts'],
  properties: {
    schedule: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'classId',
          'subject',
          'teacher',
          'grade',
          'room',
          'day',
          'timeslot',
          'durationMinutes',
          'maxStudents'
        ],
        properties: {
          classId: { type: 'string' },
          subject: { type: 'string' },
          teacher: { type: 'string' },
          teacherEmail: { type: 'string' },
          grade: { type: 'string' },
          room: { type: 'string' },
          day: { type: 'string' },
          timeslot: { type: 'string' },
          durationMinutes: { type: 'number' },
          maxStudents: { type: 'number' }
        }
      }
    },
    conflicts: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

let cachedClient = null;

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OpenAI API key is not configured. Set OPENAI_API_KEY in the environment.');
    err.code = 'OPENAI_CONFIG_ERROR';
    throw err;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
};

export const generateScheduleWithAI = async (context = {}) => {
  const baseline = buildScheduleFromPreferences(context);
  const shouldUseOpenAI =
    process.env.USE_OPENAI_SCHEDULER === 'true' && Boolean(process.env.OPENAI_API_KEY);

  if (!shouldUseOpenAI) {
    return baseline;
  }

  try {
    const aiResult = await fetchScheduleFromOpenAI(context);
    const schedule = Array.isArray(aiResult?.schedule) ? aiResult.schedule : [];
    const conflicts = Array.isArray(aiResult?.conflicts) ? aiResult.conflicts : [];

    if (!schedule.length) {
      return {
        schedule: baseline.schedule,
        conflicts: [
          ...baseline.conflicts,
          'AI returned an empty schedule. Falling back to preference-based timetable.'
        ]
      };
    }

    // Ensure duration & maxStudents are present
    const enrichedSchedule = schedule.map((entry) => ({
      ...entry,
      durationMinutes:
        typeof entry.durationMinutes === 'number' ? entry.durationMinutes : 60,
      maxStudents: typeof entry.maxStudents === 'number' ? entry.maxStudents : 30
    }));

    return {
      schedule: enrichedSchedule,
      conflicts
    };
  } catch (error) {
    console.warn('OpenAI scheduling failed, falling back to preference scheduler:', error);
    return {
      schedule: baseline.schedule,
      conflicts: [
        ...baseline.conflicts,
        `AI scheduling failed: ${error.message || 'Unknown error'}. Using preference-based timetable instead.`
      ]
    };
  }
};

const buildScheduleFromPreferences = (context) => {
  const {
    teacherRequests = [],
    existingSessions = [],
    days = FALLBACK_DAYS,
    timeSlots = FALLBACK_SLOTS
  } = context;

  const availableDays = normalizeDayList(days);
  const availableSlots = normalizeSlotList(timeSlots);

  const teacherOccupancy = new Set();
  const gradeOccupancy = new Set();

  const markOccupied = (teacher, grade, day, slot) => {
    const teacherKey = buildOccupancyKey(teacher, day, slot);
    if (teacherKey) teacherOccupancy.add(teacherKey);

    const gradeKey = buildOccupancyKey(grade, day, slot);
    if (gradeKey) gradeOccupancy.add(gradeKey);
  };

  existingSessions.forEach((session) => {
    const day = normalizeDayName(session.day, availableDays);
    const slot = normalizeSlotValue(session.time_slot || session.timeslot, availableSlots);
    markOccupied(session.teacher, session.grade || session.class, day, slot);
  });

  const schedule = [];
  const conflicts = [];

  const randomizedRequests = shuffleArray(teacherRequests);

  randomizedRequests.forEach((request, index) => {
    const teacher = (request.teacher || '').trim();
    const subject = (request.subject || '').trim();
    const grade = (request.grade || '').toString().trim();
    const durationMinutes = Number.isFinite(request.durationMinutes)
      ? request.durationMinutes
      : 60;
    const maxStudents = Number.isFinite(request.maxStudents) ? request.maxStudents : 30;

    const preferredDays = normalizeDayList(request.preferredDays || [], availableDays);
    const preferredSlots = normalizeSlotList(request.preferredTimeSlots || [], availableSlots);

    const daysToTry = preferredDays.length ? preferredDays : availableDays;
    const slotsToTry = preferredSlots.length ? preferredSlots : availableSlots;

    const randomDays = shuffleArray(daysToTry);
    const randomSlots = shuffleArray(slotsToTry);

    let assigned = false;
    let assignedDay = '';
    let assignedSlot = '';

    for (const day of randomDays) {
      if (!day) continue;
      const shuffledSlots = shuffleArray(randomSlots);
      for (const slot of shuffledSlots) {
        if (!slot) continue;
        const teacherKey = buildOccupancyKey(teacher, day, slot);
        const gradeKey = buildOccupancyKey(grade, day, slot);

        if (teacherKey && teacherOccupancy.has(teacherKey)) {
          continue;
        }
        if (gradeKey && gradeOccupancy.has(gradeKey)) {
          continue;
        }

        assigned = true;
        assignedDay = day;
        assignedSlot = slot;
        markOccupied(teacher, grade, day, slot);
        break;
      }
      if (assigned) break;
    }

    if (!assigned) {
      conflicts.push(
        `Unable to schedule ${subject || 'subject'} for ${teacher || 'teacher'} (grade ${
          grade || 'N/A'
        }) due to unavailable time slots.`
      );
      return;
    }

    const classId = `auto-${Date.now()}-${index + 1}`;
    const room =
      request.preferredRoom ||
      request.room ||
      request.preferredRooms?.[0] ||
      `Room ${grade || 'A'}`;

    schedule.push({
      classId,
      subject: subject || 'General Studies',
      teacher: teacher || 'Unassigned',
      teacherEmail: request.teacherEmail || undefined,
      grade: grade || 'Unassigned',
      room,
      day: assignedDay,
      timeslot: assignedSlot,
      durationMinutes,
      maxStudents
    });
  });

  return { schedule, conflicts };
};

const fetchScheduleFromOpenAI = async (context) => {
  const client = getClient();

  const systemPrompt = 'You are a strict timetabling engine. Output only JSON that matches the schema.';
  const userPrompt = [
    'Build a valid schedule from this data. If any hard constraints cannot be satisfied, list them in "conflicts".',
    'Include "teacherEmail" in each scheduled entry whenever an email is provided in the data.',
    'No prose, JSON only.',
    'DATA:',
    JSON.stringify(context, null, 2)
  ].join('\n');

  const response = await client.responses.create({
    model: process.env.OPENAI_SCHEDULER_MODEL || 'gpt-4o',
    temperature: 0,
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'Schedule',
        schema: scheduleSchema
      }
    }
  });

  const raw = response.output_text || '';
  const parsed = JSON.parse(raw);

  if (!parsed || !Array.isArray(parsed.schedule) || !Array.isArray(parsed.conflicts)) {
    throw new Error('AI response did not match expected schema');
  }

  return parsed;
};

const normalizeDayName = (dayValue, allowedDays = FALLBACK_DAYS) => {
  if (!dayValue) return '';
  const trimmed = dayValue.toString().trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  const abbreviations = {
    mon: 'Monday',
    tue: 'Tuesday',
    tues: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    thur: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  };

  if (abbreviations[lower]) {
    return abbreviations[lower];
  }

  const fromAllowed = allowedDays.find((day) => day.toLowerCase() === lower);
  if (fromAllowed) {
    return fromAllowed;
  }

  return trimmed
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const normalizeSlotValue = (slotValue, allowedSlots = FALLBACK_SLOTS) => {
  if (!slotValue) return '';
  const trimmed = slotValue.toString().trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  const match = allowedSlots.find((slot) => slot.toLowerCase() === lower);
  if (match) return match;

  return trimmed;
};

const normalizeDayList = (days = [], fallback = FALLBACK_DAYS) => {
  const source = Array.isArray(days) && days.length ? days : fallback;
  const normalized = source
    .map((day) => normalizeDayName(day, fallback))
    .filter(Boolean);
  return [...new Set(normalized)];
};

const normalizeSlotList = (slots = [], fallback = FALLBACK_SLOTS) => {
  const source = Array.isArray(slots) && slots.length ? slots : fallback;
  const normalized = source
    .map((slot) => normalizeSlotValue(slot, fallback))
    .filter(Boolean);
  return [...new Set(normalized)];
};

const buildOccupancyKey = (name, day, slot) => {
  if (!name || !day || !slot) return null;
  return `${name.toString().trim().toLowerCase()}|${day.toString().trim().toLowerCase()}|${slot
    .toString()
    .trim()
    .toLowerCase()}`;
};
