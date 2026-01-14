import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import './PieChart.css'

function PieChart({ total, data }) {
  const COLORS = {
    'Basic': '#FF6B35',
    'Enjoyment': '#E63946',
    'Health Care': '#457B9D',
    'Give': '#9B59B6',
    'Others': '#FF69B4',
    'Grocery': '#FF6B35',
    'Entertainment': '#E63946',
    'Transport': '#FF6B35',
    'Shopping': '#E63946',
    'Food': '#FF6B35',
    'Bills': '#9B59B6',
    'Salary': '#2ecc71',
    'Rent Payment': '#3498db',
    'Get Commission': '#f39c12',
    'Other Add Income Type': '#95a5a6',
    'Remaining': '#3498db' // Special color for remaining income
  }
  
  // Generate color for unknown categories
  const getColor = (categoryName) => {
    if (COLORS[categoryName]) {
      return COLORS[categoryName]
    }
    // Generate a color based on category name
    const colors = ['#FF6B35', '#E63946', '#457B9D', '#9B59B6', '#FF69B4', '#4ECDC4', '#45B7D1', '#F7B731']
    const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="pie-chart-container">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={150}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="chart-center">
          <div className="chart-total">₹{total.toLocaleString()}</div>
        </div>
      </div>
      <div className="chart-legend">
        {data.map((item) => (
          <div key={item.name} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: getColor(item.name) }}
            ></div>
            <span className="legend-label">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChart

