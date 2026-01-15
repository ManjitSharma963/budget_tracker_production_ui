import React from 'react'
import './ConfirmationDialog.css'

function ConfirmationDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  onConfirm, 
  onCancel,
  showUndo = false,
  undoText = 'Undo',
  onUndo
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger': return '⚠️'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '❓'
    }
  }

  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirmation-icon ${type}`}>
          {getIcon()}
        </div>
        <h2 className="confirmation-title">{title}</h2>
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          {showUndo && onUndo && (
            <button className="confirmation-btn undo-btn" onClick={onUndo}>
              {undoText}
            </button>
          )}
          <button className="confirmation-btn cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`confirmation-btn confirm-btn ${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog

