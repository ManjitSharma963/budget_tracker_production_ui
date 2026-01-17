import React, { useState, useEffect } from 'react'
import './SavingsGoalModal.css'

function SavingsGoalModal({ isOpen, onClose, onSubmit, editGoal = null }) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editGoal && isOpen) {
      setFormData({
        name: editGoal.name || '',
        targetAmount: editGoal.targetAmount?.toString() || '',
        currentAmount: editGoal.currentAmount?.toString() || '0',
        targetDate: editGoal.targetDate || '',
        description: editGoal.description || ''
      })
    } else if (!isOpen) {
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        description: ''
      })
      setErrors({})
    }
  }, [isOpen, editGoal])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required'
    }
    
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0'
    }
    
    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const goalData = {
      name: formData.name.trim(),
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount || 0),
      targetDate: formData.targetDate || null,
      description: formData.description.trim() || null
    }

    if (editGoal) {
      goalData.id = editGoal.id
      onSubmit({ action: 'update', ...goalData })
    } else {
      onSubmit({ action: 'create', ...goalData })
    }

    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: '',
      description: ''
    })
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content savings-goal-modal" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{editGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="modal-form"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="form-group">
            <label htmlFor="name">Goal Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Vacation, Emergency Fund, New Car"
              className={`form-input ${errors.name ? 'error' : ''}`}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="targetAmount">Target Amount (₹) *</label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="e.g., 50000"
              min="0"
              step="0.01"
              className={`form-input ${errors.targetAmount ? 'error' : ''}`}
              required
            />
            {errors.targetAmount && <span className="error-message">{errors.targetAmount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="currentAmount">Current Amount (₹)</label>
            <input
              type="number"
              id="currentAmount"
              name="currentAmount"
              value={formData.currentAmount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.01"
              className={`form-input ${errors.currentAmount ? 'error' : ''}`}
            />
            {errors.currentAmount && <span className="error-message">{errors.currentAmount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">Target Date (Optional)</label>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes about this goal..."
              rows="3"
              className="form-input form-textarea"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SavingsGoalModal

