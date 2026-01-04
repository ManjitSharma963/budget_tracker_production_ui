import React from 'react'
import './AddButton.css'

function AddButton({ viewMode, onClick }) {
  return (
    <button className="add-button" onClick={onClick} aria-label={viewMode === 'expenses' ? 'Add Expense' : 'Add Income'}>
      <span className="add-icon">+</span>
    </button>
  )
}

export default AddButton

