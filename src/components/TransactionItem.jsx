import React from 'react'
import SwipeableItem from './SwipeableItem'
import './TransactionItem.css'

const categoryIcons = {
  'Basic': '🍴',
  'Enjoyment': '🛒',
  'Health Care': '🏥',
  'Give': '💝',
  'Others': '📦',
  'Salary': '💰',
  'Food': '🍴',
  'Transport': '🏍️',
  'Shopping': '🛒'
}

function TransactionItem({ transaction, onEdit, onDelete }) {
  const isExpense = transaction.type === 'expense'
  const amountClass = isExpense ? 'amount expense' : 'amount income'
  const displayAmount = isExpense 
    ? `-₹${transaction.amount.toLocaleString()}`
    : `₹${transaction.amount.toLocaleString()}`

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(transaction)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
      onDelete(transaction.id)
    }
  }

  return (
    <SwipeableItem
      onSwipeLeft={handleDelete}
      onSwipeRight={handleEdit}
      onEdit={handleEdit}
      onDelete={handleDelete}
    >
      <div className="transaction-item">
        <div className="transaction-icon">
          {categoryIcons[transaction.category] || '📝'}
        </div>
        <div className="transaction-details">
          <div className="transaction-description">{transaction.description}</div>
          {transaction.paymentMode && (
            <div className="transaction-payment-mode">
              {transaction.paymentMode}
            </div>
          )}
        </div>
        <div className="transaction-actions">
          <div className={amountClass}>{displayAmount}</div>
          <div className="action-buttons">
            <button className="edit-btn" onClick={handleEdit} title="Edit">
              ✏️
            </button>
            <button className="delete-btn" onClick={handleDelete} title="Delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </SwipeableItem>
  )
}

export default TransactionItem

