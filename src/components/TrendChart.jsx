import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './TrendChart.css'

function TrendChart({ transactions, viewMode }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  // Group by month and calculate totals
  const groupByMonth = (items) => {
    const months = {}
    items.forEach(item => {
      const date = new Date(item.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          expenses: 0,
          income: 0
        }
      }
      
      if (item.type === 'expense') {
        months[monthKey].expenses += item.amount
      } else {
        months[monthKey].income += item.amount
      }
    })
    
    return Object.values(months).sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA - dateB
    })
  }

  const chartData = groupByMonth(transactions)

  if (chartData.length === 0) {
    return (
      <div className="trend-chart-container">
        <h3 className="chart-title">Spending Trends</h3>
        <div className="no-chart-data">No data available for trend analysis</div>
      </div>
    )
  }

  return (
    <div className="trend-chart-container">
      <h3 className="chart-title">Spending Trends</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            fontSize={11}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            stroke="#666"
            fontSize={11}
            tick={{ fill: '#666' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value) => `₹${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '8px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          {viewMode === 'expenses' || viewMode === 'income' ? (
            <>
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#E63946" 
                strokeWidth={2}
                name="Expenses"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#2ecc71" 
                strokeWidth={2}
                name="Income"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </>
          ) : (
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#E63946" 
              strokeWidth={2}
              name="Expenses"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart

