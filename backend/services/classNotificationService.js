import { sendEmail, isEmailConfigured } from './emailService.js';
import { Subject } from '../models/Subject.js';
import { Department } from '../models/Department.js';
import { resolveTeacherContact } from '../utils/teacherContact.js';

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });

const buildStatusVerb = (action = 'created') => {
  switch (action) {
    case 'updated':
      return 'updated';
    case 'automation':
      return 'scheduled automatically';
    default:
      return 'scheduled';
  }
};

const buildSourceLabel = (source) => {
  if (source === 'automation') {
    return 'This class was scheduled automatically by the timetable generator.';
  }
  return 'Please log in to EduSync to view the full schedule.';
};

export const notifyTeacherAboutClass = async (
  classRecord,
  { action = 'created', source = 'manual', overrideEmail = null } = {}
) => {
  if (!isEmailConfigured() || !classRecord?.teacher) {
    return;
  }

  try {
    const contact = await resolveTeacherContact(classRecord.teacher);
    const contactRecord = contact || {
      email: overrideEmail,
      name: classRecord.teacher || 'Teacher'
    };

    if (!contactRecord.email && overrideEmail) {
      contactRecord.email = overrideEmail;
    }

    const subjectDetails = classRecord.subject_id
      ? await Subject.getById(classRecord.subject_id)
      : null;
    const departmentDetails = classRecord.department_id
      ? await Department.getById(classRecord.department_id)
      : null;

    const statusVerb =
      action === 'automation' ? 'scheduled automatically' : buildStatusVerb(action);

    const subjectLine = `Class ${statusVerb}: ${
      classRecord.name || subjectDetails?.name || classRecord.code || 'Course'
    }`;

    const subjectLabel = subjectDetails
      ? `${subjectDetails.name}${
          subjectDetails.code ? ` (${subjectDetails.code})` : ''
        }`
      : 'Not specified';

    const departmentLabel =
      departmentDetails?.name || subjectDetails?.department_name || 'Not specified';

    const details = [
      { label: 'Class', value: classRecord.name || subjectDetails?.name || 'Not specified' },
      { label: 'Code', value: classRecord.code || 'Not specified' },
      { label: 'Subject', value: subjectLabel },
      { label: 'Department', value: departmentLabel },
      { label: 'Day', value: classRecord.day || 'Not scheduled' },
      { label: 'Time', value: classRecord.time_slot || 'Not scheduled' },
      { label: 'Room', value: classRecord.room || 'Not specified' },
      {
        label: 'Maximum students',
        value: classRecord.max_students ?? classRecord.maxStudents ?? 'Not specified'
      }
    ];

    const sourceLine = buildSourceLabel(source);

    const textLines = [
      `Hello ${contactRecord.name || 'there'},`,
      '',
      `A class has been ${statusVerb} for you in EduSync.`,
      ''
    ];

    details.forEach(({ label, value }) => {
      textLines.push(`${label}: ${value ?? 'Not specified'}`);
    });

    textLines.push('', sourceLine, '', 'Regards,', 'Administration Team');

    if (contactRecord.email) {
      const htmlDetails = details
        .map(
          ({ label, value }) =>
            `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value ?? 'Not specified')}</li>`
        )
        .join('');

      const html = `
        <p>Hello ${escapeHtml(contactRecord.name || 'there')},</p>
        <p>A class has been ${escapeHtml(statusVerb)} for you in EduSync.</p>
        <ul>
          ${htmlDetails}
        </ul>
        <p>${escapeHtml(sourceLine)}</p>
        <p>Regards,<br/>Administration Team</p>
      `;

      await sendEmail({
        to: contactRecord.email,
        subject: subjectLine,
        text: textLines.join('\n'),
        html
      });
    } else {
      console.warn(
        'Unable to resolve teacher email for class notification. Please update the teacher record:',
        classRecord.teacher
      );
    }
  } catch (error) {
    console.error('Failed to send class schedule notification:', error);
  }
};

export default notifyTeacherAboutClass;
