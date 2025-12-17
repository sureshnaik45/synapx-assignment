import React from 'react';

const ResultCard = ({ result }) => {
  if (!result) return null;

  // Visual cues for different routes
  const getStatusColor = (route) => {
    if (route === 'Fast-track') return '#d4edda';
    if (route === 'Investigation Flag') return '#f8d7da';
    if (route === 'Rejected') return '#e2e3e5';
    return '#fff3cd'; // Orange bg (Manual/Specialist)
  };

  const getBorderColor = (route) => {
    if (route === 'Fast-track') return '#28a745';
    if (route === 'Investigation Flag') return '#dc3545';
    if (route === 'Rejected') return '#6c757d';
    return '#ffc107';
  };

  return (
    <div className="result-section">
      <div className="status-card" style={{ 
          backgroundColor: getStatusColor(result.recommendedRoute),
          borderLeft: `6px solid ${getBorderColor(result.recommendedRoute)}`
      }}>
        <h3 style={{marginTop: 0}}>Recommendation: {result.recommendedRoute}</h3>
        <p><strong>Reasoning:</strong> {result.reasoning}</p>
      </div>

      <div className="json-container">
        <div className="json-header">Raw Extraction Data (JSON)</div>
        <pre className="json-body">
          {JSON.stringify(result.extractedFields, null, 2)}
        </pre>
        
        {result.missingFields && result.missingFields.length > 0 && (
          <div className="missing-alert">
             ⚠️ <strong>Missing Mandatory Fields:</strong> {result.missingFields.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;