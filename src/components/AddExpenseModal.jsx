import React, { useState } from 'react'
import './AddExpenseModal.css'

const expenseCategories = ['Grocery', 'Entertainment', 'Transport', 'Health Care', 'Shopping', 'Food', 'Bills', 'Others']
const incomeCategories = ['Salary', 'Rent Payment', 'Get Commission', 'Other Add Income Type']
const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']

// Smart category detection based on keywords
const detectCategory = (text) => {
  if (!text) return null
  
  const lowerText = text.toLowerCase()
  
  // Food & Beverages
  const foodKeywords = ['milk', 'bread', 'rice', 'wheat', 'flour', 'sugar', 'tea', 'coffee', 'juice', 'water', 'coke', 'pepsi', 'soda', 'snacks', 'chips', 'biscuit', 'chocolate', 'fruit', 'vegetable', 'meat', 'chicken', 'fish', 'egg', 'cheese', 'butter', 'oil', 'spice', 'salt', 'pepper', 'restaurant', 'dining', 'lunch', 'dinner', 'breakfast', 'food', 'meal']
  if (foodKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Food'
  }
  
  // Transport
  const transportKeywords = ['petrol', 'diesel', 'gas', 'fuel', 'uber', 'ola', 'taxi', 'bus', 'train', 'metro', 'auto', 'rickshaw', 'parking', 'toll', 'ticket', 'fare', 'transport', 'travel', 'flight', 'airport', 'cab', 'driver']
  if (transportKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Transport'
  }
  
  // Bills & Utilities
  const billsKeywords = ['electricity', 'electric', 'power', 'bill', 'water bill', 'gas bill', 'internet', 'wifi', 'broadband', 'phone', 'mobile', 'telephone', 'landline', 'utility', 'utilities', 'maintenance', 'rent', 'house rent', 'apartment']
  if (billsKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Bills'
  }
  
  // Grocery
  const groceryKeywords = ['grocery', 'supermarket', 'mart', 'store', 'shop', 'buy', 'purchase', 'shopping', 'market']
  if (groceryKeywords.some(keyword => lowerText.includes(keyword)) && !lowerText.includes('online')) {
    return 'Grocery'
  }
  
  // Shopping
  const shoppingKeywords = ['shopping', 'mall', 'online', 'amazon', 'flipkart', 'clothes', 'dress', 'shirt', 'pant', 'shoe', 'watch', 'gadget', 'phone', 'laptop', 'electronics', 'appliance']
  if (shoppingKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Shopping'
  }
  
  // Health Care
  const healthKeywords = ['medicine', 'pharmacy', 'doctor', 'hospital', 'clinic', 'medical', 'health', 'checkup', 'test', 'lab', 'prescription', 'tablet', 'syrup', 'vitamin', 'supplement']
  if (healthKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Health Care'
  }
  
  // Entertainment
  const entertainmentKeywords = ['movie', 'cinema', 'theater', 'netflix', 'prime', 'hotstar', 'streaming', 'game', 'gaming', 'concert', 'show', 'event', 'party', 'celebration', 'entertainment', 'fun']
  if (entertainmentKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Entertainment'
  }
  
  return null
}

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
  const [autoDetectedCategory, setAutoDetectedCategory] = useState(null)

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
      setAutoDetectedCategory(null)
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
      setAutoDetectedCategory(null)
    }
  }, [editTransaction, isOpen, viewMode, categories])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Smart category detection when note is entered
    if (name === 'note' && value && viewMode === 'expenses') {
      const detectedCategory = detectCategory(value)
      if (detectedCategory && categories.includes(detectedCategory)) {
        // Only auto-select if category is not already set, or if user hasn't manually selected one
        if (!formData.category || formData.category === '') {
          setFormData(prev => ({
            ...prev,
            category: detectedCategory
          }))
          setAutoDetectedCategory(detectedCategory)
        } else {
          // Show suggestion even if category is already set
          setAutoDetectedCategory(detectedCategory)
        }
      } else {
        setAutoDetectedCategory(null)
      }
    } else if (name === 'category') {
      // Clear auto-detected indicator when user manually selects category
      setAutoDetectedCategory(null)
    }
    
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
    setAutoDetectedCategory(null)
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
    setAutoDetectedCategory(null)
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
              <label htmlFor="category">
                Category
                {autoDetectedCategory && formData.category === autoDetectedCategory && (
                  <span style={{ fontSize: '12px', color: '#14b8a6', marginLeft: '8px', fontWeight: 'normal' }}>
                    (Auto-detected)
                  </span>
                )}
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-input"
                style={autoDetectedCategory && formData.category === autoDetectedCategory ? { borderColor: '#14b8a6' } : {}}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {viewMode === 'expenses' && (
                  <option value="Custom">Add New Category</option>
                )}
              </select>
              {autoDetectedCategory && formData.category !== autoDetectedCategory && (
                <div style={{ fontSize: '12px', color: '#14b8a6', marginTop: '4px' }}>
                  💡 Suggested: {autoDetectedCategory}
                </div>
              )}
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

