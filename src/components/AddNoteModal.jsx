import React, { useState, useEffect } from 'react'
import './AddNoteModal.css'

function AddNoteModal({ isOpen, onClose, onSubmit, editNote = null }) {
  const isEditMode = !!editNote
  
  const [formData, setFormData] = useState({
    title: '',
    note: ''
  })

  useEffect(() => {
    if (editNote && isOpen) {
      setFormData({
        title: editNote.title || '',
        note: editNote.note || ''
      })
    } else if (!editNote && isOpen) {
      setFormData({
        title: '',
        note: ''
      })
    }
  }, [editNote, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title && !formData.note) {
      alert('Please fill in at least Title or Note')
      return
    }
    
    onSubmit({
      ...formData,
      id: editNote?.id,
      type: 'note'
    })
    
    // Reset form
    setFormData({
      title: '',
      note: ''
    })
    onClose()
  }

  const handleClose = () => {
    setFormData({
      title: '',
      note: ''
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ pointerEvents: 'auto' }}>
      <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Note' : 'Add New Note'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Gmail Account, Bank Login"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="form-input textarea-input"
              placeholder="Additional notes or information..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddNoteModal

