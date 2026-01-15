// Accessibility Utilities

/**
 * Generate ARIA label for transaction item
 */
export const getTransactionAriaLabel = (transaction) => {
  const type = transaction.type === 'expense' ? 'expense' : 'income'
  const amount = `₹${transaction.amount.toLocaleString()}`
  const category = transaction.category || 'uncategorized'
  const date = new Date(transaction.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  return `${type} of ${amount} in ${category} category on ${date}`
}

/**
 * Generate ARIA label for button
 */
export const getButtonAriaLabel = (action, item) => {
  return `${action} ${item || 'item'}`
}

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if element is keyboard accessible
 */
export const isKeyboardAccessible = (element) => {
  return element.tabIndex >= 0 || 
         element.tagName === 'BUTTON' || 
         element.tagName === 'A' ||
         element.getAttribute('role') === 'button'
}

/**
 * Focus management for modals
 */
export const trapFocus = (containerElement) => {
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }
  
  containerElement.addEventListener('keydown', handleTabKey)
  
  return () => {
    containerElement.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Skip to main content link
 */
export const createSkipLink = () => {
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.className = 'skip-link'
  skipLink.textContent = 'Skip to main content'
  document.body.insertBefore(skipLink, document.body.firstChild)
}

