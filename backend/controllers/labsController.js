import { Lab } from '../models/Lab.js';
import { Subject } from '../models/Subject.js';
import { Department } from '../models/Department.js';
import { sendEmail, isEmailConfigured } from '../services/emailService.js';
import { resolveTeacherContact } from '../utils/teacherContact.js';
import pool from '../config/database.js';

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toIntOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getLabs = async (req, res) => {
  const joinSql = `
    SELECT l.*,
           s.name AS subject_name,
           d.name AS department_name,
           u.name AS teacher_name,
           u.email AS teacher_email
    FROM labs l
    LEFT JOIN subjects   s ON l.subject_id    = s.id
    LEFT JOIN departments d ON l.department_id = d.id
    LEFT JOIN users      u ON (
      l.teacher IS NOT NULL
      AND TRIM(l.teacher::text) <> ''
      AND TRIM(l.teacher::text) <> '0'
      AND u.id::text = TRIM(l.teacher::text)
    )
    ORDER BY l.name
  `;

  try {
    const { rows } = await pool.query(joinSql);
    const safe = rows.map((r) => ({
      id: r.id,
      name: r.name ?? '',
      capacity: r.capacity ?? 0,
      resources: ensureArray(r.resources),
      subject_id: r.subject_id ?? null,
      department_id: r.department_id ?? null,
      teacher: r.teacher ?? null,
      teacher_id: r.teacher ?? null,
      teacher_name: r.teacher_name ?? '',
      teacher_email: r.teacher_email ?? '',
      room: r.room ?? '',
      day: r.day ?? '',
      time_slot: r.time_slot ?? '',
      max_students: r.max_students ?? 30,
      subject_name: r.subject_name ?? '',
      department_name: r.department_name ?? '',
    }));
    return res.json(safe);
  } catch (error) {
    console.error('JOIN fetch failed, falling back to plain labs:', error);

    try {
      const rows = await Lab.getAll();
      const safe = rows.map(r => ({
        id: r.id,
        name: r.name ?? '',
        capacity: r.capacity ?? 0,
        resources: ensureArray(r.resources),
        subject_id: r.subject_id ?? null,
        department_id: r.department_id ?? null,
        teacher: r.teacher ?? null,
        teacher_id: r.teacher ?? null,
        teacher_name: '',
        teacher_email: '',
        room: r.room ?? '',
        day: r.day ?? '',
        time_slot: r.time_slot ?? '',
        max_students: r.max_students ?? 30,
        subject_name: '',
        department_name: '',
      }));
      return res.json(safe);
    } catch (fallbackError) {
      console.error('Fallback fetch failed:', fallbackError);
      return res.status(500).json({ error: 'Failed to fetch labs' });
    }
  }
};

export const createLab = async (req, res) => {
  try {
    const newLab = await Lab.create(req.body);
    await notifyTeacherAboutLab(newLab, 'created');
    res.status(201).json(newLab);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error creating lab:', error);
    res.status(500).json({ error: 'Failed to create lab' });
  }
};

export const updateLab = async (req, res) => {
  try {
    const updatedLab = await Lab.update(req.params.id, req.body);
    if (!updatedLab) return res.status(404).json({ error: 'Lab not found' });
    await notifyTeacherAboutLab(updatedLab, 'updated');
    res.json(updatedLab);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating lab:', error);
    res.status(500).json({ error: 'Failed to update lab' });
  }
};

export const deleteLab = async (req, res) => {
  try {
    await Lab.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting lab:', error);
    res.status(500).json({ error: 'Failed to delete lab' });
  }
};

export const scheduleLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, time_slot, subject_id, department_id, teacher, room, max_students } = req.body;

    const existingLab = await Lab.findById(id);
    if (!existingLab) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    if (teacher && day && time_slot) {
      const conflict = await Lab.hasConflict({
        teacher,
        day,
        time_slot,
        excludeId: id,
        excludeTable: 'labs'
      });
      if (conflict) {
        return res.status(400).json({ error: 'Schedule conflict: teacher already has a class or lab at this time' });
      }
    }

    const finalSubjectId = toIntOrNull(subject_id) ?? existingLab.subject_id;
    if (!finalSubjectId) {
      return res.status(400).json({ error: 'Subject is required for a lab session' });
    }

    const subjectDetails = await Lab.getSubjectDetails(finalSubjectId);
    if (!subjectDetails) {
      return res.status(400).json({ error: 'Selected subject does not exist' });
    }

    const finalName = subjectDetails.name;
    const providedDepartmentId = toIntOrNull(department_id);
    const finalDepartmentId = providedDepartmentId ?? subjectDetails.department_id ?? existingLab.department_id;

    const query = `
      UPDATE labs
      SET name = $1, day = $2, time_slot = $3, subject_id = $4,
          department_id = $5, teacher = $6, room = $7, max_students = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      String(finalName ?? ''),
      String(day ?? ''),
      String(time_slot ?? ''),
      finalSubjectId,
      toIntOrNull(finalDepartmentId),
      toIntOrNull(teacher),
      String(room ?? ''),
      Number.isFinite(Number(max_students)) ? Number(max_students) : 30,
      Number(id),
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lab not found' });

    const scheduledLab = result.rows[0];
    await notifyTeacherAboutLab(scheduledLab, 'updated');

    res.json(scheduledLab);
  } catch (error) {
    console.error('Error scheduling lab session:', error);

    if (error.message?.includes('SCHEDULE_CONFLICT')) {
      return res.status(400).json({ error: 'Schedule conflict: teacher already has a class or lab at this time' });
    }

    res.status(500).json({ error: 'Failed to schedule lab session' });
  }
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => {
  switch (char) {
    case '&': return '&amp;';
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '"': return '&quot;';
    case '\'': return '&#39;';
    default: return char;
  }
});

const notifyTeacherAboutLab = async (labRecord, action = 'created') => {
  if (!isEmailConfigured() || !labRecord?.teacher) {
    return;
  }

  try {
    const contact = await resolveTeacherContact(labRecord.teacher);
    if (!contact?.email) {
      console.warn('Unable to resolve teacher email for lab notification:', labRecord.teacher);
      return;
    }

    const subjectDetails = labRecord.subject_id ? await Subject.getById(labRecord.subject_id) : null;
    const departmentId = labRecord.department_id || subjectDetails?.department_id;
    const departmentDetails = departmentId ? await Department.getById(departmentId) : null;

    const statusVerb = action === 'updated' ? 'updated' : 'scheduled';
    const subjectLine = `Lab session ${statusVerb}: ${labRecord.name || subjectDetails?.name || 'Lab session'}`;
    const subjectLabel = subjectDetails
      ? `${subjectDetails.name}${subjectDetails.code ? ` (${subjectDetails.code})` : ''}`
      : 'Not specified';
    const departmentLabel = departmentDetails?.name || subjectDetails?.department_name || 'Not specified';
    const resourcesLabel = Array.isArray(labRecord.resources) && labRecord.resources.length > 0
      ? labRecord.resources.join(', ')
      : 'Not specified';

    const details = [
      { label: 'Lab', value: labRecord.name || subjectDetails?.name || 'Not specified' },
      { label: 'Subject', value: subjectLabel },
      { label: 'Department', value: departmentLabel },
      { label: 'Day', value: labRecord.day || 'Not scheduled' },
      { label: 'Time', value: labRecord.time_slot || 'Not scheduled' },
      { label: 'Room', value: labRecord.room || 'Not specified' },
      { label: 'Resources', value: resourcesLabel },
      { label: 'Capacity', value: labRecord.capacity ?? 'Not specified' },
      { label: 'Maximum students', value: labRecord.max_students ?? 'Not specified' },
    ];

    const textLines = [
      `Hello ${contact.name || 'there'},`,
      '',
      `A lab session has been ${statusVerb} for you in EduSync.`,
      ''
    ];

    details.forEach(({ label, value }) => {
      textLines.push(`${label}: ${value ?? 'Not specified'}`);
    });

    textLines.push(
      '',
      'Please log in to EduSync to view the full schedule.',
      '',
      'Regards,',
      'Administration Team'
    );

    const htmlDetails = details
      .map(({ label, value }) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value ?? 'Not specified')}</li>`)
      .join('');

    const html = `
      <p>Hello ${escapeHtml(contact.name || 'there')},</p>
      <p>A lab session has been ${escapeHtml(statusVerb)} for you in EduSync.</p>
      <ul>
        ${htmlDetails}
      </ul>
      <p>Please log in to EduSync to view the full schedule.</p>
      <p>Regards,<br/>Administration Team</p>
    `;

    await sendEmail({
      to: contact.email,
      subject: subjectLine,
      text: textLines.join('\n'),
      html
    });
  } catch (error) {
    console.error('Failed to send lab schedule notification:', error);
  }
};
