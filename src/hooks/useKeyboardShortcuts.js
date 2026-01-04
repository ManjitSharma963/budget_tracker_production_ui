import { useEffect } from 'react'

export const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K - Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handlers.onSearch?.()
      }
      
      // Ctrl/Cmd + N - Add new
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handlers.onAddNew?.()
      }
      
      // Escape - Close modal
      if (e.key === 'Escape') {
        handlers.onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}

