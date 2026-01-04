import React from 'react'
import './ToggleSwitch.css'

function ToggleSwitch({ viewMode, setViewMode }) {
  return (
    <div className="toggle-container">
      <button
        className={`toggle-option ${viewMode === 'expenses' ? 'active' : ''}`}
        onClick={() => setViewMode('expenses')}
      >
        Expenses
      </button>
      <button
        className={`toggle-option ${viewMode === 'income' ? 'active' : ''}`}
        onClick={() => setViewMode('income')}
      >
        Income
      </button>
      <button
        className={`toggle-option ${viewMode === 'credits' ? 'active' : ''}`}
        onClick={() => setViewMode('credits')}
      >
        Credits
      </button>
      <button
        className={`toggle-option ${viewMode === 'notes' ? 'active' : ''}`}
        onClick={() => setViewMode('notes')}
      >
        Notes
      </button>
    </div>
  )
}

export default ToggleSwitch

