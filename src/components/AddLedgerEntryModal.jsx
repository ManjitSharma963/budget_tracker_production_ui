import React, { useState, useEffect } from 'react'
import './AddLedgerEntryModal.css'

function AddLedgerEntryModal({ isOpen, onClose, onSubmit, party, editEntry = null, defaultType = 'purchase' }) {
  const isEditMode = !!editEntry
  const isPaymentMode = defaultType === 'payment' && !editEntry
  const entryTypes = [
    { value: 'purchase', label: 'Purchase (Credit - You Owe)' },
    { value: 'payment', label: 'Payment (Debit - You Paid)' },
    { value: 'adjustment', label: 'Adjustment' }
  ]
  const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Other']

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: defaultType,
    paymentMode: 'Cash',
    amount: '',
    description: '',
    reference: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editEntry && isOpen) {
      setFormData({
        date: editEntry.date || editEntry.transactionDate || new Date().toISOString().split('T')[0],
        type: editEntry.type || editEntry.transactionType?.toLowerCase() || defaultType,
        paymentMode: editEntry.paymentMode || 'Cash',
        amount: editEntry.amount?.toString() || '',
        description: editEntry.description || '',
        reference: editEntry.reference || editEntry.referenceNumber || ''
      })
    } else if (!editEntry && isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: defaultType,
        paymentMode: 'Cash',
        amount: '',
        description: '',
        reference: ''
      })
    }
    setErrors({})
  }, [editEntry, isOpen, defaultType])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (!isPaymentMode && !formData.type) {
      newErrors.type = 'Entry type is required'
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const submitData = {
      date: formData.date,
      type: isPaymentMode ? 'payment' : formData.type,
      paymentMode: isPaymentMode ? formData.paymentMode : undefined,
      amount: parseFloat(formData.amount),
      description: formData.description.trim() || undefined,
      reference: formData.reference.trim() || undefined
    }

    onSubmit(submitData)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ledger-entry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Ledger Entry' : isPaymentMode ? 'Add Payment' : 'Add Ledger Entry'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {party && (
          <div className="party-info-banner">
            <strong>{party.name}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ledger-entry-form">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          {!isPaymentMode && (
            <div className="form-group">
              <label htmlFor="type">Entry Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-input ${errors.type ? 'error' : ''}`}
              >
                {entryTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
              <small className="form-hint">
                {formData.type === 'purchase' && 'Increases what you owe'}
                {formData.type === 'payment' && 'Decreases what you owe'}
                {formData.type === 'adjustment' && 'Can be positive or negative'}
              </small>
            </div>
          )}

          {isPaymentMode && (
            <div className="form-group">
              <label htmlFor="paymentMode">Payment Mode *</label>
              <select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="form-input"
              >
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
            {isPaymentMode && (
              <small className="form-hint">This amount will be added to total paid and deducted from remaining amount</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Transaction description or notes"
              rows="3"
            />
          </div>

          {!isPaymentMode && (
            <div className="form-group">
              <label htmlFor="reference">Reference Number</label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Invoice number, receipt number, etc."
                autoComplete="off"
              />
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {isEditMode ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddLedgerEntryModal

