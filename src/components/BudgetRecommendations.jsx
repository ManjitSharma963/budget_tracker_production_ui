import React, { useMemo } from 'react'
import './BudgetRecommendations.css'

function BudgetRecommendations({ expenses, income, existingBudgets, onApplyRecommendation }) {
  const recommendations = useMemo(() => {
    if (!expenses || expenses.length === 0) return []

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get last 3 months of expenses
    const last3Months = expenses.filter(exp => {
      const date = new Date(exp.date)
      const monthsDiff = (currentYear - date.getFullYear()) * 12 + (currentMonth - date.getMonth())
      return monthsDiff >= 0 && monthsDiff < 3
    })

    if (last3Months.length === 0) return []

    // Calculate average spending per category
    const categorySpending = {}
    last3Months.forEach(exp => {
      const category = exp.category || 'Others'
      if (!categorySpending[category]) {
        categorySpending[category] = { total: 0, count: 0 }
      }
      categorySpending[category].total += exp.amount
      categorySpending[category].count += 1
    })

    // Calculate monthly income
    const monthlyIncome = income
      .filter(inc => {
        const date = new Date(inc.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, inc) => sum + inc.amount, 0)

    // Generate recommendations
    const recs = []
    Object.entries(categorySpending).forEach(([category, data]) => {
      const avgMonthly = data.total / 3
      const existingBudget = existingBudgets?.find(b => b.category === category && b.period === 'monthly')
      
      // Skip if budget already exists
      if (existingBudget) return

      // Calculate percentage of income
      const percentageOfIncome = monthlyIncome > 0 ? (avgMonthly / monthlyIncome) * 100 : 0

      // Determine recommendation type
      let recommendation = {
        category,
        suggestedAmount: Math.ceil(avgMonthly * 1.1), // 10% buffer
        suggestedPercentage: percentageOfIncome > 0 ? Math.ceil(percentageOfIncome * 1.1) : null,
        avgSpending: avgMonthly,
        monthsData: data.count,
        type: 'based_on_spending',
        alert: null
      }

      // Add alerts
      if (percentageOfIncome > 30) {
        recommendation.alert = 'warning'
        recommendation.alertMessage = 'High spending - consider reducing'
      } else if (percentageOfIncome > 50) {
        recommendation.alert = 'critical'
        recommendation.alertMessage = 'Very high spending - urgent review needed'
      } else if (percentageOfIncome < 5 && avgMonthly > 1000) {
        recommendation.alert = 'info'
        recommendation.alertMessage = 'Low percentage but significant amount'
      }

      // Suggest percentage if income is available
      if (monthlyIncome > 0 && percentageOfIncome > 0 && percentageOfIncome <= 100) {
        recommendation.budgetType = 'percentage'
        recommendation.suggestedPercentage = Math.ceil(percentageOfIncome * 1.1)
      } else {
        recommendation.budgetType = 'fixed'
      }

      recs.push(recommendation)
    })

    // Sort by average spending (highest first)
    return recs.sort((a, b) => b.avgSpending - a.avgSpending)
  }, [expenses, income, existingBudgets])

  if (recommendations.length === 0) {
    return (
      <div className="budget-recommendations">
        <h3 className="recommendations-title">💡 Budget Recommendations</h3>
        <div className="no-recommendations">
          <p>Not enough spending data to generate recommendations.</p>
          <p className="hint">Add more expenses to get smart budget suggestions!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="budget-recommendations">
      <h3 className="recommendations-title">💡 Budget Recommendations</h3>
      <p className="recommendations-subtitle">
        Based on your spending patterns over the last 3 months
      </p>
      
      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`recommendation-card ${rec.alert || ''}`}>
            <div className="recommendation-header">
              <div className="category-name">{rec.category}</div>
              {rec.alert && (
                <span className={`alert-badge ${rec.alert}`}>
                  {rec.alert === 'warning' ? '⚠️' : rec.alert === 'critical' ? '🚨' : 'ℹ️'}
                  {rec.alertMessage}
                </span>
              )}
            </div>
            
            <div className="recommendation-stats">
              <div className="stat-item">
                <span className="stat-label">Avg Monthly:</span>
                <span className="stat-value">₹{rec.avgSpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Suggested:</span>
                <span className="stat-value suggested">
                  {rec.budgetType === 'percentage' 
                    ? `${rec.suggestedPercentage}% of income`
                    : `₹${rec.suggestedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  }
                </span>
              </div>
            </div>

            {rec.suggestedPercentage && rec.budgetType === 'percentage' && (() => {
              const currentMonthIncome = income && Array.isArray(income) ? income.reduce((sum, inc) => {
                const date = new Date(inc.date)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() 
                  ? sum + (inc.amount || 0)
                  : sum
              }, 0) : 0
              const calculatedAmount = Math.ceil((rec.suggestedPercentage / 100) * currentMonthIncome)
              return (
                <div className="percentage-info">
                  ≈ ₹{calculatedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              )
            })()}

            <button
              className="apply-recommendation-btn"
              onClick={() => onApplyRecommendation(rec)}
            >
              ✓ Apply Recommendation
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BudgetRecommendations

