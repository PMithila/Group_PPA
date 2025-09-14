// src/components/DashboardCards.js
import React, { useState, useEffect, useCallback } from 'react';

const DashboardCards = ({ 
  timetableData = [], 
  teachers = [], 
  classrooms = [], 
  subjects = [],
  conflicts = 0,
  onCardClick 
}) => {
  const [stats, setStats] = useState({
    scheduledClasses: 0,
    labSessions: 0,
    facultyMembers: 0,
    conflictsDetected: 0,
    roomUtilization: 0,
    teacherWorkload: 0,
    aiEfficiency: 0,
    studentCapacity: 0
  });

  const [trends, setTrends] = useState({
    classes: 'up',
    conflicts: 'down',
    utilization: 'up',
    workload: 'stable',
    efficiency: 'up',
    capacity: 'up'
  });

  const [trendValues, setTrendValues] = useState({
    classes: '+0%',
    labs: '+0%',
    conflicts: 'No issues',
    utilization: '0%',
    workload: '0h',
    efficiency: '0%',
    capacity: '0%'
  });

  // Define calculation functions with useCallback
  const calculateScheduledClasses = useCallback(() => {
    if (!timetableData || timetableData.length === 0) return 0;
    
    return timetableData.reduce((total, timeSlot) => {
      const classes = Object.values(timeSlot.days || {}).filter(Boolean).length;
      return total + classes;
    }, 0);
  }, [timetableData]);

  const calculateLabSessions = useCallback(() => {
    if (!timetableData || timetableData.length === 0) return 0;
    
    return timetableData.reduce((total, timeSlot) => {
      const labSessions = Object.values(timeSlot.days || {}).filter(
        classInfo => classInfo && classInfo.type === 'lab'
      ).length;
      return total + labSessions;
    }, 0);
  }, [timetableData]);

  const calculateRoomUtilization = useCallback(() => {
    if (!timetableData || timetableData.length === 0 || !classrooms || classrooms.length === 0) return 0;
    
    const totalSlots = timetableData.length * 7;
    const usedSlots = timetableData.reduce((total, timeSlot) => {
      const used = Object.values(timeSlot.days || {}).filter(Boolean).length;
      return total + used;
    }, 0);
    
    return Math.round((usedSlots / totalSlots) * 100);
  }, [timetableData, classrooms]);

  const calculateTeacherWorkload = useCallback(() => {
    if (!timetableData || timetableData.length === 0 || !teachers || teachers.length === 0) return 0;
    
    const teacherHours = {};
    
    timetableData.forEach(timeSlot => {
      Object.values(timeSlot.days || {}).forEach(classInfo => {
        if (classInfo && classInfo.teacher) {
          teacherHours[classInfo.teacher] = (teacherHours[classInfo.teacher] || 0) + 1;
        }
      });
    });
    
    const teacherCount = Object.keys(teacherHours).length;
    const totalHours = Object.values(teacherHours).reduce((sum, hours) => sum + hours, 0);
    return teacherCount > 0 ? Math.round(totalHours / teacherCount) : 0;
  }, [timetableData, teachers]);

  const calculateAIEfficiency = useCallback(() => {
    if (!timetableData || timetableData.length === 0) return 0;
    
    const totalSlots = timetableData.length * 7;
    const optimalSlots = Math.floor(totalSlots * 0.85);
    const usedSlots = timetableData.reduce((total, timeSlot) => {
      const used = Object.values(timeSlot.days || {}).filter(Boolean).length;
      return total + used;
    }, 0);
    
    const efficiency = Math.min(100, Math.round((usedSlots / optimalSlots) * 100));
    return efficiency;
  }, [timetableData]);

  const calculateStudentCapacity = useCallback(() => {
    if (!timetableData || timetableData.length === 0 || !classrooms || classrooms.length === 0) return 0;
    
    let totalCapacity = 0;
    let usedCapacity = 0;
    
    timetableData.forEach(timeSlot => {
      Object.values(timeSlot.days || {}).forEach(classInfo => {
        if (classInfo && classInfo.content) {
          const roomMatch = classInfo.content.match(/\((.*?)\)/);
          if (roomMatch && roomMatch[1]) {
            const roomName = roomMatch[1];
            const room = classrooms.find(r => r.name === roomName);
            if (room) {
              totalCapacity += room.capacity;
              usedCapacity += Math.floor(room.capacity * 0.8); // Assume 80% attendance
            }
          }
        }
      });
    });
    
    return totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
  }, [timetableData, classrooms]);

  // Update trends function
  const updateTrends = useCallback((scheduledClasses, labSessions, roomUtilization, teacherWorkload, aiEfficiency, studentCapacity, conflictCount) => {
    // Calculate trends based on historical data (simplified)
    const classTrend = scheduledClasses > 0 ? 'up' : 'down';
    const labTrend = labSessions > 0 ? 'up' : 'down';
    const conflictTrend = conflictCount === 0 ? 'down' : 'up';
    const utilizationTrend = roomUtilization > 70 ? 'up' : roomUtilization > 40 ? 'stable' : 'down';
    const workloadTrend = teacherWorkload > 18 ? 'up' : teacherWorkload > 12 ? 'stable' : 'down';
    const efficiencyTrend = aiEfficiency > 90 ? 'up' : aiEfficiency > 70 ? 'stable' : 'down';
    const capacityTrend = studentCapacity > 80 ? 'up' : studentCapacity > 60 ? 'stable' : 'down';

    // Calculate trend values
    const classTrendValue = scheduledClasses > 0 ? `+${Math.min(99, scheduledClasses)}%` : '0%';
    const labTrendValue = labSessions > 0 ? `+${Math.min(99, labSessions)}%` : '0%';
    const conflictTrendValue = conflictCount === 0 ? 'No issues' : `${conflictCount} issues`;
    const utilizationTrendValue = `${roomUtilization}% utilization`;
    const workloadTrendValue = `${teacherWorkload}h avg`;
    const efficiencyTrendValue = `${aiEfficiency}% score`;
    const capacityTrendValue = `${studentCapacity}% filled`;

    setTrends({
      classes: classTrend,
      labs: labTrend,
      conflicts: conflictTrend,
      utilization: utilizationTrend,
      workload: workloadTrend,
      efficiency: efficiencyTrend,
      capacity: capacityTrend
    });

    setTrendValues({
      classes: classTrendValue,
      labs: labTrendValue,
      conflicts: conflictTrendValue,
      utilization: utilizationTrendValue,
      workload: workloadTrendValue,
      efficiency: efficiencyTrendValue,
      capacity: capacityTrendValue
    });
  }, []);

  // Calculate statistics with useCallback
  const calculateStatistics = useCallback(() => {
    const scheduledClasses = calculateScheduledClasses();
    const labSessions = calculateLabSessions();
    const facultyMembers = teachers.length;
    const roomUtilization = calculateRoomUtilization();
    const teacherWorkload = calculateTeacherWorkload();
    const aiEfficiency = calculateAIEfficiency();
    const studentCapacity = calculateStudentCapacity();

    setStats({
      scheduledClasses,
      labSessions,
      facultyMembers,
      conflictsDetected: conflicts,
      roomUtilization,
      teacherWorkload,
      aiEfficiency,
      studentCapacity
    });

    updateTrends(scheduledClasses, labSessions, roomUtilization, teacherWorkload, aiEfficiency, studentCapacity, conflicts);
  }, [
    calculateScheduledClasses, 
    calculateLabSessions, 
    calculateRoomUtilization, 
    calculateTeacherWorkload, 
    calculateAIEfficiency, 
    calculateStudentCapacity, 
    teachers.length, 
    conflicts, 
    updateTrends
  ]);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  const cardData = [
    { 
      id: 'classes',
      title: 'Scheduled Classes', 
      value: stats.scheduledClasses, 
      icon: 'fas fa-calendar-alt', 
      color: 'blue',
      description: 'Total classes scheduled this week',
      trend: trends.classes,
      trendValue: trendValues.classes,
      action: 'View Schedule'
    },
    { 
      id: 'labs',
      title: 'Lab Sessions', 
      value: stats.labSessions, 
      icon: 'fas fa-flask', 
      color: 'green',
      description: 'Practical laboratory sessions',
      trend: trends.labs,
      trendValue: trendValues.labs,
      action: 'View Labs'
    },
    { 
      id: 'faculty',
      title: 'Faculty Members', 
      value: stats.facultyMembers, 
      icon: 'fas fa-chalkboard-teacher', 
      color: 'purple',
      description: 'Active teaching staff',
      trend: 'stable',
      trendValue: `${stats.facultyMembers} teachers`,
      action: 'Manage Faculty'
    },
    { 
      id: 'conflicts',
      title: 'Conflicts Detected', 
      value: conflicts, 
      icon: 'fas fa-exclamation-triangle', 
      color: 'red',
      description: 'Scheduling issues identified',
      trend: trends.conflicts,
      trendValue: trendValues.conflicts,
      action: 'Resolve Now'
    },
    { 
      id: 'utilization',
      title: 'Room Utilization', 
      value: `${stats.roomUtilization}%`, 
      icon: 'fas fa-building', 
      color: 'orange',
      description: 'Classroom usage efficiency',
      trend: trends.utilization,
      trendValue: trendValues.utilization,
      action: 'Optimize'
    },
    { 
      id: 'efficiency',
      title: 'AI Efficiency', 
      value: `${stats.aiEfficiency}%`, 
      icon: 'fas fa-brain', 
      color: 'teal',
      description: 'Schedule optimization score',
      trend: trends.efficiency,
      trendValue: trendValues.efficiency,
      action: 'Analyze'
    },
    { 
      id: 'capacity',
      title: 'Student Capacity', 
      value: `${stats.studentCapacity}%`, 
      icon: 'fas fa-user-graduate', 
      color: 'indigo',
      description: 'Average classroom occupancy',
      trend: trends.capacity,
      trendValue: trendValues.capacity,
      action: 'View Analytics'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'fa-arrow-up';
      case 'down': return 'fa-arrow-down';
      default: return 'fa-minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="dashboard-cards">
      <div className="dashboard-header">
        <h2>Performance Analytics</h2>
        <p>Real-time insights and metrics from your timetable system</p>
      </div>
      
      <div className="cards-grid">
        {cardData.map((stat) => (
          <div 
            key={stat.id} 
            className={`card stat-card ${stat.color}`}
            onClick={() => onCardClick(stat.id, 'view')}
          >
            <div className="card-header">
              <div className={`icon ${stat.color}`}>
                <i className={stat.icon}></i>
              </div>
              <div className="value">
                <h3>{stat.value}</h3>
                <div className={`trend-indicator ${getTrendColor(stat.trend)}`}>
                  <i className={`fas ${getTrendIcon(stat.trend)}`}></i>
                  <span>{stat.trendValue}</span>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              <h4>{stat.title}</h4>
              <p className="description">{stat.description}</p>
            </div>
            
            <div className="card-footer">
              <button 
                className="card-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick(stat.id, stat.action.toLowerCase());
                }}
              >
                {stat.action}
              </button>
            </div>
            
            {stat.id === 'conflicts' && stat.value > 0 && (
              <div className="alert-badge">
                <i className="fas fa-exclamation"></i>
              </div>
            )}
            
            {stat.id === 'efficiency' && stat.value > 90 && (
              <div className="success-badge">
                <i className="fas fa-star"></i>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCards;