// src/components/PredictiveAnalytics.js
import React from 'react';

const PredictiveAnalytics = ({ data = {} }) => {
  const forecast = data.nextWeekForecast || {
    expectedConflicts: 2,
    utilization: 78,
    teacherSatisfaction: 92
  };

  const trends = data.trends || {
    conflictReduction: -35,
    utilizationImprovement: +12,
    efficiencyGain: +18
  };

  const getTrendIcon = (value) => {
    return value >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  };

  const getTrendColor = (value) => {
    return value >= 0 ? 'green' : 'red';
  };

  return (
    <div className="predictive-analytics card">
      <div className="card-header">
        <h3>Predictive Analytics</h3>
        <i className="fas fa-chart-line"></i>
      </div>
      <div className="card-body">
        <div className="forecast-section">
          <h4>Next Week Forecast</h4>
          <div className="forecast-items">
            <div className="forecast-item">
              <span className="label">Expected Conflicts:</span>
              <span className="value">{forecast.expectedConflicts}</span>
            </div>
            <div className="forecast-item">
              <span className="label">Room Utilization:</span>
              <span className="value">{forecast.utilization}%</span>
            </div>
            <div className="forecast-item">
              <span className="label">Teacher Satisfaction:</span>
              <span className="value">{forecast.teacherSatisfaction}%</span>
            </div>
          </div>
        </div>

        <div className="trends-section">
          <h4>Performance Trends</h4>
          <div className="trend-items">
            <div className="trend-item">
              <span className="label">Conflict Reduction:</span>
              <span className={`value ${getTrendColor(trends.conflictReduction)}`}>
                <i className={`fas ${getTrendIcon(trends.conflictReduction)}`}></i>
                {Math.abs(trends.conflictReduction)}%
              </span>
            </div>
            <div className="trend-item">
              <span className="label">Utilization Improvement:</span>
              <span className={`value ${getTrendColor(trends.utilizationImprovement)}`}>
                <i className={`fas ${getTrendIcon(trends.utilizationImprovement)}`}></i>
                {Math.abs(trends.utilizationImprovement)}%
              </span>
            </div>
            <div className="trend-item">
              <span className="label">Efficiency Gain:</span>
              <span className={`value ${getTrendColor(trends.efficiencyGain)}`}>
                <i className={`fas ${getTrendIcon(trends.efficiencyGain)}`}></i>
                {Math.abs(trends.efficiencyGain)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;