// src/services/timetableService.js
// Mock service functions for demonstration
export const getTimetable = async (view, user) => {
  // Simulate API call delay
  return new Promise(resolve => {
    setTimeout(() => {
      // Return sample data based on view
      const sampleData = [
        {
          time: '8:00-9:00',
          days: {
            Monday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
            Tuesday: null,
            Wednesday: { type: 'lab', content: 'Physics Lab (Lab 3)', teacher: 'Dr. Johnson' },
            Thursday: null,
            Friday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
            Saturday: null,
            Sunday: null
          }
        },
        {
          time: '9:00-10:00',
          days: {
            Monday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
            Tuesday: { type: 'lecture', content: 'PHY101 (Room C10)', teacher: 'Dr. Patel' },
            Wednesday: null,
            Thursday: { type: 'lecture', content: 'ENG101 (Room D2)', teacher: 'Dr. Brown' },
            Friday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
            Saturday: null,
            Sunday: null
          }
        }
      ];
      
      // If teacher view, filter to only show their classes
      if (view === 'teacher' && user?.name) {
        const teacherName = user.name;
        const filteredData = sampleData.map(timeSlot => {
          const filteredDays = {};
          Object.keys(timeSlot.days).forEach(day => {
            if (timeSlot.days[day] && timeSlot.days[day].teacher === teacherName) {
              filteredDays[day] = timeSlot.days[day];
            } else {
              filteredDays[day] = null;
            }
          });
          return { ...timeSlot, days: filteredDays };
        });
        resolve(filteredData);
      } else {
        resolve(sampleData);
      }
    }, 500);
  });
};

export const saveTimetable = async (timetable, user) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user?.role === 'ADMIN') {
        console.log('Timetable saved:', timetable);
        resolve({ success: true });
      } else {
        reject(new Error('Only admins can save timetables'));
      }
    }, 500);
  });
};

export const generateTimetable = async (systemData, user) => {
  // Simulate AI timetable generation
  return new Promise(resolve => {
    setTimeout(() => {
      // This would be replaced with actual algorithm in production
      const generatedTimetable = [
        {
          time: '8:00-9:00',
          days: {
            Monday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
            Tuesday: { type: 'lecture', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
            Wednesday: { type: 'lab', content: 'Physics Lab (Lab 3)', teacher: 'Dr. Johnson' },
            Thursday: { type: 'lecture', content: 'ENG101 (Room D2)', teacher: 'Dr. Brown' },
            Friday: { type: 'lecture', content: 'CS101 (Room A12)', teacher: 'Dr. Smith' },
            Saturday: null,
            Sunday: null
          }
        },
        {
          time: '9:00-10:00',
          days: {
            Monday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
            Tuesday: { type: 'lecture', content: 'PHY101 (Room C10)', teacher: 'Dr. Patel' },
            Wednesday: { type: 'lecture', content: 'BIO101 (Room A12)', teacher: 'Dr. Garcia' },
            Thursday: { type: 'lecture', content: 'ENG101 (Room D2)', teacher: 'Dr. Brown' },
            Friday: { type: 'tutorial', content: 'MATH101 (Room B5)', teacher: 'Prof. Lee' },
            Saturday: null,
            Sunday: null
          }
        }
      ];
      resolve(generatedTimetable);
    }, 1000);
  });
};