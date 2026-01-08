import React from 'react'
import AddButton from './AddButton'
import './PartyList.css'

function PartyList({ parties, onAddClick, onPartyClick, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString()}`
  }

  const getOutstandingBalance = (party) => {
    // Calculate: Opening Balance + Purchases - Payments
    const openingBalance = party.openingBalance || 0
    const purchases = party.totalPurchases || 0
    const payments = party.totalPayments || 0
    return openingBalance + purchases - payments
  }

  const getPartyTotals = (party) => {
    const openingBalance = party.openingBalance || 0
    const purchases = party.totalPurchases || 0
    const payments = party.totalPayments || 0
    const remaining = openingBalance + purchases - payments
    return {
      opening: openingBalance,
      paid: payments,
      remaining: remaining
    }
  }

  const getBalanceClass = (balance) => {
    if (balance > 0) return 'positive'
    if (balance < 0) return 'negative'
    return 'zero'
  }

  const getBalanceLabel = (balance) => {
    if (balance > 0) return 'You Owe'
    if (balance < 0) return 'You Are Owed'
    return 'Settled'
  }

  return (
    <div className="party-list-container">
      <div className="party-list-header">
        <div className="party-list-title">
          <h2>Party Accounts</h2>
          <p className="party-list-subtitle">Manage your trading party ledgers</p>
        </div>
        <div className="party-list-actions">
          <AddButton viewMode="parties" onClick={onAddClick} />
        </div>
      </div>

      {parties.length > 0 ? (
        <div className="party-cards-grid">
          {parties.map((party) => {
            const outstandingBalance = getOutstandingBalance(party)
            const balanceClass = getBalanceClass(outstandingBalance)
            const balanceLabel = getBalanceLabel(outstandingBalance)

            return (
              <div key={party.id} className="party-card" onClick={() => onPartyClick && onPartyClick(party)}>
                <div className="party-card-header">
                  <div className="party-name-section">
                    <h3 className="party-name">{party.name}</h3>
                    {party.contact && (
                      <p className="party-contact">{party.contact}</p>
                    )}
                  </div>
                  <div className="party-actions">
                    <button
                      className="party-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit && onEdit(party)
                      }}
                      title="Edit Party"
                    >
                      ✏️
                    </button>
                    <button
                      className="party-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete && onDelete(party.id)
                      }}
                      title="Delete Party"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="party-card-body">
                  {(() => {
                    const totals = getPartyTotals(party)
                    return (
                      <>
                        <div className="party-amounts-grid">
                          <div className="amount-item opening">
                            <div className="amount-label">Opening</div>
                            <div className="amount-value">{formatCurrency(totals.opening)}</div>
                          </div>
                          <div className="amount-item paid">
                            <div className="amount-label">Paid</div>
                            <div className="amount-value">{formatCurrency(totals.paid)}</div>
                          </div>
                          <div className={`amount-item remaining ${balanceClass}`}>
                            <div className="amount-label">Remaining</div>
                            <div className="amount-value">{formatCurrency(totals.remaining)}</div>
                          </div>
                        </div>
                        {party.notes && (
                          <div className="party-notes">
                            <span className="notes-label">Notes:</span>
                            <span className="notes-text">{party.notes}</span>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                <div className="party-card-footer">
                  <span className="party-transaction-count">
                    {party.transactionCount || 0} transactions
                  </span>
                  <span className="party-view-ledger">View Details →</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon-large">🏢</div>
          <div className="empty-text">No parties added yet</div>
          <div className="empty-hint">
            Create party accounts to track purchases, payments, and outstanding balances
          </div>
          <div className="empty-tips">
            <div className="tip-item">💡 Tip: Add parties like "Mohit Granite", "Sri Ram Marble"</div>
            <div className="tip-item">💡 Tip: Track purchases and installment payments separately</div>
            <div className="tip-item">💡 Tip: View detailed ledger for each party</div>
          </div>
          <div className="empty-action">
            <AddButton viewMode="parties" onClick={onAddClick} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PartyList

