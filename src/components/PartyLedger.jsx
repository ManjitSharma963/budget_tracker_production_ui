import React from 'react'
import AddButton from './AddButton'
import './PartyLedger.css'

function PartyLedger({ party, ledgerEntries, onBack, onAddEntry, onEditEntry, onDeleteEntry }) {
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

  // Calculate running balance
  const calculateRunningBalance = () => {
    let runningBalance = party.openingBalance || 0
    const entriesWithBalance = ledgerEntries.map(entry => {
      if (entry.type === 'purchase') {
        runningBalance += entry.amount
      } else if (entry.type === 'payment') {
        runningBalance -= entry.amount
      } else if (entry.type === 'adjustment') {
        runningBalance += entry.amount // Adjustments can be positive or negative
      }
      return {
        ...entry,
        runningBalance: runningBalance
      }
    })
    return entriesWithBalance
  }

  const entriesWithBalance = calculateRunningBalance()
  const currentBalance = entriesWithBalance.length > 0 
    ? entriesWithBalance[entriesWithBalance.length - 1].runningBalance 
    : (party.openingBalance || 0)

  const getEntryTypeLabel = (type) => {
    switch(type) {
      case 'purchase': return 'Purchase'
      case 'payment': return 'Payment'
      case 'adjustment': return 'Adjustment'
      default: return type
    }
  }

  const getEntryTypeClass = (type) => {
    switch(type) {
      case 'purchase': return 'purchase'
      case 'payment': return 'payment'
      case 'adjustment': return 'adjustment'
      default: return ''
    }
  }

  const getBalanceClass = (balance) => {
    if (balance > 0) return 'positive'
    if (balance < 0) return 'negative'
    return 'zero'
  }

  return (
    <div className="party-ledger-container">
      <div className="party-ledger-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Parties
        </button>
        <div className="party-ledger-info">
          <h2 className="party-ledger-name">{party.name}</h2>
          {party.contact && (
            <p className="party-ledger-contact">{party.contact}</p>
          )}
        </div>
        <div className="party-ledger-actions">
          <AddButton viewMode="parties" onClick={onAddEntry} />
        </div>
      </div>

      <div className="party-ledger-summary">
        <div className="summary-card opening-balance">
          <div className="summary-label">Opening Balance</div>
          <div className="summary-amount">{formatCurrency(party.openingBalance || 0)}</div>
        </div>
        <div className="summary-card total-purchases">
          <div className="summary-label">Total Purchases</div>
          <div className="summary-amount purchases">{formatCurrency(party.totalPurchases || 0)}</div>
        </div>
        <div className="summary-card total-payments">
          <div className="summary-label">Total Payments</div>
          <div className="summary-amount payments">{formatCurrency(party.totalPayments || 0)}</div>
        </div>
        <div className={`summary-card outstanding-balance ${getBalanceClass(currentBalance)}`}>
          <div className="summary-label">Outstanding Balance</div>
          <div className="summary-amount">{formatCurrency(currentBalance)}</div>
        </div>
      </div>

      {entriesWithBalance.length > 0 ? (
        <div className="ledger-table-container">
          <div className="ledger-table-header">
            <div className="ledger-col-date">Date</div>
            <div className="ledger-col-type">Type</div>
            <div className="ledger-col-description">Description</div>
            <div className="ledger-col-debit">Debit</div>
            <div className="ledger-col-credit">Credit</div>
            <div className="ledger-col-balance">Balance</div>
            <div className="ledger-col-actions">Actions</div>
          </div>
          <div className="ledger-table-body">
            {entriesWithBalance.map((entry, index) => {
              const isPurchase = entry.type === 'purchase'
              const isPayment = entry.type === 'payment'
              const isAdjustment = entry.type === 'adjustment'
              
              return (
                <div key={entry.id || index} className="ledger-table-row">
                  <div className="ledger-col-date">{formatDate(entry.date)}</div>
                  <div className={`ledger-col-type ${getEntryTypeClass(entry.type)}`}>
                    {getEntryTypeLabel(entry.type)}
                  </div>
                  <div className="ledger-col-description">{entry.description || '-'}</div>
                  <div className="ledger-col-debit">
                    {isPurchase || (isAdjustment && entry.amount > 0) ? formatCurrency(entry.amount) : '-'}
                  </div>
                  <div className="ledger-col-credit">
                    {isPayment || (isAdjustment && entry.amount < 0) ? formatCurrency(Math.abs(entry.amount)) : '-'}
                  </div>
                  <div className={`ledger-col-balance ${getBalanceClass(entry.runningBalance)}`}>
                    {formatCurrency(entry.runningBalance)}
                  </div>
                  <div className="ledger-col-actions">
                    <button
                      className="ledger-edit-btn"
                      onClick={() => onEditEntry && onEditEntry(entry)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="ledger-delete-btn"
                      onClick={() => onDeleteEntry && onDeleteEntry(entry.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon-large">📊</div>
          <div className="empty-text">No ledger entries yet</div>
          <div className="empty-hint">Add purchases, payments, or adjustments to start tracking</div>
          <div className="empty-action">
            <AddButton viewMode="parties" onClick={onAddEntry} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PartyLedger

