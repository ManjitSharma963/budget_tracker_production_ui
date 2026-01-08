import React, { useState, useRef, useEffect } from 'react'
import './BurgerMenu.css'

function BurgerMenu({ viewMode, setViewMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'income', label: 'Income', icon: '💰' },
    { id: 'credits', label: 'Credits', icon: '💳' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'parties', label: 'Parties', icon: '🏢' }
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleItemClick = (itemId) => {
    setViewMode(itemId)
    setIsOpen(false)
  }

  const currentItem = menuItems.find(item => item.id === viewMode) || menuItems[0]

  return (
    <div className="burger-menu-container" ref={menuRef}>
      <button
        className={`burger-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      {isOpen && (
        <div className="burger-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-title">Navigation</span>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <div className="dropdown-items">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`dropdown-item ${viewMode === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-label">{item.label}</span>
                {viewMode === item.id && <span className="item-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current view indicator */}
      <div className="current-view-indicator">
        <span className="current-icon">{currentItem.icon}</span>
        <span className="current-label">{currentItem.label}</span>
      </div>
    </div>
  )
}

export default BurgerMenu

