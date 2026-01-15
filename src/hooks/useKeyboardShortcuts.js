import { useEffect } from 'react'

export const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        // Allow Escape to close modals even when typing
        if (e.key === 'Escape') {
          handlers.onClose?.()
        }
        return
      }

      // Ctrl/Cmd + K - Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handlers.onSearch?.()
      }
      
      // Ctrl/Cmd + N - Add new expense/transaction
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handlers.onAddNew?.()
      }

      // Ctrl/Cmd + / - Show keyboard shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        handlers.onShowHelp?.()
      }
      
      // Escape - Close modal
      if (e.key === 'Escape') {
        handlers.onClose?.()
      }

      // Arrow keys for navigation (if handler provided)
      if (e.key === 'ArrowDown' && handlers.onArrowDown) {
        e.preventDefault()
        handlers.onArrowDown()
      }
      if (e.key === 'ArrowUp' && handlers.onArrowUp) {
        e.preventDefault()
        handlers.onArrowUp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}

