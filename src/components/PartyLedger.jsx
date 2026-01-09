import React, { useState, useMemo } from 'react'
import AddButton from './AddButton'
import './PartyLedger.css'

function PartyLedger({ party, ledgerEntries, onBack, onAddEntry, onEditEntry, onDeleteEntry }) {
  const [filterType, setFilterType] = useState('all') // 'all', 'credit', 'debit'

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

  // Sort entries by date (oldest first for proper ledger view)
  const sortedEntries = useMemo(() => {
    return [...ledgerEntries].sort((a, b) => {
      const dateA = new Date(a.date || a.transactionDate || 0)
      const dateB = new Date(b.date || b.transactionDate || 0)
      return dateA - dateB // Oldest first
    })
  }, [ledgerEntries])

  // Calculate running balance for ALL entries first (for accurate balance calculation)
  const entriesWithBalance = useMemo(() => {
    let runningBalance = party.openingBalance || 0
    return sortedEntries.map(entry => {
      const type = entry.type || entry.transactionType?.toLowerCase()
      if (type === 'purchase') {
        runningBalance += entry.amount
      } else if (type === 'payment') {
        runningBalance -= entry.amount
      } else if (type === 'adjustment') {
        runningBalance += entry.amount // Adjustments can be positive or negative
      }
      return {
        ...entry,
        runningBalance: runningBalance
      }
    })
  }, [sortedEntries, party.openingBalance])

  // Calculate current balance from all entries
  const currentBalance = entriesWithBalance.length > 0 
    ? entriesWithBalance[entriesWithBalance.length - 1].runningBalance 
    : (party.openingBalance || 0)

  // Filter entries based on selected filter (after calculating balance)
  const filteredEntries = useMemo(() => {
    if (filterType === 'all') return entriesWithBalance
    if (filterType === 'credit') {
      return entriesWithBalance.filter(entry => {
        const type = entry.type || entry.transactionType?.toLowerCase()
        return type === 'purchase' || (type === 'adjustment' && entry.amount > 0)
      })
    }
    if (filterType === 'debit') {
      return entriesWithBalance.filter(entry => {
        const type = entry.type || entry.transactionType?.toLowerCase()
        return type === 'payment' || (type === 'adjustment' && entry.amount < 0)
      })
    }
    return entriesWithBalance
  }, [entriesWithBalance, filterType])

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

      {/* Filter Buttons */}
      <div className="ledger-filters">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Transactions
        </button>
        <button
          className={`filter-btn ${filterType === 'credit' ? 'active' : ''}`}
          onClick={() => setFilterType('credit')}
        >
          Credit (Purchases)
        </button>
        <button
          className={`filter-btn ${filterType === 'debit' ? 'active' : ''}`}
          onClick={() => setFilterType('debit')}
        >
          Debit (Payments)
        </button>
      </div>

      {filteredEntries.length > 0 ? (
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
            {filteredEntries.map((entry, index) => {
              const entryType = entry.type || entry.transactionType?.toLowerCase()
              const isPurchase = entryType === 'purchase'
              const isPayment = entryType === 'payment'
              const isAdjustment = entryType === 'adjustment'
              
              return (
                <div key={entry.id || index} className="ledger-table-row">
                  <div className="ledger-col-date" data-label="Date">{formatDate(entry.date)}</div>
                  <div className={`ledger-col-type ${getEntryTypeClass(entryType)}`} data-label="Type">
                    {getEntryTypeLabel(entryType)}
                  </div>
                  <div className="ledger-col-description" data-label="Description">{entry.description || '-'}</div>
                  <div className="ledger-col-debit" data-label="Debit">
                    {isPayment || (isAdjustment && entry.amount < 0) ? formatCurrency(Math.abs(entry.amount)) : '-'}
                  </div>
                  <div className="ledger-col-credit" data-label="Credit">
                    {isPurchase || (isAdjustment && entry.amount > 0) ? formatCurrency(entry.amount) : '-'}
                  </div>
                  <div className={`ledger-col-balance ${getBalanceClass(entry.runningBalance)}`} data-label="Balance">
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
      ) : filterType !== 'all' ? (
        <div className="empty-state">
          <div className="empty-icon-large">🔍</div>
          <div className="empty-text">No {filterType === 'credit' ? 'credit' : 'debit'} transactions found</div>
          <div className="empty-hint">Try selecting a different filter or add a new entry</div>
          <div className="empty-action">
            <button className="filter-btn active" onClick={() => setFilterType('all')}>
              Show All Transactions
            </button>
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

