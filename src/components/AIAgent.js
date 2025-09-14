// src/components/AIAgent.js
import React, { useState, useEffect, useCallback } from 'react';

const AIAgent = ({ onOptimize, onAnalyze, timetable, systemData, user }) => {
  // Removed unused suggestions state
  const [isThinking, setIsThinking] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('suggestions');

  // Analyze the current timetable for issues and optimization opportunities

  const analyzeTimetable = useCallback(() => {
    if (!timetable || timetable.length === 0) {
      return {
        conflicts: [],
        underutilized: [],
        overloaded: [],
        suggestions: ["No timetable data available for analysis"]
      };
    }

    const conflicts = findSchedulingConflicts(timetable);
    const underutilized = findUnderutilizedResources(timetable);
    const overloaded = findOverloadedTeachers(timetable);
    
    const suggestions = generateSuggestions(conflicts, underutilized, overloaded);
    
    return { conflicts, underutilized, overloaded, suggestions };
  }, [timetable]);

  // Find scheduling conflicts (same teacher/room at same time)
  const findSchedulingConflicts = (timetableData) => {
    const conflicts = [];
    
    // This would be more complex in a real implementation
    // For demo purposes, we'll simulate some conflicts
    if (timetableData.length > 0) {
      conflicts.push({
        type: 'teacher',
        message: 'Dr. Smith scheduled for two classes at 9:00 on Monday',
        details: 'CS101 (Room A12) and MATH101 (Room B5) at the same time'
      });
      
      conflicts.push({
        type: 'room',
        message: 'Room B5 double-booked at 10:00 on Tuesday',
        details: 'PHY101 (Dr. Patel) and CHEM101 (Dr. Wilson) scheduled simultaneously'
      });
    }
    
    return conflicts;
  };

  // Find underutilized resources (rooms, teachers)
  const findUnderutilizedResources = (timetableData) => {
    const underutilized = [];
    
    // Simulated underutilization findings
    underutilized.push({
      type: 'room',
      message: 'Lab 3 only utilized 25% of available time',
      details: 'Consider adding more lab sessions or using for other activities'
    });
    
    underutilized.push({
      type: 'teacher',
      message: 'Dr. Garcia has only 10 teaching hours this week',
      details: 'Could take on additional classes or responsibilities'
    });
    
    return underutilized;
  };

  // Find teachers with excessive workload
  const findOverloadedTeachers = (timetableData) => {
    const overloaded = [];
    
    // Simulated overload findings
    overloaded.push({
      teacher: 'Dr. Smith',
      message: 'Scheduled for 22 hours this week (recommended max: 18)',
      details: 'Consider redistributing some classes to other faculty'
    });
    
    return overloaded;
  };

  // Generate actionable suggestions based on analysis
  const generateSuggestions = (conflicts, underutilized, overloaded) => {
    const suggestions = [];
    
    if (conflicts.length > 0) {
      suggestions.push("Resolve scheduling conflicts to avoid double-bookings");
    }
    
    if (underutilized.length > 0) {
      suggestions.push("Better utilize underused resources to improve efficiency");
    }
    
    if (overloaded.length > 0) {
      suggestions.push("Balance teacher workload to prevent burnout");
    }
    
    // Add some general suggestions
    suggestions.push("Consider moving MATH101 from Room A12 to Room B5 to reduce walking distance");
    suggestions.push("Schedule lab sessions in the afternoon when students are more available");
    suggestions.push("Create buffer times between classes for teacher preparation");
    
    return suggestions;
  };

  const handleAnalyze = async () => {
    setIsThinking(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const results = analyzeTimetable();
      setAnalysisResults(results);
      setIsThinking(false);
      
      if (onAnalyze) {
        onAnalyze(results);
      }
    }, 2000);
  };

  const handleOptimize = async () => {
    setIsThinking(true);
    
    // Simulate AI optimization processing
    setTimeout(() => {
      if (onOptimize) {
        onOptimize();
      }
      setIsThinking(false);
      
      // Show optimization results
      setAnalysisResults({
        conflicts: [],
        underutilized: [],
        overloaded: [],
        suggestions: [
          "Timetable optimized successfully!",
          "Reduced teacher conflicts by 75%",
          "Improved room utilization from 65% to 82%",
          "Balanced workload across all faculty members"
        ]
      });
    }, 2000);
  };

  // Auto-analyze when timetable changes
  useEffect(() => {
    if (timetable && timetable.length > 0) {
      const results = analyzeTimetable();
      setAnalysisResults(results);
    }
  }, [timetable, analyzeTimetable]);

  return (
    <div className="ai-agent">
      <div className="ai-header">
        <div className="ai-avatar">
          <i className="fas fa-robot"></i>
        </div>
        <div className="ai-info">
          <h4>Timetable AI Assistant</h4>
          <p>I can help optimize your schedule and identify issues</p>
        </div>
      </div>

      <div className="ai-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleAnalyze}
          disabled={isThinking}
        >
          <i className="fas fa-search"></i> Analyze Schedule
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleOptimize}
          disabled={isThinking || !timetable || timetable.length === 0}
        >
          <i className="fas fa-magic"></i> Optimize Automatically
        </button>
      </div>

      {isThinking && (
        <div className="ai-thinking">
          <i className="fas fa-spinner fa-spin"></i>
          <span>AI is analyzing your timetable...</span>
        </div>
      )}

      {analysisResults && (
        <div className="ai-results">
          <div className="results-tabs">
            <button 
              className={activeTab === 'suggestions' ? 'tab-active' : ''}
              onClick={() => setActiveTab('suggestions')}
            >
              Suggestions
            </button>
            <button 
              className={activeTab === 'conflicts' ? 'tab-active' : ''}
              onClick={() => setActiveTab('conflicts')}
            >
              Conflicts ({analysisResults.conflicts.length})
            </button>
            <button 
              className={activeTab === 'utilization' ? 'tab-active' : ''}
              onClick={() => setActiveTab('utilization')}
            >
              Utilization
            </button>
            <button 
              className={activeTab === 'workload' ? 'tab-active' : ''}
              onClick={() => setActiveTab('workload')}
            >
              Workload
            </button>
          </div>

          <div className="results-content">
            {activeTab === 'suggestions' && (
              <div className="ai-suggestions">
                <h5>AI Recommendations:</h5>
                <ul>
                  {analysisResults.suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <i className="fas fa-lightbulb"></i> {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'conflicts' && (
              <div className="conflicts-list">
                <h5>Scheduling Conflicts:</h5>
                {analysisResults.conflicts.length > 0 ? (
                  <ul>
                    {analysisResults.conflicts.map((conflict, index) => (
                      <li key={index} className="conflict-item">
                        <i className="fas fa-exclamation-triangle"></i>
                        <div>
                          <strong>{conflict.message}</strong>
                          <p>{conflict.details}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-issues">No scheduling conflicts detected!</p>
                )}
              </div>
            )}

            {activeTab === 'utilization' && (
              <div className="utilization-list">
                <h5>Resource Utilization:</h5>
                {analysisResults.underutilized.length > 0 ? (
                  <ul>
                    {analysisResults.underutilized.map((item, index) => (
                      <li key={index} className="utilization-item">
                        <i className="fas fa-info-circle"></i>
                        <div>
                          <strong>{item.message}</strong>
                          <p>{item.details}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-issues">All resources properly utilized!</p>
                )}
              </div>
            )}

            {activeTab === 'workload' && (
              <div className="workload-list">
                <h5>Teacher Workload:</h5>
                {analysisResults.overloaded.length > 0 ? (
                  <ul>
                    {analysisResults.overloaded.map((item, index) => (
                      <li key={index} className="workload-item">
                        <i className="fas fa-user-clock"></i>
                        <div>
                          <strong>{item.message}</strong>
                          <p>{item.details}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-issues">Teacher workload is well balanced!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgent;