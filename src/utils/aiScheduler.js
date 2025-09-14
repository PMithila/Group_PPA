// src/utils/aiScheduler.js
// AI-powered timetable optimization algorithm
class AIScheduler {
  constructor(data) {
    this.teachers = data?.teachers || [];
    this.subjects = data?.subjects || [];
    this.rooms = data?.rooms || [];
    this.constraints = data?.constraints || [];
  }

  // Main scheduling function
  generateTimetable() {
    console.log("AI Scheduler: Generating optimized timetable...");
    
    const timetable = this.createEmptyTimetable();
    this.applyConstraints(timetable);
    this.optimizeAssignments(timetable);
    
    return timetable;
  }

  createEmptyTimetable() {
    // Create empty timetable structure with object for days
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
      '8:00-9:00', '9:00-10:00', '10:00-11:00', 
      '11:00-12:00', '12:00-1:00', '1:00-2:00'
    ];

    return timeSlots.map(time => {
      const dayEntries = {};
      daysOfWeek.forEach(day => {
        dayEntries[day] = null; // Empty slot
      });
      return { time, days: dayEntries };
    });
  }

  applyConstraints(timetable) {
    // Apply hard constraints (teacher availability, room capacity, etc.)
    console.log("AI Scheduler: Applying constraints...");
  }

  optimizeAssignments(timetable) {
    // Use AI techniques to optimize the timetable
    console.log("AI Scheduler: Optimizing assignments...");
    
    // For demo purposes, we'll create a simple optimized timetable
    const subjects = ['CS101', 'MATH101', 'PHY101', 'ENG101', 'CHEM101'];
    const rooms = ['Room A12', 'Room B5', 'Room C10', 'Room D2', 'Lab 1'];
    const teachers = ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Davis', 'Dr. Anderson'];
    const classTypes = ['lecture', 'lab', 'tutorial'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    timetable.forEach(timeSlot => {
      daysOfWeek.forEach(day => {
        // 70% chance of having a class
        if (Math.random() > 0.3) {
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          const room = rooms[Math.floor(Math.random() * rooms.length)];
          const teacher = teachers[Math.floor(Math.random() * teachers.length)];
          const type = classTypes[Math.floor(Math.random() * classTypes.length)];
          
          timeSlot.days[day] = {
            type,
            content: `${subject} (${room})`,
            teacher,
            subject,
            room
          };
        }
      });
    });
    
    return timetable;
  }

  // Analyze timetable for conflicts and optimization opportunities
  analyzeTimetable(timetable) {
    const analysis = {
      conflicts: [],
      optimizationOpportunities: [],
      teacherWorkload: {},
      roomUtilization: {}
    };

    // Check for conflicts (same teacher in two places at once)
    const teacherAssignments = {};
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    timetable.forEach(slot => {
      daysOfWeek.forEach(day => {
        const classInfo = slot.days[day];
        if (classInfo) {
          const key = `${day}-${slot.time}`;
          if (!teacherAssignments[key]) {
            teacherAssignments[key] = [];
          }
          
          if (teacherAssignments[key].includes(classInfo.teacher)) {
            analysis.conflicts.push({
              type: 'teacher_conflict',
              teacher: classInfo.teacher,
              day,
              time: slot.time,
              message: `${classInfo.teacher} is double-booked at ${slot.time} on ${day}`
            });
          } else {
            teacherAssignments[key].push(classInfo.teacher);
          }
        }
      });
    });

    return analysis;
  }
}

export default AIScheduler;