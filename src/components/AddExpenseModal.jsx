import React, { useState } from 'react'
import './AddExpenseModal.css'

const expenseCategories = ['Grocery', 'Entertainment', 'Transport', 'Health Care', 'Shopping', 'Food', 'Bills', 'Others']
const incomeCategories = ['Salary', 'Rent Payment', 'Get Commission', 'Other Add Income Type']
const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']

function AddExpenseModal({ isOpen, onClose, onSubmit, viewMode, editTransaction = null }) {
  const categories = viewMode === 'expenses' ? expenseCategories : incomeCategories
  const creditTypes = ['BORROWED', 'LENT']
  const isEditMode = !!editTransaction
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMode: 'Cash',
    category: '',
    customCategory: '',
    note: '',
    creditType: 'BORROWED',
    personName: ''
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  // Populate form when editing
  React.useEffect(() => {
    if (editTransaction && isOpen) {
      if (viewMode === 'credits') {
        setFormData({
          date: editTransaction.date || new Date().toISOString().split('T')[0],
          amount: editTransaction.amount || '',
          creditType: editTransaction.creditType?.toUpperCase() || 'BORROWED',
          personName: editTransaction.personName || '',
          note: editTransaction.note || '',
          paymentMode: 'Cash',
          category: '',
          customCategory: ''
        })
      } else {
        const category = editTransaction.category || ''
        const isCustomCategory = !categories.includes(category)
        setFormData({
          date: editTransaction.date || new Date().toISOString().split('T')[0],
          amount: editTransaction.amount || '',
          paymentMode: editTransaction.paymentMode || 'Cash',
          category: isCustomCategory ? (viewMode === 'expenses' ? 'Custom' : 'Other Add Income Type') : category,
          customCategory: isCustomCategory ? category : '',
          note: editTransaction.note || '',
          creditType: 'BORROWED',
          personName: ''
        })
        setShowCustomCategory(isCustomCategory)
      }
    } else if (!editTransaction && isOpen) {
      // Reset form for new entry
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMode: 'Cash',
        category: '',
        customCategory: '',
        note: '',
        creditType: 'BORROWED',
        personName: ''
      })
      setShowCustomCategory(false)
    }
  }, [editTransaction, isOpen, viewMode, categories])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'category' && value === 'Other Add Income Type') {
      setShowCustomCategory(true)
    } else if (name === 'category' && value === 'Custom') {
      setShowCustomCategory(true)
    } else if (name === 'category' && value !== 'Custom' && value !== 'Other Add Income Type') {
      setShowCustomCategory(false)
      setFormData(prev => ({ ...prev, customCategory: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (viewMode === 'credits') {
      if (!formData.amount || !formData.personName || !formData.creditType) {
        alert('Please fill in all required fields')
        return
      }
      
      onSubmit({
        ...formData,
        type: 'credit',
        creditType: formData.creditType.toLowerCase(),
        amount: parseFloat(formData.amount),
        id: isEditMode ? editTransaction.id : undefined,
        date: formData.date
      })
    } else {
      let finalCategory = formData.category
      if (formData.category === 'Custom' || formData.category === 'Other Add Income Type') {
        if (!formData.customCategory) {
          alert('Please enter the category name')
          return
        }
        finalCategory = formData.customCategory
      }
      
      if (!formData.amount || !finalCategory) {
        alert('Please fill in all required fields')
        return
      }

      onSubmit({
        ...formData,
        category: finalCategory,
        type: viewMode === 'expenses' ? 'expense' : 'income',
        amount: parseFloat(formData.amount),
        id: isEditMode ? editTransaction.id : undefined
      })
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      paymentMode: 'Cash',
      category: '',
      customCategory: '',
      note: '',
      creditType: 'Borrowed',
      personName: ''
    })
    setShowCustomCategory(false)
    onClose()
  }

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      paymentMode: 'Cash',
      category: '',
      customCategory: '',
      note: '',
      creditType: 'Borrowed',
      personName: ''
    })
    setShowCustomCategory(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode 
              ? (viewMode === 'expenses' ? 'Edit Expense' : viewMode === 'income' ? 'Edit Income' : 'Edit Credit')
              : (viewMode === 'expenses' ? 'Add Expense' : viewMode === 'income' ? 'Add Income' : 'Add Credit')
            }
          </h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {viewMode === 'credits' && (
            <div className="form-group">
              <label htmlFor="creditType">Credit Type</label>
              <select
                id="creditType"
                name="creditType"
                value={formData.creditType}
                onChange={handleChange}
                required
                className="form-input"
              >
                {creditTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'credits' && (
            <div className="form-group">
              <label htmlFor="personName">Person Name</label>
              <input
                type="text"
                id="personName"
                name="personName"
                value={formData.personName}
                onChange={handleChange}
                placeholder={formData.creditType === 'Borrowed' ? 'Who did you borrow from?' : 'Who did you lend to?'}
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              required
              min="0"
              step="0.01"
              className="form-input"
            />
          </div>

          {viewMode !== 'credits' && (
            <div className="form-group">
              <label htmlFor="paymentMode">Payment Mode</label>
              <select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="form-input"
              >
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
          )}

          {viewMode !== 'credits' && (
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {viewMode === 'expenses' && (
                  <option value="Custom">Add New Category</option>
                )}
              </select>
            </div>
          )}

          {showCustomCategory && viewMode !== 'credits' && (
            <div className="form-group">
              <label htmlFor="customCategory">
                {viewMode === 'expenses' ? 'New Category Name' : 'Add Income Type'}
              </label>
              <input
                type="text"
                id="customCategory"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder={viewMode === 'expenses' ? 'Enter new category name' : 'Enter income type'}
                required={showCustomCategory}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="note">Note (Optional)</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Add a note..."
              rows="3"
              className="form-input form-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExpenseModal

