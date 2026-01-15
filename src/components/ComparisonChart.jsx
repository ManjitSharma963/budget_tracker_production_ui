import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ComparisonChart.css'

function ComparisonChart({ transactions, viewMode = 'expenses' }) {
  const comparisonData = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    // Get last year
    const lastYear = currentYear - 1
    
    const filterByPeriod = (transactions, month, year) => {
      return transactions.filter(t => {
        const date = new Date(t.date)
        return date.getMonth() === month && date.getFullYear() === year
      })
    }
    
    const currentMonthData = filterByPeriod(transactions, currentMonth, currentYear)
    const lastMonthData = filterByPeriod(transactions, lastMonth, lastMonthYear)
    const currentYearData = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getFullYear() === currentYear
    })
    const lastYearData = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getFullYear() === lastYear
    })
    
    const calculateTotal = (data) => {
      return data
        .filter(t => t.type === viewMode)
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    }
    
    const currentMonthTotal = calculateTotal(currentMonthData)
    const lastMonthTotal = calculateTotal(lastMonthData)
    const currentYearTotal = calculateTotal(currentYearData)
    const lastYearTotal = calculateTotal(lastYearData)
    
    const monthChange = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0
    const yearChange = lastYearTotal > 0 
      ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 
      : 0
    
    return {
      monthly: [
        {
          name: 'Last Month',
          amount: lastMonthTotal,
          month: `${new Date(lastMonthYear, lastMonth).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
        },
        {
          name: 'This Month',
          amount: currentMonthTotal,
          month: `${new Date(currentYear, currentMonth).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
        }
      ],
      yearly: [
        {
          name: 'Last Year',
          amount: lastYearTotal,
          year: lastYear.toString()
        },
        {
          name: 'This Year',
          amount: currentYearTotal,
          year: currentYear.toString()
        }
      ],
      monthChange,
      yearChange,
      currentMonthTotal,
      lastMonthTotal,
      currentYearTotal,
      lastYearTotal
    }
  }, [transactions, viewMode])
  
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  
  const getChangeColor = (change) => {
    if (change > 0) return '#ef4444' // Red for increase (bad for expenses)
    if (change < 0) return '#2ecc71' // Green for decrease (good for expenses)
    return '#666'
  }
  
  const getChangeIcon = (change) => {
    if (change > 0) return '📈'
    if (change < 0) return '📉'
    return '➡️'
  }
  
  return (
    <div className="comparison-chart-container">
      <h3 className="comparison-title">Spending Comparisons</h3>
      
      {/* Monthly Comparison */}
      <div className="comparison-section">
        <h4 className="section-title">Monthly Comparison</h4>
        <div className="comparison-stats">
          <div className="stat-card">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{formatCurrency(comparisonData.currentMonthTotal)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Last Month</div>
            <div className="stat-value">{formatCurrency(comparisonData.lastMonthTotal)}</div>
          </div>
          <div className="stat-card change-card">
            <div className="stat-label">Change</div>
            <div 
              className="stat-value change-value"
              style={{ color: getChangeColor(comparisonData.monthChange) }}
            >
              {getChangeIcon(comparisonData.monthChange)} {Math.abs(comparisonData.monthChange).toFixed(1)}%
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparisonData.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="month" 
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value) => formatCurrency(value)}
            />
            <Bar dataKey="amount" fill="#667eea" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Yearly Comparison */}
      <div className="comparison-section">
        <h4 className="section-title">Yearly Comparison</h4>
        <div className="comparison-stats">
          <div className="stat-card">
            <div className="stat-label">This Year</div>
            <div className="stat-value">{formatCurrency(comparisonData.currentYearTotal)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Last Year</div>
            <div className="stat-value">{formatCurrency(comparisonData.lastYearTotal)}</div>
          </div>
          <div className="stat-card change-card">
            <div className="stat-label">Change</div>
            <div 
              className="stat-value change-value"
              style={{ color: getChangeColor(comparisonData.yearChange) }}
            >
              {getChangeIcon(comparisonData.yearChange)} {Math.abs(comparisonData.yearChange).toFixed(1)}%
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparisonData.yearly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="year" 
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value) => formatCurrency(value)}
            />
            <Bar dataKey="amount" fill="#14b8a6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ComparisonChart

