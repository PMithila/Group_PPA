// Teacher Notification Service
import { getClasses, getLabSessions } from '../api';

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

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().trim().toLowerCase();
};

export class TeacherNotificationService {
  constructor() {
    this.checkInterval = null;
    this.notificationCallbacks = [];
    this.lastCheckedSessions = new Set();
  }

  subscribe(callback) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  notify(notification) {
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  normalizeSession(rawSession = {}, fallbackType = 'class') {
    const session = { ...rawSession };
    session.type = session.type || fallbackType;
    session.teacher_name = session.teacher_name || session.teacher_full_name || session.teacher;

    if (session.teacher_name) {
      session.teacher_name = session.teacher_name.trim();
    }

    if (session.teacher_id === undefined && session.teacherId !== undefined) {
      const numericId = Number(session.teacherId);
      if (!Number.isNaN(numericId)) {
        session.teacher_id = numericId;
      }
    }

    if (session.teacher !== undefined && session.teacher !== null && session.teacher !== '') {
      const numericTeacher = Number(session.teacher);
      if (!Number.isNaN(numericTeacher)) {
        session.teacher_id = numericTeacher;
      }
    }

    if (!session.code && session.subject_code) session.code = session.subject_code;
    if (!session.name && session.subject_name) session.name = session.subject_name;
    if (!session.teacher_email && session.email) session.teacher_email = session.email;

    return session;
  }

  matchesTeacher(session, teacherInfo = {}) {
    if (!session) return false;
    const teacherIds = [];
    if (teacherInfo?.id !== undefined && teacherInfo?.id !== null) {
      const numericId = Number(teacherInfo.id);
      if (!Number.isNaN(numericId)) {
        teacherIds.push(numericId);
      }
    }

    const teacherNames = new Set();
    if (teacherInfo?.name) {
      teacherNames.add(normalizeValue(teacherInfo.name));
      teacherNames.add(normalizeValue(stripHonorifics(teacherInfo.name)));
    }

    const teacherEmails = new Set();
    if (teacherInfo?.email) {
      teacherEmails.add(normalizeValue(teacherInfo.email));
    }

    if (teacherIds.length) {
      const sessionTeacherIdRaw = session.teacher_id ?? session.teacher;
      const sessionTeacherId = sessionTeacherIdRaw != null ? Number(sessionTeacherIdRaw) : null;
      if (sessionTeacherId != null && !Number.isNaN(sessionTeacherId) && teacherIds.includes(sessionTeacherId)) {
        return true;
      }
    }

    const sessionEmails = [
      session.teacher_email,
      session.teacherEmail,
      session.email
    ].map(normalizeValue).filter(Boolean);

    if (sessionEmails.length && teacherEmails.size) {
      if (sessionEmails.some((emailValue) => teacherEmails.has(emailValue))) {
        return true;
      }
    }

    const sessionNames = [
      session.teacher_name,
      session.teacher_full_name,
      session.teacher,
      stripHonorifics(session.teacher_name),
      stripHonorifics(session.teacher_full_name),
      stripHonorifics(session.teacher)
    ].map(normalizeValue).filter(Boolean);

    if (sessionNames.length && teacherNames.size) {
      if (sessionNames.some((nameValue) => teacherNames.has(nameValue))) {
        return true;
      }
    }

    return false;
  }

  async fetchSessions() {
    try {
      const [classes, labs] = await Promise.all([getClasses(), getLabSessions()]);
      const normalizedClasses = classes.map(cls => this.normalizeSession(cls, 'class'));
      const normalizedLabs = labs.map(lab => this.normalizeSession(lab, 'lab'));
      return [...normalizedClasses, ...normalizedLabs];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  async checkUpcomingClasses(teacherInfo, checkMinutes = 15) {
    try {
      const allSessions = await this.fetchSessions();
      const now = new Date();
      const checkTime = new Date(now.getTime() + checkMinutes * 60 * 1000);

      return allSessions.filter(session => {
        if (!this.matchesTeacher(session, teacherInfo) || !session.day || !session.time_slot) {
          return false;
        }

        const today = now.toLocaleDateString('en-US', { weekday: 'long' });
        if (session.day !== today) {
          return false;
        }

        const sessionTime = this.parseTimeSlot(session.time_slot);
        if (!sessionTime) {
          return false;
        }

        const sessionDateTime = new Date();
        sessionDateTime.setHours(sessionTime.hours, sessionTime.minutes, 0, 0);

        return sessionDateTime >= now && sessionDateTime <= checkTime;
      });
    } catch (error) {
      console.error('Error checking upcoming sessions:', error);
      return [];
    }
  }

  parseTimeSlot(timeSlot) {
    const timeMapping = {
      '7:30-8:10': { hours: 7, minutes: 30 },
      '8:10-8:30': { hours: 8, minutes: 10 },
      '8:30-9:10': { hours: 8, minutes: 30 },
      '9:10-10:30': { hours: 9, minutes: 10 },
      '10:50-11:30': { hours: 10, minutes: 50 },
      '11:30-12:10': { hours: 11, minutes: 30 },
      '12:10-12:50': { hours: 12, minutes: 10 },
      '12:50-1:30': { hours: 12, minutes: 50 },
      '8am-9am': { hours: 8, minutes: 0 },
      '9am-10am': { hours: 9, minutes: 0 },
      '10am-11am': { hours: 10, minutes: 0 },
      '11am-12pm': { hours: 11, minutes: 0 },
      '12pm-1pm': { hours: 12, minutes: 0 },
      '1pm-2pm': { hours: 13, minutes: 0 },
      '2pm-3pm': { hours: 14, minutes: 0 },
      '3pm-4pm': { hours: 15, minutes: 0 },
      '4pm-5pm': { hours: 16, minutes: 0 },
      '5pm-6pm': { hours: 17, minutes: 0 },
      '6pm-7pm': { hours: 18, minutes: 0 },
      '7pm-8pm': { hours: 19, minutes: 0 }
    };

    return timeMapping[timeSlot] || null;
  }

  startMonitoring(teacherInfo, checkIntervalMinutes = 5, notificationMinutes = 15) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    const checkForUpcomingClasses = async () => {
      const upcomingClasses = await this.checkUpcomingClasses(teacherInfo, notificationMinutes);

      upcomingClasses.forEach(cls => {
        const classId = `${cls.id}-${cls.time_slot || 'unscheduled'}-${cls.type}`;
        if (!this.lastCheckedSessions.has(classId)) {
          this.lastCheckedSessions.add(classId);

          const classTime = this.parseTimeSlot(cls.time_slot);
          const classDateTime = new Date();
          if (classTime) {
            classDateTime.setHours(classTime.hours, classTime.minutes, 0, 0);
          }

          const timeUntilClass = classTime
            ? Math.max(0, Math.round((classDateTime - new Date()) / (1000 * 60)))
            : null;

          const sessionType = cls.type === 'lab' ? 'Lab' : 'Class';
          const sessionCode = cls.code || cls.name || 'Session';

          this.notify({
            id: classId,
            type: 'class_reminder',
            title: `Upcoming ${sessionType}`,
            message: timeUntilClass !== null
              ? `You have ${sessionType} "${sessionCode}" in ${timeUntilClass} minutes at ${cls.room || 'TBA'}`
              : `You have ${sessionType} "${sessionCode}" scheduled soon.`,
            sessionData: cls,
            timeUntilClass,
            timestamp: new Date()
          });
        }
      });
    };

    checkForUpcomingClasses();
    this.checkInterval = setInterval(checkForUpcomingClasses, checkIntervalMinutes * 60 * 1000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.lastCheckedSessions.clear();
  }

  async getTodaysClasses(teacherInfo) {
    try {
      const sessions = await this.fetchSessions();
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todaysSessions = sessions.filter(
        session => this.matchesTeacher(session, teacherInfo) && session.day === today
      );

      return todaysSessions.sort((a, b) => {
        const timeA = this.parseTimeSlot(a.time_slot);
        const timeB = this.parseTimeSlot(b.time_slot);
        if (!timeA || !timeB) return 0;
        return (timeA.hours * 60 + timeA.minutes) - (timeB.hours * 60 + timeB.minutes);
      });
    } catch (error) {
      console.error('Error fetching today\'s sessions:', error);
      return [];
    }
  }

  async checkClassConflicts(teacherInfo) {
    try {
      const classes = await getClasses();
      const normalized = classes.map(cls => this.normalizeSession(cls, 'class'));
      const teacherClasses = normalized.filter(cls => this.matchesTeacher(cls, teacherInfo));

      const conflicts = [];
      const timeSlots = {};

      teacherClasses.forEach(cls => {
        if (!cls.day || !cls.time_slot) return;

        const key = `${cls.day}-${cls.time_slot}`;
        if (timeSlots[key]) {
          conflicts.push({
            type: 'time_conflict',
            message: `You have overlapping classes on ${cls.day} at ${cls.time_slot}`,
            classes: [timeSlots[key], cls]
          });
        } else {
          timeSlots[key] = cls;
        }
      });

      return conflicts;
    } catch (error) {
      console.error('Error checking class conflicts:', error);
      return [];
    }
  }

  async buildScheduleNotifications(teacherInfo) {
    const todaysSessions = await this.getTodaysClasses(teacherInfo);
    return todaysSessions.map(session => {
      const sessionType = session.type === 'lab' ? 'Lab' : 'Class';
      const sessionCode = session.code || session.name || 'Session';
      const timeSlot = session.time_slot || 'TBA';
      return {
        id: `${session.id}-${session.time_slot || 'unscheduled'}-${session.type}`,
        type: 'schedule',
        title: `${sessionType} Scheduled`,
        message: `${sessionType} "${sessionCode}" at ${timeSlot}`,
        sessionData: session,
        timestamp: new Date()
      };
    });
  }

  async emitScheduleSnapshot(teacherInfo) {
    try {
      const notifications = await this.buildScheduleNotifications(teacherInfo);
      this.notify({
        id: `schedule-snapshot-${Date.now()}`,
        type: 'schedule_snapshot',
        notifications,
        timestamp: new Date()
      });
      return notifications;
    } catch (error) {
      console.error('Failed to emit schedule snapshot:', error);
      return [];
    }
  }
}

export const teacherNotificationService = new TeacherNotificationService();
