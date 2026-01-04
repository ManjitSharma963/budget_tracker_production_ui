import React from 'react'
import './StatisticsCards.css'

function StatisticsCards({ transactions, viewMode }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Filter current month transactions
  const currentMonthExpenses = expenses.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  const currentMonthIncome = income.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  // Calculate statistics
  const totalExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0)
  const netSavings = totalIncome - totalExpenses
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysPassed = now.getDate()
  const avgDailySpending = daysPassed > 0 ? totalExpenses / daysPassed : 0
  const avgDailyIncome = daysPassed > 0 ? totalIncome / daysPassed : 0
  
  // Transaction counts based on view mode
  const expenseCount = expenses.length
  const incomeCount = income.length
  
  const stats = [
    {
      label: 'Total Expenses',
      value: `₹${totalExpenses.toLocaleString()}`,
      icon: '📉',
      color: '#E63946',
      visible: viewMode === 'expenses'
    },
    {
      label: 'Total Income',
      value: `₹${totalIncome.toLocaleString()}`,
      icon: '📈',
      color: '#2ecc71',
      visible: viewMode === 'income'
    },
    {
      label: 'Net Savings',
      value: `₹${netSavings.toLocaleString()}`,
      icon: '💰',
      color: netSavings >= 0 ? '#2ecc71' : '#E63946',
      visible: viewMode === 'expenses'
    },
    {
      label: 'Avg Daily',
      value: `₹${Math.round(avgDailySpending).toLocaleString()}`,
      icon: '📅',
      color: '#667eea',
      visible: false // Removed from expenses view
    },
    {
      label: 'Avg Daily Income',
      value: `₹${Math.round(avgDailyIncome).toLocaleString()}`,
      icon: '📅',
      color: '#667eea',
      visible: viewMode === 'income'
    },
    {
      label: 'Transactions',
      value: viewMode === 'expenses' ? expenseCount.toString() : incomeCount.toString(),
      icon: '📊',
      color: '#9B59B6',
      visible: viewMode !== 'expenses' // Removed from expenses view
    }
  ]

  const visibleStats = stats.filter(s => s.visible)

  return (
    <div className="statistics-cards-container">
      {visibleStats.map((stat, index) => (
        <div 
          key={index} 
          className="stat-card"
          style={{ '--stat-color': stat.color }}
        >
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatisticsCards

