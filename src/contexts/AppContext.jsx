import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState({ isOpen: false })
  const [lastDeletedItem, setLastDeletedItem] = useState(null)

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ isVisible: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, duration)
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  const showConfirmation = useCallback((config) => {
    setConfirmationDialog({ isOpen: true, ...config })
  }, [])

  const hideConfirmation = useCallback(() => {
    setConfirmationDialog({ isOpen: false })
  }, [])

  const value = {
    toast,
    showToast,
    hideToast,
    isLoading,
    setIsLoading,
    confirmationDialog,
    showConfirmation,
    hideConfirmation,
    lastDeletedItem,
    setLastDeletedItem
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

