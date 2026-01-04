import React from 'react'
import './MonthlySummary.css'

function MonthlySummary({ transactions, viewMode }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  // Group by month
  const groupByMonth = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          month: monthName,
          expenses: [],
          income: []
        }
      }
      
      if (transaction.type === 'expense') {
        groups[monthKey].expenses.push(transaction)
      } else {
        groups[monthKey].income.push(transaction)
      }
      
      return groups
    }, {})
  }

  const monthlyData = groupByMonth(transactions)
  const sortedMonths = Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0]))

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateSavings = (income, expenses) => {
    return income - expenses
  }

  return (
    <div className="monthly-summary-container">
      <h3 className="summary-title">Monthly Summary</h3>
      
      {sortedMonths.length === 0 ? (
        <div className="no-data">No data available</div>
      ) : (
        <div className="summary-list">
          {sortedMonths.map(([key, data]) => {
            const monthExpenses = calculateTotal(data.expenses)
            const monthIncome = calculateTotal(data.income)
            const savings = calculateSavings(monthIncome, monthExpenses)
            
            return (
              <div key={key} className="month-card">
                <div className="month-header">
                  <h4 className="month-name">{data.month}</h4>
                </div>
                <div className="month-stats">
                  {viewMode === 'expenses' || viewMode === 'income' ? (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Income:</span>
                        <span className="stat-value income-value">₹{monthIncome.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Expenses:</span>
                        <span className="stat-value expense-value">₹{monthExpenses.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Savings:</span>
                        <span className={`stat-value ${savings >= 0 ? 'savings-positive' : 'savings-negative'}`}>
                          ₹{savings.toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Total Transactions:</span>
                        <span className="stat-value">{(data.expenses.length + data.income.length)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MonthlySummary

