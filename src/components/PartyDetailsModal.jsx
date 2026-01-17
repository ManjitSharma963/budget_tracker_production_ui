import React, { useState, useEffect } from 'react'
import './PartyDetailsModal.css'

function PartyDetailsModal({ isOpen, onClose, party, ledgerEntries, onAddPayment, onEditEntry, onDeleteEntry }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && party) {
      // Modal is opened, data should already be loaded
    }
  }, [isOpen, party])

  if (!isOpen || !party) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString()}`
  }

  // Calculate totals from ledger entries
  const calculateTotals = () => {
    let totalPurchases = 0
    let totalPayments = 0

    ledgerEntries.forEach(entry => {
      if (entry.type === 'purchase' || entry.transactionType === 'PURCHASE') {
        totalPurchases += entry.amount || 0
      } else if (entry.type === 'payment' || entry.transactionType === 'PAYMENT') {
        totalPayments += entry.amount || 0
      } else if (entry.type === 'adjustment' || entry.transactionType === 'ADJUSTMENT') {
        // Adjustments can be positive or negative
        if (entry.amount > 0) {
          totalPurchases += entry.amount
        } else {
          totalPayments += Math.abs(entry.amount)
        }
      }
    })

    const openingBalance = party.openingBalance || 0
    const totalOwed = openingBalance + totalPurchases
    const remaining = totalOwed - totalPayments

    return {
      openingBalance,
      totalPurchases,
      totalPayments,
      totalOwed,
      remaining
    }
  }

  const totals = calculateTotals()

  // Filter only payment transactions
  const paymentEntries = ledgerEntries.filter(entry => {
    const type = entry.type || entry.transactionType?.toLowerCase()
    return type === 'payment' || type === 'PAYMENT'
  }).sort((a, b) => {
    const dateA = new Date(a.date || a.transactionDate || 0)
    const dateB = new Date(b.date || b.transactionDate || 0)
    return dateB - dateA // Most recent first
  })

  const getEntryTypeLabel = (entry) => {
    const type = entry.type || entry.transactionType?.toLowerCase()
    switch(type) {
      case 'purchase':
      case 'PURCHASE':
        return 'Purchase'
      case 'payment':
      case 'PAYMENT':
        return 'Payment'
      case 'adjustment':
      case 'ADJUSTMENT':
        return 'Adjustment'
      default:
        return type
    }
  }

  return (
    <div className="modal-overlay party-details-overlay" onClick={onClose}>
      <div 
        className="modal-content party-details-modal" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{party.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="party-details-content">
          {/* Summary Cards */}
          <div className="party-summary-cards">
            <div className="summary-card opening-card">
              <div className="summary-label">Opening Amount</div>
              <div className="summary-amount">{formatCurrency(totals.openingBalance)}</div>
            </div>
            <div className="summary-card paid-card">
              <div className="summary-label">Paid Amount</div>
              <div className="summary-amount paid">{formatCurrency(totals.totalPayments)}</div>
            </div>
            <div className={`summary-card remaining-card ${totals.remaining > 0 ? 'positive' : totals.remaining < 0 ? 'negative' : 'zero'}`}>
              <div className="summary-label">Remaining Amount</div>
              <div className="summary-amount">{formatCurrency(totals.remaining)}</div>
            </div>
          </div>

          {/* Party Info */}
          {party.contact && (
            <div className="party-info-section">
              <div className="info-item">
                <span className="info-label">Contact:</span>
                <span className="info-value">{party.contact}</span>
              </div>
            </div>
          )}

          {/* Add Payment Button */}
          <div className="add-payment-section">
            <button className="add-payment-button" onClick={() => onAddPayment && onAddPayment()}>
              + Add Payment
            </button>
          </div>

          {/* Payment Transactions List */}
          <div className="payment-transactions-section">
            <h3 className="section-title">Payment Transactions</h3>
            {paymentEntries.length > 0 ? (
              <div className="transactions-list">
                {paymentEntries.map((entry, index) => {
                  const entryDate = entry.date || entry.transactionDate
                  return (
                    <div key={entry.id || index} className="transaction-item payment-item">
                      <div className="transaction-icon">💳</div>
                      <div className="transaction-details">
                        <div className="transaction-description">
                          {entry.description || 'Payment'}
                        </div>
                        <div className="transaction-meta">
                          <span className="transaction-date">{formatDate(entryDate)}</span>
                          {entry.paymentMode && (
                            <span className="transaction-payment-mode">• {entry.paymentMode}</span>
                          )}
                          {(entry.reference || entry.referenceNumber) && (
                            <span className="transaction-reference">• Ref: {entry.reference || entry.referenceNumber}</span>
                          )}
                        </div>
                      </div>
                      <div className="transaction-amount-wrapper">
                        <div className="transaction-amount paid-amount">
                          {formatCurrency(entry.amount)}
                        </div>
                        <div className="transaction-actions">
                          <button
                            className="edit-btn"
                            onClick={() => onEditEntry && onEditEntry(entry)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => onDeleteEntry && onDeleteEntry(entry.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-payments">
                <div className="empty-icon">💳</div>
                <div className="empty-text">No payments recorded yet</div>
                <div className="empty-hint">Click "Add Payment" to record a payment</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartyDetailsModal

