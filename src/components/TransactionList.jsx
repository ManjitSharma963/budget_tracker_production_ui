import React from 'react'
import TransactionItem from './TransactionItem'
import AddButton from './AddButton'
import './TransactionList.css'

function TransactionList({ transactions, viewMode, onAddClick, onEdit, onDelete, onDeleteRequest, onDuplicate }) {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {})

  // Calculate daily expenses for each date
  const getDailyExpenses = (dateTransactions) => {
    return dateTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const hasTransactions = Object.keys(groupedTransactions).length > 0

  return (
    <div className="transaction-list">
      {!hasTransactions && (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-icon-large">📝</div>
            <p className="empty-state-text">No {viewMode} found</p>
            <p className="empty-state-hint">
              {viewMode === 'expenses' 
                ? 'Start tracking your expenses by adding your first transaction'
                : viewMode === 'income'
                ? 'Add your income sources to track your earnings'
                : 'Track borrowed and lent money to manage your credits'
              }
            </p>
            <div className="empty-state-tips">
              <div className="tip-item">💡 Tip: Use categories to organize your transactions</div>
              <div className="tip-item">💡 Tip: Add notes to remember important details</div>
            </div>
            <AddButton viewMode={viewMode} onClick={onAddClick} />
          </div>
        </div>
      )}
      {Object.entries(groupedTransactions)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([date, dateTransactions]) => {
          const dailyExpenses = getDailyExpenses(dateTransactions)
          const formattedDate = new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })

          return (
            <div key={date} className="date-group">
              <div className="date-header">
                <span className="date-text">{formattedDate}</span>
                <div className="date-header-right">
                  {dailyExpenses > 0 && (
                    <span className="daily-expenses">
                      Daily Expenses: ₹{dailyExpenses.toLocaleString()}
                    </span>
                  )}
                  {Object.keys(groupedTransactions).indexOf(date) === 0 && (
                    <AddButton viewMode={viewMode} onClick={onAddClick} />
                  )}
                </div>
              </div>
              {dateTransactions.map((transaction, index) => (
                <TransactionItem 
                  key={transaction.id || index} 
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDeleteRequest={onDeleteRequest}
                  onDuplicate={onDuplicate}
                />
              ))}
            </div>
          )
        })}
    </div>
  )
}

export default TransactionList

