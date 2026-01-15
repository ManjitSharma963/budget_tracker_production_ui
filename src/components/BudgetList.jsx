import React, { useMemo, useEffect, useState } from 'react'
import PieChart from './PieChart'
import BudgetRecommendations from './BudgetRecommendations'
import './BudgetList.css'

function BudgetList({ budgets, expenses, monthlyIncome, onAddClick, onEdit, onDelete, onAlert, onApplyRecommendation }) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter current month expenses
  const currentMonthExpenses = expenses.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  // Calculate spending by category
  const spendingByCategory = currentMonthExpenses.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += expense.amount
    return acc
  }, {})

  // Calculate budget progress with alert status
  const budgetProgress = budgets.map(budget => {
    const spent = spendingByCategory[budget.category] || 0
    const budgetAmount = budget.amount || 0
    const remaining = budgetAmount - spent
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
    const isOverBudget = spent > budgetAmount
    const isNearLimit = percentage >= 80 && percentage < 100
    const isApproaching = percentage >= 60 && percentage < 80

    // Determine status for visual indicators
    let status = 'safe' // green
    if (isOverBudget) {
      status = 'over' // red
    } else if (isNearLimit) {
      status = 'warning' // yellow/orange
    } else if (isApproaching) {
      status = 'approaching' // light yellow
    }

    return {
      ...budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      isOverBudget,
      isNearLimit,
      isApproaching,
      status
    }
  })

  // Track which alerts have been shown to avoid duplicates
  const [shownAlerts, setShownAlerts] = useState(new Set())

  // Check for alerts and notify parent component
  useEffect(() => {
    if (!onAlert) return

    const newAlerts = new Set()
    
    budgetProgress.forEach(budget => {
      const alertKey = `${budget.id}-${budget.status}`
      
      // Only show alert if status changed or it's a critical alert
      if (budget.isOverBudget) {
        if (!shownAlerts.has(alertKey)) {
          onAlert({
            type: 'error',
            message: `⚠️ Over Budget: ${budget.category} exceeded by ${formatCurrency(Math.abs(budget.remaining))}`,
            category: budget.category
          })
          newAlerts.add(alertKey)
        }
      } else if (budget.isNearLimit && budget.percentage >= 80) {
        if (!shownAlerts.has(alertKey)) {
          onAlert({
            type: 'warning',
            message: `⚠️ Budget Alert: ${budget.category} is ${budget.percentage.toFixed(1)}% spent (${formatCurrency(budget.remaining)} remaining)`,
            category: budget.category
          })
          newAlerts.add(alertKey)
        }
      } else if (budget.isApproaching && budget.percentage >= 60 && budget.percentage < 80) {
        // Only show approaching alert once per session
        if (!shownAlerts.has(alertKey)) {
          onAlert({
            type: 'info',
            message: `ℹ️ Approaching Limit: ${budget.category} is ${budget.percentage.toFixed(1)}% spent`,
            category: budget.category
          })
          newAlerts.add(alertKey)
        }
      }
      
      // Keep track of all current alerts
      if (budget.status !== 'safe') {
        newAlerts.add(alertKey)
      }
    })
    
    // Update shown alerts
    setShownAlerts(newAlerts)
  }, [budgetProgress, onAlert, shownAlerts])

  // Calculate budget distribution for pie chart
  const budgetChartData = useMemo(() => {
    if (monthlyIncome <= 0) return null

    // Calculate total budgeted amount
    const totalBudgeted = budgets.reduce((sum, budget) => {
      return sum + (budget.amount || 0)
    }, 0)

    // Calculate remaining income
    const remaining = monthlyIncome - totalBudgeted

    // Create chart data with budget categories
    const chartData = budgets
      .filter(budget => budget.amount > 0)
      .map(budget => ({
        name: budget.category,
        value: budget.amount
      }))

    // Add remaining income as a segment if there's any left
    if (remaining > 0) {
      chartData.push({
        name: 'Remaining',
        value: remaining
      })
    }

    return {
      data: chartData,
      total: monthlyIncome,
      totalBudgeted,
      remaining
    }
  }, [budgets, monthlyIncome])

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  if (budgets.length === 0) {
    return (
      <div className="budget-list-container">
        <div className="budget-header">
          <h2>Budget Planning</h2>
          <button className="btn-add-budget" onClick={onAddClick}>
            + Add Budget
          </button>
        </div>
        <div className="empty-budgets">
          <div className="empty-icon">💰</div>
          <p>No budgets set</p>
          <p className="empty-hint">Create a budget to track your spending</p>
          <button className="btn-primary" onClick={onAddClick}>
            Create Your First Budget
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="budget-list-container">
      <div className="budget-header">
        <h2>Budget Planning</h2>
        <button className="btn-add-budget" onClick={onAddClick}>
          + Add Budget
        </button>
      </div>

      {/* Budget Distribution Pie Chart */}
      {budgetChartData && budgetChartData.data.length > 0 && monthlyIncome > 0 && (
        <div className="budget-chart-section">
          <div className="budget-chart-header">
            <h3>Budget Distribution</h3>
            <div className="budget-summary">
              <div className="summary-item">
                <span className="summary-label">Total Income:</span>
                <span className="summary-value income">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Budgeted:</span>
                <span className="summary-value budgeted">{formatCurrency(budgetChartData.totalBudgeted)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Remaining:</span>
                <span className={`summary-value ${budgetChartData.remaining >= 0 ? 'remaining' : 'over-budget'}`}>
                  {formatCurrency(budgetChartData.remaining)}
                </span>
              </div>
            </div>
          </div>
          <PieChart 
            total={monthlyIncome} 
            data={budgetChartData.data}
          />
        </div>
      )}

      <div className="budgets-grid">
        {budgetProgress.map(budget => (
          <div key={budget.id} className={`budget-card budget-card-${budget.status}`}>
            <div className="budget-card-header">
              <div className="budget-category-name">
                {budget.category}
                {budget.status === 'over' && <span className="status-badge status-over">OVER</span>}
                {budget.status === 'warning' && <span className="status-badge status-warning">WARNING</span>}
                {budget.status === 'approaching' && <span className="status-badge status-approaching">APPROACHING</span>}
                {budget.status === 'safe' && <span className="status-badge status-safe">SAFE</span>}
              </div>
              <div className="budget-card-actions">
                <button 
                  className="icon-btn" 
                  onClick={() => onEdit(budget)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  className="icon-btn" 
                  onClick={() => onDelete(budget.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="budget-amounts">
              <div className="budget-spent">
                <span className="label">Spent:</span>
                <span className={`value ${budget.isOverBudget ? 'over-budget' : ''}`}>
                  {formatCurrency(budget.spent)}
                </span>
              </div>
              <div className="budget-limit">
                <span className="label">Budget:</span>
                <span className="value">
                  {budget.budgetType === 'percentage' 
                    ? `${budget.percentage}%` 
                    : formatCurrency(budget.amount)
                  }
                </span>
                {budget.budgetType === 'percentage' && (
                  <span className="calculated">({formatCurrency(budget.amount)})</span>
                )}
              </div>
              <div className="budget-remaining">
                <span className="label">Remaining:</span>
                <span className={`value ${budget.remaining < 0 ? 'over-budget' : 'under-budget'}`}>
                  {formatCurrency(budget.remaining)}
                </span>
              </div>
            </div>

            <div className="budget-progress-bar-container">
              <div 
                className={`budget-progress-bar budget-progress-${budget.status}`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              >
                <span className="progress-text">
                  {budget.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {budget.isOverBudget && (
              <div className="budget-warning budget-warning-over">
                ⚠️ Over budget by {formatCurrency(Math.abs(budget.remaining))}
              </div>
            )}
            {budget.isNearLimit && !budget.isOverBudget && (
              <div className="budget-warning budget-warning-near">
                ⚠️ {budget.percentage.toFixed(1)}% spent - {formatCurrency(budget.remaining)} remaining
              </div>
            )}
            {budget.isApproaching && !budget.isNearLimit && (
              <div className="budget-warning budget-warning-approaching">
                ℹ️ Approaching limit - {formatCurrency(budget.remaining)} remaining
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BudgetList

