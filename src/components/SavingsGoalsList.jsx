import React from 'react'
import './SavingsGoalsList.css'

function SavingsGoalsList({ goals, totalSavings, onAddClick, onEdit, onDelete, onUpdateAmount }) {
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  const calculateProgress = (goal) => {
    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
    return Math.min(percentage, 100)
  }

  const isGoalReached = (goal) => {
    return goal.currentAmount >= goal.targetAmount
  }

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (goals.length === 0) {
    return (
      <div className="savings-goals-container">
        <div className="goals-header">
          <h2>Savings Goals</h2>
          <button className="btn-add-goal" onClick={onAddClick}>
            + Add Goal
          </button>
        </div>
        <div className="empty-goals">
          <div className="empty-icon">🎯</div>
          <p>No savings goals set</p>
          <p className="empty-hint">Create a goal to track your savings progress</p>
          <button className="btn-primary" onClick={onAddClick}>
            Create Your First Goal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="savings-goals-container">
      <div className="goals-header">
        <h2>Savings Goals</h2>
        <button className="btn-add-goal" onClick={onAddClick}>
          + Add Goal
        </button>
      </div>

      {/* Total Savings Summary */}
      <div className="total-savings-card">
        <div className="total-savings-label">Total Saved</div>
        <div className="total-savings-amount">{formatCurrency(totalSavings)}</div>
      </div>

      <div className="goals-grid">
        {goals.map(goal => {
          const progress = calculateProgress(goal)
          const isReached = isGoalReached(goal)
          const daysRemaining = getDaysRemaining(goal.targetDate)

          return (
            <div key={goal.id} className={`goal-card ${isReached ? 'goal-reached' : ''}`}>
              <div className="goal-card-header">
                <div className="goal-name">{goal.name}</div>
                {isReached && <span className="goal-badge goal-complete">🎉 COMPLETE</span>}
                <div className="goal-actions">
                  <button 
                    className="icon-btn" 
                    onClick={() => onEdit(goal)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="icon-btn" 
                    onClick={() => onDelete(goal.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {goal.description && (
                <div className="goal-description">{goal.description}</div>
              )}

              <div className="goal-amounts">
                <div className="goal-current">
                  <span className="label">Saved:</span>
                  <span className="value">{formatCurrency(goal.currentAmount)}</span>
                </div>
                <div className="goal-target">
                  <span className="label">Target:</span>
                  <span className="value">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="goal-remaining">
                  <span className="label">Remaining:</span>
                  <span className={`value ${goal.targetAmount - goal.currentAmount > 0 ? 'remaining' : 'complete'}`}>
                    {formatCurrency(goal.targetAmount - goal.currentAmount)}
                  </span>
                </div>
              </div>

              <div className="goal-progress-container">
                <div 
                  className={`goal-progress-bar ${isReached ? 'complete' : ''}`}
                  style={{ width: `${progress}%` }}
                >
                  <span className="progress-text">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>

              {goal.targetDate && (
                <div className="goal-date-info">
                  <span className="date-label">Target Date:</span>
                  <span className="date-value">{new Date(goal.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {daysRemaining !== null && (
                    <span className={`days-remaining ${daysRemaining < 0 ? 'overdue' : daysRemaining < 30 ? 'urgent' : ''}`}>
                      {daysRemaining < 0 
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : `${daysRemaining} days remaining`
                      }
                    </span>
                  )}
                </div>
              )}

              {/* Quick Add Amount */}
              <div className="goal-quick-add">
                <input
                  type="number"
                  placeholder="Add amount..."
                  className="quick-add-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const amount = parseFloat(e.target.value)
                      if (amount > 0) {
                        onUpdateAmount(goal.id, goal.currentAmount + amount)
                        e.target.value = ''
                      }
                    }
                  }}
                />
                <button
                  className="quick-add-btn"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling
                    const amount = parseFloat(input.value)
                    if (amount > 0) {
                      onUpdateAmount(goal.id, goal.currentAmount + amount)
                      input.value = ''
                    }
                  }}
                >
                  + Add
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SavingsGoalsList

