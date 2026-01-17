import React, { useState, useEffect } from 'react'
import './AddPartyModal.css'

function AddPartyModal({ isOpen, onClose, onSubmit, editParty = null }) {
  const isEditMode = !!editParty

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    openingBalance: '0',
    notes: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editParty && isOpen) {
      setFormData({
        name: editParty.name || '',
        contact: editParty.contact || '',
        openingBalance: editParty.openingBalance?.toString() || '0',
        notes: editParty.notes || ''
      })
    } else if (!editParty && isOpen) {
      setFormData({
        name: '',
        contact: '',
        openingBalance: '0',
        notes: ''
      })
    }
    setErrors({})
  }, [editParty, isOpen])

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
    if (!formData.name.trim()) {
      newErrors.name = 'Party name is required'
    }
    if (formData.openingBalance && isNaN(parseFloat(formData.openingBalance))) {
      newErrors.openingBalance = 'Opening balance must be a number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const submitData = {
      name: formData.name.trim(),
      contact: formData.contact.trim() || undefined,
      openingBalance: parseFloat(formData.openingBalance) || 0,
      notes: formData.notes.trim() || undefined
    }

    onSubmit(submitData)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content party-modal" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Party' : 'Add New Party'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="party-form"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="form-group">
            <label htmlFor="name">Party Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Mohit Granite, Sri Ram Marble"
              className={errors.name ? 'error' : ''}
              autoComplete="off"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone number or email"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="openingBalance">Opening Balance</label>
            <input
              type="number"
              id="openingBalance"
              name="openingBalance"
              value={formData.openingBalance}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              className={errors.openingBalance ? 'error' : ''}
            />
            {errors.openingBalance && <span className="error-message">{errors.openingBalance}</span>}
            <small className="form-hint">Enter positive if you owe, negative if party owes you</small>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this party"
              rows="3"
              autoComplete="off"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {isEditMode ? 'Update Party' : 'Add Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPartyModal

