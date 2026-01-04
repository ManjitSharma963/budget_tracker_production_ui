import React from 'react'
import AddButton from './AddButton'
import './CreditsList.css'

function CreditsList({ credits, onAddClick, viewMode, onEdit, onDelete }) {
  // Separate borrowed and lent for totals
  const borrowed = credits.filter(c => c.creditType === 'borrowed')
  const lent = credits.filter(c => c.creditType === 'lent')

  const borrowedTotal = borrowed.reduce((sum, c) => sum + c.amount, 0)
  const lentTotal = lent.reduce((sum, c) => sum + c.amount, 0)
  const netAmount = lentTotal - borrowedTotal

  // Combine all credits and group by date
  const allCredits = [...credits].sort((a, b) => new Date(b.date) - new Date(a.date))
  
  const groupByDate = (items) => {
    return items.reduce((groups, item) => {
      const date = item.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(item)
      return groups
    }, {})
  }

  const creditsByDate = groupByDate(allCredits)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="credits-container">
      <div className="credits-top-section">
        {(borrowedTotal > 0 || lentTotal > 0) && (
          <div className={`net-amount-banner ${netAmount > 0 ? 'positive' : netAmount < 0 ? 'negative' : 'neutral'}`}>
            {netAmount > 0 ? 'You are owed' : 'You owe'}: ₹{Math.abs(netAmount).toLocaleString()}
          </div>
        )}
        <div className="credits-add-button-top">
          <AddButton viewMode={viewMode} onClick={onAddClick} />
        </div>
      </div>

      <div className="credits-summary-cards">
        <div className="summary-card borrowed-card">
          
          <div className="summary-label">BORROWED</div>
          <div className="summary-amount borrowed-amount">₹{borrowedTotal.toLocaleString()}</div>
        </div>
        <div className="summary-card lent-card">
          <div className="summary-label">LENT</div>
          <div className="summary-amount lent-amount">₹{lentTotal.toLocaleString()}</div>
        </div>
      </div>

      {allCredits.length > 0 && (
        <div className="credits-section">
          <div className="transaction-list">
            {Object.entries(creditsByDate)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .map(([date, dateCredits]) => {
                const dateTotal = dateCredits.reduce((sum, c) => sum + c.amount, 0)
                return (
                  <div key={date} className="date-group">
                    <div className="date-header">
                      <span className="date-text">{formatDate(date)}</span>
                      <span className="daily-expenses">
                        Total: ₹{dateTotal.toLocaleString()}
                      </span>
                    </div>
                    {dateCredits.map((credit, index) => {
                      const isBorrowed = credit.creditType === 'borrowed'
                      const displayName = isBorrowed 
                        ? `Borrowed From ${credit.personName || 'Unknown'}`
                        : `Lent to ${credit.personName || 'Unknown'}`
                      
                      return (
                        <div key={index} className={`credit-item ${isBorrowed ? 'borrowed-item' : 'lent-item'}`}>
                          <div className={`credit-icon ${isBorrowed ? 'borrowed-icon' : 'lent-icon'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.72-2.92 0-2.03-1.64-2.73-3.61-3.16z" fill="currentColor"/>
                            </svg>
                          </div>
                          <div className="credit-details">
                            <div className="credit-person">{displayName}</div>
                            <div className="credit-note">{credit.note || 'No note'}</div>
                          </div>
                          <div className="credit-actions-wrapper">
                            <div className={`credit-amount ${isBorrowed ? 'borrowed' : 'lent'}`}>
                              {isBorrowed ? '-' : '+'}₹{credit.amount.toLocaleString()}
                            </div>
                            <div className="credit-action-buttons">
                              <button className="edit-btn" onClick={() => onEdit && onEdit(credit)} title="Edit">
                                ✏️
                              </button>
                              <button className="delete-btn" onClick={() => onDelete && onDelete(credit.id)} title="Delete">
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {allCredits.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-large">💳</div>
          <div className="empty-text">No credits recorded yet</div>
          <div className="empty-hint">Track money you've borrowed or lent to others</div>
          <div className="empty-tips">
            <div className="tip-item">💡 Tip: Mark transactions as "Borrowed" or "Lent"</div>
            <div className="tip-item">💡 Tip: Add person names to remember who owes you</div>
          </div>
          <div className="empty-action">
            <AddButton viewMode={viewMode} onClick={onAddClick} />
          </div>
        </div>
      )}

    </div>
  )
}

export default CreditsList

