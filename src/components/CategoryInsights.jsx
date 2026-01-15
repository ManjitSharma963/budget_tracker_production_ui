import React, { useMemo } from 'react'
import './CategoryInsights.css'

function CategoryInsights({ expenses, income }) {
  const insights = useMemo(() => {
    if (!expenses || expenses.length === 0) return null

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Current month expenses
    const currentMonthExpenses = expenses.filter(exp => {
      const date = new Date(exp.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Last month expenses
    const lastMonthExpenses = expenses.filter(exp => {
      const date = new Date(exp.date)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    })

    // Calculate spending by category
    const calculateCategorySpending = (expensesList) => {
      return expensesList.reduce((acc, exp) => {
        const category = exp.category || 'Others'
        acc[category] = (acc[category] || 0) + exp.amount
        return acc
      }, {})
    }

    const currentSpending = calculateCategorySpending(currentMonthExpenses)
    const lastSpending = calculateCategorySpending(lastMonthExpenses)

    // Find most spent category
    const mostSpentCategory = Object.entries(currentSpending)
      .sort((a, b) => b[1] - a[1])[0]

    // Find fastest growing category
    const categoryGrowth = Object.keys({ ...currentSpending, ...lastSpending })
      .map(category => {
        const current = currentSpending[category] || 0
        const last = lastSpending[category] || 0
        const growth = last > 0 ? ((current - last) / last) * 100 : (current > 0 ? 100 : 0)
        return { category, current, last, growth }
      })
      .filter(c => c.current > 0)
      .sort((a, b) => b.growth - a.growth)

    const fastestGrowing = categoryGrowth[0]

    // Calculate trends
    const trends = Object.keys({ ...currentSpending, ...lastSpending })
      .map(category => {
        const current = currentSpending[category] || 0
        const last = lastSpending[category] || 0
        const change = current - last
        const changePercent = last > 0 ? ((change / last) * 100) : (current > 0 ? 100 : 0)
        return { category, current, last, change, changePercent }
      })
      .filter(t => t.current > 0)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 5)

    // Calculate total spending
    const totalCurrent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalLast = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalChange = totalCurrent - totalLast
    const totalChangePercent = totalLast > 0 ? ((totalChange / totalLast) * 100) : (totalCurrent > 0 ? 100 : 0)

    return {
      mostSpent: mostSpentCategory ? {
        category: mostSpentCategory[0],
        amount: mostSpentCategory[1],
        percentage: totalCurrent > 0 ? (mostSpentCategory[1] / totalCurrent) * 100 : 0
      } : null,
      fastestGrowing: fastestGrowing,
      trends,
      totalChange,
      totalChangePercent
    }
  }, [expenses])

  if (!insights) {
    return (
      <div className="category-insights">
        <h3 className="insights-title">📊 Category Insights</h3>
        <p className="no-data">Add expenses to see insights</p>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="category-insights">
      <h3 className="insights-title">📊 Category Insights</h3>
      
      <div className="insights-grid">
        {/* Most Spent Category */}
        {insights.mostSpent && (
          <div className="insight-card primary">
            <div className="insight-icon">🏆</div>
            <div className="insight-content">
              <div className="insight-label">Most Spent Category</div>
              <div className="insight-value">{insights.mostSpent.category}</div>
              <div className="insight-amount">{formatCurrency(insights.mostSpent.amount)}</div>
              <div className="insight-percentage">
                {insights.mostSpent.percentage.toFixed(1)}% of total spending
              </div>
            </div>
          </div>
        )}

        {/* Fastest Growing */}
        {insights.fastestGrowing && insights.fastestGrowing.growth > 0 && (
          <div className="insight-card warning">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <div className="insight-label">Fastest Growing</div>
              <div className="insight-value">{insights.fastestGrowing.category}</div>
              <div className="insight-growth positive">
                +{insights.fastestGrowing.growth.toFixed(1)}%
              </div>
              <div className="insight-amount">
                {formatCurrency(insights.fastestGrowing.current)} this month
              </div>
            </div>
          </div>
        )}

        {/* Total Change */}
        <div className={`insight-card ${insights.totalChangePercent > 0 ? 'danger' : 'success'}`}>
          <div className="insight-icon">{insights.totalChangePercent > 0 ? '📊' : '✅'}</div>
          <div className="insight-content">
            <div className="insight-label">Monthly Change</div>
            <div className={`insight-change ${insights.totalChangePercent > 0 ? 'positive' : 'negative'}`}>
              {insights.totalChangePercent > 0 ? '+' : ''}{insights.totalChangePercent.toFixed(1)}%
            </div>
            <div className="insight-amount">
              {insights.totalChangePercent > 0 ? 'Increased' : 'Decreased'} by {formatCurrency(Math.abs(insights.totalChange))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Trends */}
      {insights.trends.length > 0 && (
        <div className="trends-section">
          <h4 className="trends-title">Category Trends</h4>
          <div className="trends-list">
            {insights.trends.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-category">{trend.category}</div>
                <div className="trend-details">
                  <span className="trend-amount">{formatCurrency(trend.current)}</span>
                  <span className={`trend-change ${trend.changePercent > 0 ? 'positive' : 'negative'}`}>
                    {trend.changePercent > 0 ? '↑' : '↓'} {Math.abs(trend.changePercent).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryInsights

