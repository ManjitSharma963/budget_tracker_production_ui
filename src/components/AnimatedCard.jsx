import React from 'react'
import './AnimatedCard.css'

function AnimatedCard({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props
}) {
  return (
    <div 
      className={`animated-card ${hover ? 'hover-effect' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export default AnimatedCard

