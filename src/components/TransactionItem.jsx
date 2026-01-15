import React from 'react'
import SwipeableItem from './SwipeableItem'
import { getTransactionAriaLabel } from '../utils/accessibility'
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

function TransactionItem({ transaction, onEdit, onDelete, onDuplicate, onDeleteRequest }) {
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
    if (onDeleteRequest) {
      onDeleteRequest(transaction)
    } else if (onDelete) {
      onDelete(transaction.id)
    }
  }

  const handleDuplicate = (e) => {
    e.stopPropagation()
    if (onDuplicate) {
      onDuplicate(transaction)
    }
  }

  const ariaLabel = getTransactionAriaLabel(transaction)

  return (
    <SwipeableItem
      onSwipeLeft={handleDelete}
      onSwipeRight={handleEdit}
      onEdit={handleEdit}
      onDelete={handleDelete}
    >
      <div 
        className="transaction-item"
        role="article"
        aria-label={ariaLabel}
      >
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
            <button 
              className="duplicate-btn" 
              onClick={handleDuplicate} 
              title="Duplicate"
              aria-label={`Duplicate ${transaction.description}`}
            >
              📋
            </button>
            <button 
              className="edit-btn" 
              onClick={handleEdit} 
              title="Edit"
              aria-label={`Edit ${transaction.description}`}
            >
              ✏️
            </button>
            <button 
              className="delete-btn" 
              onClick={handleDelete} 
              title="Delete"
              aria-label={`Delete ${transaction.description}`}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </SwipeableItem>
  )
}

export default TransactionItem

