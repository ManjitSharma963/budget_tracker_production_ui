import React from 'react'
import './LoadingSkeleton.css'

function LoadingSkeleton({ type = 'list', count = 3 }) {
  if (type === 'list') {
    return (
      <div className="skeleton-container">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-item">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
            </div>
            <div className="skeleton-amount"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className="skeleton-container skeleton-cards">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-line skeleton-card-title"></div>
            <div className="skeleton-line skeleton-card-subtitle"></div>
            <div className="skeleton-line skeleton-card-text"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className="skeleton-chart">
        <div className="skeleton-chart-bars">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="skeleton-bar" style={{ height: `${Math.random() * 60 + 40}%` }}></div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default LoadingSkeleton

