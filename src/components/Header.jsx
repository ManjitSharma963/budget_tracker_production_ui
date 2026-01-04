import React from 'react'
import './Header.css'

function Header({ darkMode, onToggleDarkMode, user, onLogout }) {
  return (
    <div className="header">
      <div className="header-left">
        <button 
          className="dark-mode-toggle"
          onClick={onToggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <h1 className="header-title">Expenses Tracker</h1>
      <div className="header-right">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {(user.email || user.username || user.name || 'User').charAt(0).toUpperCase()}
            </div>
            <button 
              className="logout-btn"
              onClick={onLogout}
              title="Logout"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header

