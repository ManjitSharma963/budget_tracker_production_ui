import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './SpendingForecast.css'

function SpendingForecast({ expenses, income }) {
  const forecastData = useMemo(() => {
    if (!expenses || expenses.length === 0) return null

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Get last 6 months of data
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date)
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear()
      })
      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      monthlyData.push({
        month: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        actual: total,
        forecast: null
      })
    }

    // Calculate average growth rate
    const values = monthlyData.map(d => d.actual).filter(v => v > 0)
    if (values.length < 2) return { monthlyData, forecast: null }

    // Simple moving average for forecast
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    const lastValue = values[values.length - 1]
    const growthRate = values.length > 1 ? (lastValue - values[0]) / (values.length - 1) : 0

    // Forecast next 3 months
    const forecast = []
    for (let i = 1; i <= 3; i++) {
      const forecastDate = new Date(currentYear, currentMonth + i, 1)
      const forecastValue = Math.max(0, lastValue + (growthRate * i))
      forecast.push({
        month: forecastDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        actual: null,
        forecast: forecastValue
      })
    }

    // Combine actual and forecast data
    const combinedData = [...monthlyData, ...forecast]

    // Calculate projections
    const nextMonthProjection = forecast[0]?.forecast || 0
    const yearlyProjection = (avg * 12) || 0

    return {
      monthlyData: combinedData,
      nextMonthProjection,
      yearlyProjection,
      avgMonthly: avg,
      growthRate: (growthRate / lastValue) * 100
    }
  }, [expenses, income])

  if (!forecastData) {
    return (
      <div className="spending-forecast">
        <h3 className="forecast-title">📈 Spending Forecast</h3>
        <p className="no-data">Add more expenses to generate forecasts</p>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="spending-forecast">
      <h3 className="forecast-title">📈 Spending Forecast</h3>
      
      {/* Projections Summary */}
      <div className="projections-summary">
        <div className="projection-card">
          <div className="projection-label">Next Month</div>
          <div className="projection-value">{formatCurrency(forecastData.nextMonthProjection)}</div>
          <div className="projection-hint">Projected spending</div>
        </div>
        <div className="projection-card">
          <div className="projection-label">Yearly Estimate</div>
          <div className="projection-value">{formatCurrency(forecastData.yearlyProjection)}</div>
          <div className="projection-hint">Based on average</div>
        </div>
        <div className="projection-card">
          <div className="projection-label">Avg Monthly</div>
          <div className="projection-value">{formatCurrency(forecastData.avgMonthly)}</div>
          <div className="projection-hint">Last 6 months</div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="forecast-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData.monthlyData}>
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
              formatter={(value) => value ? formatCurrency(value) : 'N/A'}
            />
            <Legend 
              wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#667eea" 
              strokeWidth={2}
              dot={{ fill: '#667eea', r: 4 }}
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', r: 4 }}
              name="Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {forecastData.growthRate !== 0 && (
        <div className="forecast-note">
          <span className="note-icon">ℹ️</span>
          <span>
            {forecastData.growthRate > 0 
              ? `Spending is increasing at ${Math.abs(forecastData.growthRate).toFixed(1)}% per month`
              : `Spending is decreasing at ${Math.abs(forecastData.growthRate).toFixed(1)}% per month`
            }
          </span>
        </div>
      )}
    </div>
  )
}

export default SpendingForecast

