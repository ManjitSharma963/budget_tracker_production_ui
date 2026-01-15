import React from 'react'
import './AnimatedButton.css'

function AnimatedButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`animated-btn ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${loading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" aria-hidden="true"></span>}
      {icon && !loading && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  )
}

export default AnimatedButton

