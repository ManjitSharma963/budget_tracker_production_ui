import React from 'react'
import './EmptyState.css'

function EmptyState({ 
  icon = '📝', 
  title, 
  description, 
  tips = [], 
  actions = [],
  showSampleData = false,
  onLoadSampleData
}) {
  return (
    <div className="empty-state-enhanced">
      <div className="empty-state-content-enhanced">
        <div className="empty-icon-animated">{icon}</div>
        <h2 className="empty-title">{title}</h2>
        <p className="empty-description">{description}</p>
        
        {tips.length > 0 && (
          <div className="empty-tips-enhanced">
            <h3 className="tips-title">💡 Quick Tips</h3>
            {tips.map((tip, index) => (
              <div key={index} className="tip-card">
                {tip}
              </div>
            ))}
          </div>
        )}

        {actions.length > 0 && (
          <div className="empty-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`action-btn ${action.primary ? 'primary' : 'secondary'}`}
                onClick={action.onClick}
              >
                {action.icon && <span className="action-icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {showSampleData && onLoadSampleData && (
          <div className="sample-data-section">
            <p className="sample-data-hint">New to expense tracking?</p>
            <button className="sample-data-btn" onClick={onLoadSampleData}>
              📊 Load Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmptyState

