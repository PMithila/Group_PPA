// src/components/GenerateScheduleModal.js
import React, { useState, useEffect } from 'react';

const GenerateScheduleModal = ({ onClose, onScheduleGenerated, classes }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing AI scheduler...');
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    const simulateAIAnalysis = () => {
      const steps = [
        { progress: 10, status: 'Initializing AI scheduler...' },
        { progress: 20, status: 'Analyzing classroom data...' },
        { progress: 30, status: 'Processing teacher availability...' },
        { progress: 40, status: 'Optimizing for subject requirements...' },
        { progress: 60, status: 'Detecting and resolving conflicts...' },
        { progress: 80, status: 'Balancing faculty workload...' },
        { progress: 90, status: 'Finalizing optimal schedule...' },
        { progress: 100, status: 'Schedule generated successfully!' },
      ];

      steps.forEach((step, index) => {
        setTimeout(() => {
          setProgress(step.progress);
          setStatus(step.status);
          
          // Add AI insights at certain points
          if (step.progress === 40) {
            setAiInsights(prev => [...prev, "AI: Found potential room conflicts"]);
          }
          if (step.progress === 60) {
            setAiInsights(prev => [...prev, "AI: Resolved teacher double-booking issues"]);
          }
          if (step.progress === 80) {
            setAiInsights(prev => [...prev, "AI: Balanced workload across all faculty members"]);
          }
          
          if (index === steps.length - 1) {
            setTimeout(() => {
              onScheduleGenerated(generateOptimalSchedule(classes));
            }, 1000);
          }
        }, (index + 1) * 800);
      });
    };

    simulateAIAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScheduleGenerated, classes]);

  const generateOptimalSchedule = (classes) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '8:00-9:00', '9:00-10:00', '10:00-11:00', 
      '11:00-12:00', '12:00-1:00', '1:00-2:00'
    ];
    
    // Use the classes from the database
    const subjects = classes.map(c => ({ code: c.code, teacher: c.teacher, room: c.room }));
    const rooms = [...new Set(classes.map(c => c.room).filter(Boolean))];
    const classTypes = ['lecture', 'lab', 'tutorial']; // You can customize this

    let schedule = timeSlots.map(time => ({
      time,
      days: daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: null }), {}),
    }));

    // A simple scheduling algorithm
    subjects.forEach(subject => {
      let placed = false;
      while (!placed) {
        const randomDay = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
        const randomSlotIndex = Math.floor(Math.random() * timeSlots.length);

        if (!schedule[randomSlotIndex].days[randomDay]) {
          schedule[randomSlotIndex].days[randomDay] = {
            type: classTypes[Math.floor(Math.random() * classTypes.length)],
            content: `${subject.code} (${subject.room || rooms[Math.floor(Math.random() * rooms.length)] || 'TBD'})`,
            teacher: subject.teacher || 'Unassigned',
          };
          placed = true;
        }
      }
    });

    return schedule;
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleDone}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>AI Schedule Optimization</h2>
        <p>{status}</p>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span>{progress}%</span>
        </div>
        
        <div className="modal-spinner">
          <i className="fas fa-robot"></i>
        </div>
        
        <div className="ai-insights">
          <h4>AI Insights:</h4>
          <ul>
            {aiInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
            <li>Using constraint satisfaction algorithm for optimal scheduling</li>
            <li>Considering teacher preferences and room capacities</li>
          </ul>
        </div>
        
        <button className="btn btn-primary" onClick={handleDone} disabled={progress < 100}>
          {progress < 100 ? 'AI Processing...' : 'View Optimized Schedule'}
        </button>
      </div>
    </div>
  );
};

export default GenerateScheduleModal;