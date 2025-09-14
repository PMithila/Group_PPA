// src/components/AIInsightsPanel.js
import React from 'react';

const AIInsightsPanel = ({ insights = [], onAIAction, conflicts = 0 }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'optimization': return 'fa-magic';
      case 'conflict': return 'fa-exclamation-triangle';
      case 'efficiency': return 'fa-chart-line';
      default: return 'fa-lightbulb';
    }
  };

  const getInsightColor = (impact) => {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      default: return 'blue';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="ai-insights-panel card">
        <div className="card-header">
          <h3>AI Insights</h3>
          <i className="fas fa-robot"></i>
        </div>
        <div className="card-body">
          <div className="empty-state">
            <i className="fas fa-brain"></i>
            <p>No insights yet. Generate a timetable to see AI recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-panel card">
      <div className="card-header">
        <h3>AI Insights</h3>
        <i className="fas fa-robot"></i>
      </div>
      <div className="card-body">
        <div className="insights-list">
          {insights.map((insight) => (
            <div key={insight.id} className="insight-item">
              <div className={`insight-icon ${getInsightColor(insight.impact)}`}>
                <i className={`fas ${getInsightIcon(insight.type)}`}></i>
              </div>
              <div className="insight-content">
                <p className="insight-message">{insight.message}</p>
                <p className="insight-suggestion">{insight.suggestion}</p>
                <div className="insight-meta">
                  <span className="confidence">Confidence: {Math.round(insight.confidence * 100)}%</span>
                  <span className="impact">Impact: {insight.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {conflicts > 0 && (
        <div className="card-footer">
          <button 
            className="btn btn-primary"
            onClick={() => onAIAction('resolveConflicts', { count: conflicts })}
          >
            <i className="fas fa-robot"></i> Resolve {conflicts} Conflicts
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;