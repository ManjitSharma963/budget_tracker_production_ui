import React, { useState, useMemo, useCallback } from 'react'
import { sanitizeInput, sanitizeAmount, sanitizeDate, validateFileType, validateFileSize, sanitizeFileName } from '../utils/security'
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

function AddExpenseModal({ isOpen, onClose, onSubmit, viewMode, editTransaction = null, recentCategories = [], templates = [] }) {
  const allCategories = viewMode === 'expenses' ? expenseCategories : incomeCategories
  
  // Show recent categories first, then others
  const categories = [
    ...(recentCategories || []).filter(cat => allCategories.includes(cat)),
    ...allCategories.filter(cat => !(recentCategories || []).includes(cat))
  ]
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
    personName: '',
    isRecurring: false,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tags: [],
    splitWith: [],
    receiptImage: null
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [autoDetectedCategory, setAutoDetectedCategory] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)

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
          customCategory: '',
          tags: [],
          splitWith: [],
          receiptImage: null
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
          personName: '',
          isRecurring: false,
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          tags: editTransaction.tags || [],
          splitWith: editTransaction.splitWith || [],
          receiptImage: editTransaction.receiptImage || null
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
        personName: '',
        isRecurring: false,
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        tags: [],
        splitWith: [],
        receiptImage: null
      })
      setShowCustomCategory(false)
      setAutoDetectedCategory(null)
    }
  }, [editTransaction, isOpen, viewMode, categories])

  // Focus trap for accessibility
  React.useEffect(() => {
    if (isOpen) {
      const modal = document.querySelector('.modal-content')
      if (modal) {
        const firstInput = modal.querySelector('input, select, textarea, button')
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 100)
        }
      }
    }
  }, [isOpen])

  // Early return AFTER all hooks - this is critical for React Hooks rules
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

      const submitData = {
        ...formData,
        category: finalCategory,
        type: viewMode === 'expenses' ? 'expense' : 'income',
        amount: parseFloat(formData.amount),
        id: isEditMode ? editTransaction.id : undefined,
        isRecurring: formData.isRecurring,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null
      }
      
      onSubmit(submitData)
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
      personName: '',
      isRecurring: false,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      tags: [],
      splitWith: [],
      receiptImage: null
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
      personName: '',
      isRecurring: false,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      tags: [],
      splitWith: [],
      receiptImage: null
    })
    setShowCustomCategory(false)
    setAutoDetectedCategory(null)
    onClose()
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
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
          {/* Quick Add Templates */}
          {!isEditMode && templates && templates.length > 0 && viewMode !== 'credits' && (
            <div className="quick-add-section">
              <div className="quick-add-header">
                <label>Quick Add from Templates</label>
                <button 
                  type="button"
                  className="toggle-templates-btn"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  {showTemplates ? '▼' : '▶'}
                </button>
              </div>
              {showTemplates && (
                <div className="templates-grid">
                  {(templates || []).map(template => (
                    <button
                      key={template.id}
                      type="button"
                      className="template-btn"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          amount: template.amount.toString(),
                          category: template.category,
                          paymentMode: template.paymentMode || 'Cash',
                          note: template.note || ''
                        })
                        setShowTemplates(false)
                      }}
                    >
                      <div className="template-name">{template.name}</div>
                      <div className="template-amount">₹{template.amount.toLocaleString()}</div>
                      <div className="template-category">{template.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {/* Tags */}
          {viewMode !== 'credits' && (
            <div className="form-group">
              <label htmlFor="tags">Tags (Optional)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags ? formData.tags.join(', ') : ''}
                onChange={(e) => {
                  const tagString = e.target.value
                  const tags = tagString.split(',').map(t => t.trim()).filter(t => t)
                  setFormData(prev => ({ ...prev, tags }))
                }}
                placeholder="e.g., business, personal, urgent (comma separated)"
                className="form-input"
              />
              {formData.tags && formData.tags.length > 0 && (
                <div className="tags-display">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="tag-badge">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== idx)
                          }))
                        }}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Expense Splitting */}
          {viewMode === 'expenses' && !isEditMode && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.splitWith && formData.splitWith.length > 0}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, splitWith: [] }))
                    }
                  }}
                  className="checkbox-input"
                />
                <span>Split this expense</span>
              </label>
              {formData.splitWith && formData.splitWith.length > 0 && (
                <div className="split-section">
                  <div className="split-input-group">
                    <input
                      type="text"
                      placeholder="Person name"
                      className="split-person-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const personName = e.target.value.trim()
                          if (personName && (!formData.splitWith || !formData.splitWith.includes(personName))) {
                            setFormData(prev => ({
                              ...prev,
                              splitWith: [...(prev.splitWith || []), personName]
                            }))
                            e.target.value = ''
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="add-split-btn"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling
                        const personName = input.value.trim()
                        if (personName && (!formData.splitWith || !formData.splitWith.includes(personName))) {
                          setFormData(prev => ({
                            ...prev,
                            splitWith: [...(prev.splitWith || []), personName]
                          }))
                          input.value = ''
                        }
                      }}
                    >
                      + Add
                    </button>
                  </div>
                  {formData.splitWith && formData.splitWith.length > 0 && (
                    <div className="split-people-list">
                      <div className="split-info">
                        Split among {formData.splitWith.length + 1} people (you + {formData.splitWith.length} others)
                        <br />
                        <small>Each person: ₹{formData.amount ? (parseFloat(formData.amount) / (formData.splitWith.length + 1)).toFixed(2) : '0.00'}</small>
                      </div>
                      <div className="split-tags">
                        {formData.splitWith.map((person, idx) => (
                          <span key={idx} className="split-tag">
                            {person}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  splitWith: (prev.splitWith || []).filter((_, i) => i !== idx)
                                }))
                              }}
                              className="split-remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Receipt/Image Attachment */}
          {viewMode !== 'credits' && (
            <div className="form-group">
              <label htmlFor="receipt">Receipt/Image (Optional)</label>
              <input
                type="file"
                id="receipt"
                name="receipt"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    // Convert to base64 for storage
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setFormData(prev => ({
                        ...prev,
                        receiptImage: reader.result
                      }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="form-input file-input"
              />
              {formData.receiptImage && (
                <div className="receipt-preview">
                  <img src={formData.receiptImage} alt="Receipt preview" className="receipt-image" />
                  <button
                    type="button"
                    className="remove-receipt-btn"
                    onClick={() => setFormData(prev => ({ ...prev, receiptImage: null }))}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recurring Options - Only for expenses and income, not credits */}
          {viewMode !== 'credits' && !isEditMode && (
            <>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="checkbox-input"
                  />
                  <span>Make this recurring</span>
                </label>
              </div>

              {formData.isRecurring && (
                <div className="recurring-options">
                  <div className="form-group">
                    <label htmlFor="frequency">Frequency *</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      required={formData.isRecurring}
                      className="form-input"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="startDate">Start Date *</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required={formData.isRecurring}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">End Date (Optional)</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="form-input"
                    />
                    <small className="form-hint">Leave empty for no end date</small>
                  </div>
                </div>
              )}
            </>
          )}

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

