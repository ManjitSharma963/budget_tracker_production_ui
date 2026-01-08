import React from 'react'
import './Dashboard.css'

function Dashboard({ 
  transactions, 
  credits, 
  parties, 
  notes,
  onNavigate 
}) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Current month calculations
  const currentMonthExpenses = expenses.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  const currentMonthIncome = income.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  const totalExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0)
  const netSavings = totalIncome - totalExpenses
  
  // Credits calculations
  const borrowed = credits.filter(c => c.creditType === 'borrowed')
  const lent = credits.filter(c => c.creditType === 'lent')
  const borrowedTotal = borrowed.reduce((sum, c) => sum + c.amount, 0)
  const lentTotal = lent.reduce((sum, c) => sum + c.amount, 0)
  const netCredits = lentTotal - borrowedTotal
  
  // Parties calculations
  const totalParties = parties.length
  const partiesWithBalance = parties.filter(p => {
    const opening = p.openingBalance || 0
    const purchases = p.totalPurchases || 0
    const payments = p.totalPayments || 0
    return (opening + purchases - payments) !== 0
  }).length
  const totalOutstanding = parties.reduce((sum, p) => {
    const opening = p.openingBalance || 0
    const purchases = p.totalPurchases || 0
    const payments = p.totalPayments || 0
    return sum + (opening + purchases - payments)
  }, 0)
  
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString()}`
  }
  
  const dashboardCards = [
    {
      title: 'Financial Overview',
      icon: '💰',
      color: '#667eea',
      items: [
        { label: 'Total Income', value: formatCurrency(totalIncome), color: '#2ecc71' },
        { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: '#E63946' },
        { label: 'Net Savings', value: formatCurrency(netSavings), color: netSavings >= 0 ? '#2ecc71' : '#E63946' }
      ],
      onClick: () => onNavigate && onNavigate('expenses')
    },
    {
      title: 'Credits',
      icon: '💳',
      color: '#9B59B6',
      items: [
        { label: 'Borrowed', value: formatCurrency(borrowedTotal), color: '#E63946' },
        { label: 'Lent', value: formatCurrency(lentTotal), color: '#2ecc71' },
        { label: 'Net', value: formatCurrency(netCredits), color: netCredits >= 0 ? '#2ecc71' : '#E63946' }
      ],
      onClick: () => onNavigate && onNavigate('credits')
    },
    {
      title: 'Parties',
      icon: '🏢',
      color: '#f39c12',
      items: [
        { label: 'Total Parties', value: totalParties.toString(), color: '#667eea' },
        { label: 'With Balance', value: partiesWithBalance.toString(), color: '#f39c12' },
        { label: 'Outstanding', value: formatCurrency(totalOutstanding), color: totalOutstanding > 0 ? '#E63946' : '#2ecc71' }
      ],
      onClick: () => onNavigate && onNavigate('parties')
    }
  ]
  
  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-icon">📊</div>
          <h1 className="hero-title">Financial Dashboard</h1>
          <p className="hero-subtitle">Your complete financial overview</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ color: '#2ecc71' }}>
              {formatCurrency(totalIncome)}
            </div>
            <div className="hero-stat-label">Total Income</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ color: '#E63946' }}>
              {formatCurrency(totalExpenses)}
            </div>
            <div className="hero-stat-label">Total Expenses</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ color: netSavings >= 0 ? '#2ecc71' : '#E63946' }}>
              {formatCurrency(netSavings)}
            </div>
            <div className="hero-stat-label">Net Savings</div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="dashboard-quick-stats">
        {dashboardCards.map((card, index) => (
          <div 
            key={index} 
            className="dashboard-quick-card"
            onClick={card.onClick}
            style={{ '--card-color': card.color }}
          >
            <div className="quick-card-icon" style={{ background: `linear-gradient(135deg, ${card.color}20 0%, ${card.color}10 100%)` }}>
              <span style={{ fontSize: '32px' }}>{card.icon}</span>
            </div>
            <div className="quick-card-content">
              <h3 className="quick-card-title">{card.title}</h3>
              <div className="quick-card-stats">
                {card.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="quick-stat">
                    <span className="quick-stat-label">{item.label}</span>
                    <span className="quick-stat-value" style={{ color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="quick-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard

