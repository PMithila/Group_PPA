// Teacher Notification Service
import { getClasses } from '../api';

export class TeacherNotificationService {
  constructor() {
    this.checkInterval = null;
    this.notificationCallbacks = [];
    this.lastCheckedClasses = new Set();
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  notify(notification) {
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  // Check for upcoming classes for a specific teacher
  async checkUpcomingClasses(teacherName, checkMinutes = 15) {
    try {
      const classes = await getClasses();
      const now = new Date();
      const checkTime = new Date(now.getTime() + (checkMinutes * 60 * 1000));
      
      const upcomingClasses = classes.filter(cls => {
        if (!cls.teacher || cls.teacher !== teacherName || !cls.day || !cls.time_slot) {
          return false;
        }

        // Check if class is today
        const today = now.toLocaleDateString('en-US', { weekday: 'long' });
        if (cls.day !== today) {
          return false;
        }

        // Parse time slot to check if it's within the notification window
        const classTime = this.parseTimeSlot(cls.time_slot);
        if (!classTime) {
          return false;
        }

        const classDateTime = new Date();
        classDateTime.setHours(classTime.hours, classTime.minutes, 0, 0);

        // Check if class is within the notification window
        return classDateTime >= now && classDateTime <= checkTime;
      });

      return upcomingClasses;
    } catch (error) {
      console.error('Error checking upcoming classes:', error);
      return [];
    }
  }

  // Parse time slot string to hours and minutes
  parseTimeSlot(timeSlot) {
    const timeMapping = {
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

  // Start monitoring for upcoming classes
  startMonitoring(teacherName, checkIntervalMinutes = 5, notificationMinutes = 15) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      const upcomingClasses = await this.checkUpcomingClasses(teacherName, notificationMinutes);
      
      upcomingClasses.forEach(cls => {
        const classId = `${cls.id}-${cls.time_slot}`;
        
        // Only notify if we haven't already notified for this class
        if (!this.lastCheckedClasses.has(classId)) {
          this.lastCheckedClasses.add(classId);
          
          const classTime = this.parseTimeSlot(cls.time_slot);
          const classDateTime = new Date();
          classDateTime.setHours(classTime.hours, classTime.minutes, 0, 0);
          
          const timeUntilClass = Math.round((classDateTime - new Date()) / (1000 * 60));
          
          this.notify({
            id: classId,
            type: 'class_reminder',
            title: 'Upcoming Class',
            message: `You have ${cls.code} - ${cls.name} in ${timeUntilClass} minutes at ${cls.room || 'TBA'}`,
            classData: cls,
            timeUntilClass,
            timestamp: new Date()
          });
        }
      });
    }, checkIntervalMinutes * 60 * 1000);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.lastCheckedClasses.clear();
  }

  // Get today's classes for a teacher
  async getTodaysClasses(teacherName) {
    try {
      const classes = await getClasses();
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      return classes.filter(cls => 
        cls.teacher === teacherName && cls.day === today
      ).sort((a, b) => {
        const timeA = this.parseTimeSlot(a.time_slot);
        const timeB = this.parseTimeSlot(b.time_slot);
        if (!timeA || !timeB) return 0;
        return (timeA.hours * 60 + timeA.minutes) - (timeB.hours * 60 + timeB.minutes);
      });
    } catch (error) {
      console.error('Error fetching today\'s classes:', error);
      return [];
    }
  }

  // Check for class conflicts or issues
  async checkClassConflicts(teacherName) {
    try {
      const classes = await getClasses();
      const teacherClasses = classes.filter(cls => cls.teacher === teacherName);
      
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
}

// Create singleton instance
export const teacherNotificationService = new TeacherNotificationService();
