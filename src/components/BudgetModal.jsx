import React, { useState, useEffect } from 'react'
import './BudgetModal.css'

function BudgetModal({ isOpen, onClose, onSubmit, budgets = [], monthlyIncome = 0, editBudget = null }) {
  const [formData, setFormData] = useState({
    category: '',
    budgetType: 'fixed', // 'fixed' or 'percentage'
    amount: '',
    percentage: '',
    period: 'monthly' // 'monthly' or 'yearly'
  })
  const [errors, setErrors] = useState({})
  const [editingBudget, setEditingBudget] = useState(null)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')

  const expenseCategories = ['Grocery', 'Entertainment', 'Transport', 'Health Care', 'Shopping', 'Food', 'Bills', 'Others']
  
  // Get all unique categories from existing budgets (including custom ones)
  const getAllCategories = () => {
    const budgetCategories = (budgets || []).map(b => b.category).filter(Boolean)
    const allCategories = [...new Set([...expenseCategories, ...budgetCategories])].sort()
    return allCategories
  }

  useEffect(() => {
    if (editBudget && isOpen) {
      setEditingBudget(editBudget)
      const isCustomCategory = !expenseCategories.includes(editBudget.category)
      setShowCustomCategory(isCustomCategory)
      setCustomCategory(isCustomCategory ? editBudget.category : '')
      setFormData({
        category: isCustomCategory ? 'Custom' : editBudget.category || '',
        budgetType: editBudget.budgetType || 'fixed',
        amount: editBudget.amount?.toString() || '',
        percentage: editBudget.percentage?.toString() || '',
        period: editBudget.period || 'monthly'
      })
    } else if (!isOpen) {
      setFormData({
        category: '',
        budgetType: 'fixed',
        amount: '',
        percentage: '',
        period: 'monthly'
      })
      setEditingBudget(null)
      setErrors({})
      setShowCustomCategory(false)
      setCustomCategory('')
    }
  }, [isOpen, editBudget])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Handle category selection
    if (name === 'category') {
      if (value === 'Custom') {
        setShowCustomCategory(true)
        setFormData(prev => ({ ...prev, category: 'Custom' }))
      } else {
        setShowCustomCategory(false)
        setCustomCategory('')
      }
    }
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Auto-calculate percentage when amount changes
    if (name === 'amount' && value && monthlyIncome > 0 && formData.budgetType === 'percentage') {
      const percentage = ((parseFloat(value) / monthlyIncome) * 100).toFixed(1)
      setFormData(prev => ({
        ...prev,
        percentage: percentage
      }))
    }

    // Auto-calculate amount when percentage changes
    if (name === 'percentage' && value && monthlyIncome > 0 && formData.budgetType === 'percentage') {
      const amount = ((parseFloat(value) / 100) * monthlyIncome).toFixed(2)
      setFormData(prev => ({
        ...prev,
        amount: amount
      }))
    }
  }

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value)
    if (errors.customCategory) {
      setErrors(prev => ({
        ...prev,
        customCategory: ''
      }))
    }
  }


  const validate = () => {
    const newErrors = {}
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (formData.category === 'Custom') {
      if (!customCategory || !customCategory.trim()) {
        newErrors.customCategory = 'Custom category name is required'
      }
    }
    
    if (formData.budgetType === 'percentage') {
      if (!formData.percentage || parseFloat(formData.percentage) <= 0 || parseFloat(formData.percentage) > 100) {
        newErrors.percentage = 'Percentage must be between 0 and 100'
      }
    } else {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    // Determine final category
    const finalCategory = formData.category === 'Custom' ? customCategory.trim() : formData.category

    const budgetData = {
      category: finalCategory,
      budgetType: formData.budgetType,
      period: formData.period,
      amount: formData.budgetType === 'fixed' ? parseFloat(formData.amount) : null,
      percentage: formData.budgetType === 'percentage' ? parseFloat(formData.percentage) : null
    }

    if (formData.budgetType === 'percentage' && monthlyIncome > 0) {
      budgetData.amount = (parseFloat(formData.percentage) / 100) * monthlyIncome
    }

    if (editingBudget) {
      budgetData.id = editingBudget.id
      onSubmit({ action: 'update', ...budgetData })
    } else {
      onSubmit({ action: 'create', ...budgetData })
    }

    // Reset form
    setFormData({
      category: '',
      budgetType: 'fixed',
      amount: '',
      percentage: '',
      period: 'monthly'
    })
    setEditingBudget(null)
    setErrors({})
    setShowCustomCategory(false)
    setCustomCategory('')
  }

  const handleCancel = () => {
    setFormData({
      category: '',
      budgetType: 'fixed',
      amount: '',
      percentage: '',
      period: 'monthly'
    })
    setEditingBudget(null)
    setErrors({})
    setShowCustomCategory(false)
    setCustomCategory('')
  }

  if (!isOpen) return null

  const availableCategories = getAllCategories().filter(cat => 
    !(budgets || []).some(b => b.category === cat && b.id !== editingBudget?.id)
  )

  return (
    <div className="modal-overlay" onClick={onClose} style={{ pointerEvents: 'auto' }}>
      <div className="modal-content budget-modal" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
        <div className="modal-header">
          <h2>{editingBudget ? 'Edit Budget' : 'Add Budget'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-input ${errors.category ? 'error' : ''}`}
              required
              disabled={!!editingBudget && !expenseCategories.includes(editingBudget.category)}
            >
              <option value="">Select Category</option>
              {editingBudget && !expenseCategories.includes(editingBudget.category) ? (
                <option value={editingBudget.category}>{editingBudget.category}</option>
              ) : (
                <>
                  {getAllCategories().filter(cat => 
                    !(budgets || []).some(b => b.category === cat && b.id !== editingBudget?.id)
                  ).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">+ Add New Category</option>
                </>
              )}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {showCustomCategory && (
            <div className="form-group">
              <label htmlFor="customCategory">New Category Name *</label>
              <input
                type="text"
                id="customCategory"
                name="customCategory"
                value={customCategory}
                onChange={handleCustomCategoryChange}
                placeholder="e.g., Utilities, Education, Travel"
                className={`form-input ${errors.customCategory ? 'error' : ''}`}
                required={showCustomCategory}
              />
              {errors.customCategory && <span className="error-message">{errors.customCategory}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="budgetType">Budget Type *</label>
            <select
              id="budgetType"
              name="budgetType"
              value={formData.budgetType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage of Income</option>
            </select>
          </div>

          {formData.budgetType === 'percentage' && monthlyIncome > 0 && (
            <div className="form-group">
              <label htmlFor="percentage">Percentage (%) *</label>
              <input
                type="number"
                id="percentage"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="e.g., 10"
                min="0"
                max="100"
                step="0.1"
                className={`form-input ${errors.percentage ? 'error' : ''}`}
                required={formData.budgetType === 'percentage'}
              />
              {formData.percentage && (
                <div className="form-hint">
                  = ₹{((parseFloat(formData.percentage) || 0) / 100 * monthlyIncome).toLocaleString('en-IN', { maximumFractionDigits: 2 })} per month
                </div>
              )}
              {errors.percentage && <span className="error-message">{errors.percentage}</span>}
            </div>
          )}

          {formData.budgetType === 'fixed' && (
            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 20000"
                min="0"
                step="0.01"
                className={`form-input ${errors.amount ? 'error' : ''}`}
                required={formData.budgetType === 'fixed'}
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="period">Period *</label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="form-input"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingBudget ? 'Update Budget' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BudgetModal

