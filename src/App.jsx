import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import BurgerMenu from './components/BurgerMenu'
import PieChart from './components/PieChart'
import TransactionList from './components/TransactionList'
import CreditsList from './components/CreditsList'
import NotesList from './components/NotesList'
import TasksList from './components/TasksList'
import PartyList from './components/PartyList'
import PartyLedger from './components/PartyLedger'
import PartyDetailsModal from './components/PartyDetailsModal'
import Dashboard from './components/Dashboard'
import AddExpenseModal from './components/AddExpenseModal'
import AddNoteModal from './components/AddNoteModal'
import AddTaskModal from './components/AddTaskModal'
import AddPartyModal from './components/AddPartyModal'
import AddLedgerEntryModal from './components/AddLedgerEntryModal'
import BudgetModal from './components/BudgetModal'
import BudgetList from './components/BudgetList'
import SavingsGoalsList from './components/SavingsGoalsList'
import SavingsGoalModal from './components/SavingsGoalModal'
import ComparisonChart from './components/ComparisonChart'
import CategoryInsights from './components/CategoryInsights'
import SpendingForecast from './components/SpendingForecast'
import LoadingSkeleton from './components/LoadingSkeleton'
import ConfirmationDialog from './components/ConfirmationDialog'
import EmptyState from './components/EmptyState'
import SearchBar from './components/SearchBar'
import MonthlySummary from './components/MonthlySummary'
import StatisticsCards from './components/StatisticsCards'
import Toast from './components/Toast'
import { expensesAPI, incomeAPI, creditsAPI, notesAPI, partiesAPI, ledgerAPI, tasksAPI, budgetsAPI, recurringAPI, templatesAPI, savingsGoalsAPI } from './services/api'
import { requestNotificationPermission, scheduleAllTaskReminders } from './services/notifications'
import { mapExpenseFromAPI, mapExpenseToAPI, mapIncomeFromAPI, mapIncomeToAPI, mapCreditFromAPI, mapCreditToAPI } from './utils/dataMapper'
import { exportTransactionsToCSV, exportCreditsToCSV } from './utils/csvExport'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { login, register, logout, getCurrentUser, getAuthToken } from './services/auth'
import './App.css'
import './theme/dark.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const [viewMode, setViewMode] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTransaction, setEditTransaction] = useState(null)
  const [editNote, setEditNote] = useState(null)
  const [editTask, setEditTask] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [credits, setCredits] = useState([])
  const [notes, setNotes] = useState([])
  const [tasks, setTasks] = useState([])
  const [parties, setParties] = useState([])
  const [budgets, setBudgets] = useState([])
  const [recurringItems, setRecurringItems] = useState([])
  const [selectedParty, setSelectedParty] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false)
  const [isPartyDetailsModalOpen, setIsPartyDetailsModalOpen] = useState(false)
  const [isLedgerEntryModalOpen, setIsLedgerEntryModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [expensesViewTab, setExpensesViewTab] = useState('expenses') // 'expenses' or 'budgets'
  const [editParty, setEditParty] = useState(null)
  const [editLedgerEntry, setEditLedgerEntry] = useState(null)
  const [ledgerEntryType, setLedgerEntryType] = useState('purchase') // Default to purchase
  const [showPartyLedger, setShowPartyLedger] = useState(false) // Track if showing party ledger view
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showMonthlySummary, setShowMonthlySummary] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [amountRange, setAmountRange] = useState({ min: null, max: null })
  const [filterPresets, setFilterPresets] = useState([])
  const [expenseTemplates, setExpenseTemplates] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false)
  const [editSavingsGoal, setEditSavingsGoal] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const [darkMode, setDarkMode] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState({ isOpen: false })
  const [lastDeletedItem, setLastDeletedItem] = useState(null)

  // Check if user is already authenticated on mount
  useEffect(() => {
    // Request notification permission on app load
    requestNotificationPermission()
  }, [])

  // Schedule task reminders when tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      scheduleAllTaskReminders(tasks)
    }
  }, [tasks])

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const userData = await getCurrentUser()
          if (userData) {
            setUser({ email: userData.email || userData.username || 'User' })
            setIsAuthenticated(true)
          } else {
            // Token invalid, remove it
            logout()
          }
        } catch (err) {
          console.error('Auth check failed:', err)
          logout()
        }
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  // Helper to extract data from paginated or non-paginated responses
  const extractData = (data) => {
    if (!data) return []
    // Check if it's a paginated response (has 'content' property)
    if (data.content && Array.isArray(data.content)) {
      return data.content
    }
    // Otherwise, check if it's already an array
    if (Array.isArray(data)) {
      return data
    }
    return []
  }

  // Fetch data from API on component mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch expenses, income, credits, notes, tasks, parties, budgets, recurring items, templates, and savings goals in parallel
        const [expensesData, incomeData, creditsData, notesData, tasksData, partiesData, budgetsData, recurringData, templatesData, savingsGoalsData] = await Promise.all([
          expensesAPI.getAll().catch(() => []),
          incomeAPI.getAll().catch(() => []),
          creditsAPI.getAll().catch(() => []),
          notesAPI.getAll().catch(() => []),
          tasksAPI.getAll().catch(() => []),
          partiesAPI.getAll().catch(() => []),
          budgetsAPI.getAll().catch(() => []),
          recurringAPI.getAll().catch(() => []),
          templatesAPI.getAll().catch(() => []),
          savingsGoalsAPI.getAll().catch(() => [])
        ])

        // Map API data to UI format
        const mappedExpenses = extractData(expensesData).map(mapExpenseFromAPI)
        const mappedIncome = extractData(incomeData).map(mapIncomeFromAPI)
        const mappedCredits = extractData(creditsData).map(mapCreditFromAPI)
        
        // Map parties data (phone -> contact)
        let mappedParties = extractData(partiesData).map(party => ({
          ...party,
          contact: party.phone || party.contact
        }))

        // Load ledger data for all parties to calculate totals
        try {
          const ledgerPromises = mappedParties.map(async (party) => {
            try {
              const ledgerData = await partiesAPI.getLedger(party.id)
              const entries = extractData(ledgerData)
              
              // Calculate totals from ledger entries
              let totalPurchases = 0
              let totalPayments = 0
              
              entries.forEach(entry => {
                const type = entry.transactionType?.toUpperCase() || entry.type?.toUpperCase()
                const amount = entry.amount || 0
                
                if (type === 'PURCHASE') {
                  totalPurchases += amount
                } else if (type === 'PAYMENT') {
                  totalPayments += amount
                } else if (type === 'ADJUSTMENT') {
                  // Adjustments can be positive or negative
                  if (amount > 0) {
                    totalPurchases += amount
                  } else {
                    totalPayments += Math.abs(amount)
                  }
                }
              })
              
              return {
                ...party,
                totalPurchases,
                totalPayments,
                transactionCount: entries.length
              }
            } catch (err) {
              // If ledger fetch fails, use party data as is
              console.error(`Error loading ledger for party ${party.id}:`, err)
              return {
                ...party,
                totalPurchases: party.totalPurchases || 0,
                totalPayments: party.totalPayments || 0,
                transactionCount: party.transactionCount || 0
              }
            }
          })
          
          mappedParties = await Promise.all(ledgerPromises)
        } catch (err) {
          console.error('Error loading party ledgers:', err)
          // Continue with parties data as is if ledger loading fails
        }

        // Combine expenses and income into transactions
        setTransactions([...mappedExpenses, ...mappedIncome])
        setCredits(mappedCredits)
        setNotes(extractData(notesData))
        
        // Tasks: Use API data, or fallback to local storage (handled in API)
        const tasksToSet = extractData(tasksData)
        setTasks(tasksToSet)
        
        // If no tasks from API, try loading from local storage
        if (tasksToSet.length === 0) {
          try {
            const { getTasksFromStorage } = await import('./services/tasksStorage.js')
            const localTasks = getTasksFromStorage()
            if (localTasks.length > 0) {
              setTasks(localTasks)
              console.log('Loaded tasks from local storage:', localTasks.length)
            }
          } catch (err) {
            console.error('Error loading tasks from storage:', err)
          }
        }
        
        setParties(mappedParties)
        setBudgets(extractData(budgetsData))
        setRecurringItems(extractData(recurringData))
        setExpenseTemplates(extractData(templatesData))
        setSavingsGoals(extractData(savingsGoalsData))
        
        // Load filter presets from localStorage
        try {
          const savedPresets = localStorage.getItem('filterPresets')
          if (savedPresets) {
            setFilterPresets(JSON.parse(savedPresets))
          }
        } catch (err) {
          console.error('Error loading filter presets:', err)
        }
        
        // If a party is selected, reload its ledger
        if (selectedParty) {
          try {
            const ledgerData = await partiesAPI.getLedger(selectedParty.id)
            // Map API response to UI format
            const mappedEntries = extractData(ledgerData).map(entry => ({
              ...entry,
              type: entry.transactionType?.toLowerCase() || entry.type,
              date: entry.transactionDate || entry.date
            }))
            setLedgerEntries(mappedEntries)
          } catch (err) {
            console.error('Error loading ledger:', err)
            // Don't show error toast on initial load, just set empty array
            setLedgerEntries([])
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data. Please check if the API server is running.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' })
  }

  // Authentication handlers
  const handleLogin = async (email, password) => {
    try {
      setAuthError('')
      const response = await login(email, password)
      setUser({ email: response.email })
      setIsAuthenticated(true)
      setShowRegister(false)
      showToast('Login successful!', 'success')
      // Redirect to Expenses tab (already authenticated, will show main app)
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please try again.')
      showToast(err.message || 'Login failed', 'error')
    }
  }

  const handleRegister = async (username, email, password) => {
    try {
      setAuthError('')
      const response = await register(username, email, password)
      // Registration successful - redirect to login page
      showToast('Registration successful! Please login.', 'success')
      setShowRegister(false) // Switch to login view
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.')
      showToast(err.message || 'Registration failed', 'error')
    }
  }

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
    setUser(null)
    setTransactions([])
    setCredits([])
    showToast('Logged out successfully', 'success')
  }

  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  const currentTransactions = viewMode === 'expenses' ? expenses : viewMode === 'income' ? income : []

  // Category color mapping
  const getCategoryColor = (category) => {
    const colorMap = {
      'Grocery': '#FF6B35',
      'Entertainment': '#E63946',
      'Transport': '#FF6B35',
      'Health Care': '#457B9D',
      'Shopping': '#E63946',
      'Food': '#FF6B35',
      'Bills': '#9B59B6',
      'Others': '#FF69B4',
      'Basic': '#FF6B35',
      'Enjoyment': '#E63946',
      'Give': '#9B59B6',
      'Salary': '#2ecc71',
      'Rent Payment': '#3498db',
      'Get Commission': '#f39c12',
      'Other Add Income Type': '#95a5a6'
    }
    
    // If category exists in map, use it, otherwise generate a color
    if (colorMap[category]) {
      return colorMap[category]
    }
    
    // Generate a color for new categories
    const colors = ['#FF6B35', '#E63946', '#457B9D', '#9B59B6', '#FF69B4', '#4ECDC4', '#45B7D1', '#F7B731']
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Calculate totals and category breakdown for expenses
  const expenseTotal = expenses.reduce((sum, t) => sum + t.amount, 0)
  const incomeTotal = income.reduce((sum, t) => sum + t.amount, 0)

  const expenseCategoryBreakdown = expenses.reduce((acc, transaction) => {
    const category = transaction.category
    if (!acc[category]) {
      acc[category] = { amount: 0, color: transaction.categoryColor }
    }
    acc[category].amount += transaction.amount
    return acc
  }, {})

  const expenseChartData = Object.entries(expenseCategoryBreakdown).map(([name, data]) => ({
    name,
    value: data.amount,
    color: data.color,
    percentage: Math.round((data.amount / expenseTotal) * 100)
  }))

  // Calculate category breakdown for income
  const incomeCategoryBreakdown = income.reduce((acc, transaction) => {
    const category = transaction.category
    if (!acc[category]) {
      acc[category] = { amount: 0, color: transaction.categoryColor || getCategoryColor(category) }
    }
    acc[category].amount += transaction.amount
    return acc
  }, {})

  const incomeChartData = Object.entries(incomeCategoryBreakdown).map(([name, data]) => ({
    name,
    value: data.amount,
    color: data.color,
    percentage: incomeTotal > 0 ? Math.round((data.amount / incomeTotal) * 100) : 0
  }))

  const handleAddClick = () => {
    setEditTransaction(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (transaction) => {
    // Convert credit to transaction format if needed
    if (transaction.creditType !== undefined) {
      // It's a credit
      setEditTransaction(transaction)
      setViewMode('credits')
    } else {
      // It's a regular transaction - set viewMode based on transaction type
      setEditTransaction(transaction)
      if (transaction.type === 'income') {
        setViewMode('income')
      } else if (transaction.type === 'expense') {
        setViewMode('expenses')
      }
      // If type is not set, keep current viewMode
    }
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditTransaction(null)
  }

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false)
    setEditNote(null)
  }

  // Party handlers
  const handleAddPartyClick = () => {
    setEditParty(null)
    setIsPartyModalOpen(true)
  }

  const handleEditPartyClick = (party) => {
    setEditParty(party)
    setIsPartyModalOpen(true)
  }

  const handlePartyModalClose = () => {
    setIsPartyModalOpen(false)
    setEditParty(null)
  }

  const handlePartyFormSubmit = async (formData) => {
    setIsLoading(true)
    try {
      // Map UI format to API format
      const apiData = {
        name: formData.name,
        phone: formData.contact || undefined,
        notes: formData.notes || undefined,
        openingBalance: formData.openingBalance || 0.00
      }
      
      if (editParty) {
        // Update party
        const updatedParty = await partiesAPI.update(editParty.id, apiData)
        // Map API response back to UI format
        const mappedParty = {
          ...updatedParty,
          contact: updatedParty.phone || updatedParty.contact
        }
        setParties(prev => prev.map(p => p.id === editParty.id ? mappedParty : p))
        showToast('Party updated successfully!', 'success')
      } else {
        // Create party
        const newParty = await partiesAPI.create(apiData)
        // Map API response back to UI format
        const mappedParty = {
          ...newParty,
          contact: newParty.phone || newParty.contact
        }
        setParties(prev => [mappedParty, ...prev])
        showToast('Party added successfully!', 'success')
      }
      handlePartyModalClose()
    } catch (err) {
      console.error('Error saving party:', err)
      showToast('Failed to save party. Please check if the API server is running.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteParty = async (id) => {
    showConfirmation({
      title: 'Delete Party',
      message: 'Are you sure you want to delete this party? All ledger entries will also be deleted.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setIsLoading(true)
        try {
          await partiesAPI.delete(id)
          setParties(prev => prev.filter(p => p.id !== id))
          if (selectedParty && selectedParty.id === id) {
            setSelectedParty(null)
            setLedgerEntries([])
            setShowPartyLedger(false)
          }
          showToast('Party deleted successfully!', 'success')
          setConfirmationDialog({ isOpen: false })
        } catch (err) {
          console.error('Error deleting party:', err)
          showToast('Failed to delete party', 'error')
        } finally {
          setIsLoading(false)
        }
      },
      onCancel: () => setConfirmationDialog({ isOpen: false })
    })
  }

  const handlePartyClick = async (party) => {
    setSelectedParty(party)
    setShowPartyLedger(true)
    setIsLoading(true)
    try {
      const ledgerData = await partiesAPI.getLedger(party.id)
      // Map API response to UI format
      const mappedEntries = extractData(ledgerData).map(entry => ({
        ...entry,
        type: entry.transactionType?.toLowerCase() || entry.type,
        date: entry.transactionDate || entry.date
      }))
      setLedgerEntries(mappedEntries)
    } catch (err) {
      console.error('Error loading ledger:', err)
      setLedgerEntries([])
      // Check if it's a 404 (endpoint not found) - backend might not be ready yet
      if (err.message && err.message.includes('not found')) {
        showToast('Ledger endpoint not available yet. Backend needs to be implemented.', 'error')
      } else {
        showToast('Failed to load ledger: ' + (err.message || 'Unknown error'), 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePartyDetailsModalClose = () => {
    setIsPartyDetailsModalOpen(false)
    setSelectedParty(null)
    setLedgerEntries([])
  }

  const handlePartyLedgerBack = () => {
    setShowPartyLedger(false)
    setSelectedParty(null)
    setLedgerEntries([])
  }

  const handleAddPaymentFromModal = () => {
    setLedgerEntryType('payment')
    setIsLedgerEntryModalOpen(true)
  }

  const handleAddLedgerEntryClick = () => {
    setEditLedgerEntry(null)
    setLedgerEntryType('purchase') // Default to purchase for new entries
    setIsLedgerEntryModalOpen(true)
  }

  const handleEditLedgerEntryClick = (entry) => {
    setEditLedgerEntry(entry)
    setIsLedgerEntryModalOpen(true)
  }

  const handleLedgerEntryModalClose = () => {
    setIsLedgerEntryModalOpen(false)
    setEditLedgerEntry(null)
  }

  const handleLedgerEntryFormSubmit = async (formData) => {
    if (!selectedParty) return
    setIsLoading(true)
    try {
      if (editLedgerEntry) {
        // Update ledger entry
        const updatedEntry = await ledgerAPI.update(editLedgerEntry.id, formData)
        // Map API response back to UI format
        const mappedEntry = {
          ...updatedEntry,
          type: updatedEntry.transactionType?.toLowerCase() || updatedEntry.type,
          date: updatedEntry.transactionDate || updatedEntry.date
        }
        setLedgerEntries(prev => prev.map(e => e.id === editLedgerEntry.id ? mappedEntry : e))
        showToast('Ledger entry updated successfully!', 'success')
      } else {
        // Create ledger entry
        const newEntry = await ledgerAPI.create(selectedParty.id, formData)
        // Map API response back to UI format
        const mappedEntry = {
          ...newEntry,
          type: newEntry.transactionType?.toLowerCase() || newEntry.type,
          date: newEntry.transactionDate || newEntry.date
        }
        setLedgerEntries(prev => [mappedEntry, ...prev])
        showToast('Ledger entry added successfully!', 'success')
      }
      
      // Reload party and ledger to update totals
      const updatedParty = await partiesAPI.getById(selectedParty.id)
      
      // Reload ledger entries and calculate totals
      try {
        const ledgerData = await partiesAPI.getLedger(selectedParty.id)
        const mappedEntries = extractData(ledgerData).map(entry => ({
          ...entry,
          type: entry.transactionType?.toLowerCase() || entry.type,
          date: entry.transactionDate || entry.date
        }))
        setLedgerEntries(mappedEntries)
        
        // Calculate totals from ledger entries
        let totalPurchases = 0
        let totalPayments = 0
        
        mappedEntries.forEach(entry => {
          const type = entry.transactionType?.toUpperCase() || entry.type?.toUpperCase()
          const amount = entry.amount || 0
          
          if (type === 'PURCHASE') {
            totalPurchases += amount
          } else if (type === 'PAYMENT') {
            totalPayments += amount
          } else if (type === 'ADJUSTMENT') {
            if (amount > 0) {
              totalPurchases += amount
            } else {
              totalPayments += Math.abs(amount)
            }
          }
        })
        
        // Map API response back to UI format with calculated totals
        const mappedParty = {
          ...updatedParty,
          contact: updatedParty.phone || updatedParty.contact,
          totalPurchases,
          totalPayments,
          transactionCount: mappedEntries.length
        }
        setParties(prev => prev.map(p => p.id === selectedParty.id ? mappedParty : p))
        setSelectedParty(mappedParty)
      } catch (err) {
        console.error('Error reloading ledger:', err)
        // Map API response back to UI format without totals
        const mappedParty = {
          ...updatedParty,
          contact: updatedParty.phone || updatedParty.contact
        }
        setParties(prev => prev.map(p => p.id === selectedParty.id ? mappedParty : p))
        setSelectedParty(mappedParty)
      }
      
      handleLedgerEntryModalClose()
    } catch (err) {
      console.error('Error saving ledger entry:', err)
      showToast('Failed to save ledger entry. Please check if the API server is running.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLedgerEntry = async (entryId) => {
    if (!selectedParty) return
    showConfirmation({
      title: 'Delete Ledger Entry',
      message: 'Are you sure you want to delete this ledger entry?',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setIsLoading(true)
    try {
      await ledgerAPI.delete(entryId)
      setLedgerEntries(prev => prev.filter(e => e.id !== entryId))
      
      // Reload party and ledger to update totals
      const updatedParty = await partiesAPI.getById(selectedParty.id)
      
      // Reload ledger entries and calculate totals
      try {
        const ledgerData = await partiesAPI.getLedger(selectedParty.id)
        const mappedEntries = extractData(ledgerData).map(entry => ({
          ...entry,
          type: entry.transactionType?.toLowerCase() || entry.type,
          date: entry.transactionDate || entry.date
        }))
        setLedgerEntries(mappedEntries)
        
        // Calculate totals from ledger entries
        let totalPurchases = 0
        let totalPayments = 0
        
        mappedEntries.forEach(entry => {
          const type = entry.transactionType?.toUpperCase() || entry.type?.toUpperCase()
          const amount = entry.amount || 0
          
          if (type === 'PURCHASE') {
            totalPurchases += amount
          } else if (type === 'PAYMENT') {
            totalPayments += amount
          } else if (type === 'ADJUSTMENT') {
            if (amount > 0) {
              totalPurchases += amount
            } else {
              totalPayments += Math.abs(amount)
            }
          }
        })
        
        // Map API response back to UI format with calculated totals
        const mappedParty = {
          ...updatedParty,
          contact: updatedParty.phone || updatedParty.contact,
          totalPurchases,
          totalPayments,
          transactionCount: mappedEntries.length
        }
        setParties(prev => prev.map(p => p.id === selectedParty.id ? mappedParty : p))
        setSelectedParty(mappedParty)
      } catch (err) {
        console.error('Error reloading ledger:', err)
        // Map API response back to UI format without totals
        const mappedParty = {
          ...updatedParty,
          contact: updatedParty.phone || updatedParty.contact
        }
        setParties(prev => prev.map(p => p.id === selectedParty.id ? mappedParty : p))
        setSelectedParty(mappedParty)
      }
      
          showToast('Ledger entry deleted successfully!', 'success')
          setConfirmationDialog({ isOpen: false })
        } catch (err) {
          console.error('Error deleting ledger entry:', err)
          showToast('Failed to delete ledger entry', 'error')
        } finally {
          setIsLoading(false)
        }
      },
      onCancel: () => setConfirmationDialog({ isOpen: false })
    })
  }

  // Show confirmation dialog
  const showConfirmation = (config) => {
    setConfirmationDialog({ isOpen: true, ...config })
  }

  const handleDeleteTransaction = async (id) => {
    const transaction = transactions.find(t => t.id === id)
    if (!transaction) return

    showConfirmation({
      title: 'Delete Transaction',
      message: `Are you sure you want to delete "${transaction.description}"?`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setIsLoading(true)
        try {
          if (transaction.type === 'expense') {
            await expensesAPI.delete(id)
          } else if (transaction.type === 'income') {
            await incomeAPI.delete(id)
          }
          
          setLastDeletedItem({ type: 'transaction', data: transaction, id })
          setTransactions(prev => prev.filter(t => t.id !== id))
          showToast('Transaction deleted successfully!', 'success')
          setConfirmationDialog({ isOpen: false })
          
          // Auto-hide undo option after 5 seconds
          setTimeout(() => setLastDeletedItem(null), 5000)
        } catch (err) {
          console.error('Error deleting transaction:', err)
          showToast('Failed to delete transaction. Please try again.', 'error')
        } finally {
          setIsLoading(false)
        }
      },
      onCancel: () => setConfirmationDialog({ isOpen: false })
    })
  }

  const handleDeleteTransactionDirect = async (id) => {
    setIsLoading(true)
    try {
      const transaction = transactions.find(t => t.id === id)
      if (!transaction) return

      if (transaction.type === 'expense') {
        await expensesAPI.delete(id)
      } else if (transaction.type === 'income') {
        await incomeAPI.delete(id)
      }
      
      setTransactions(prev => prev.filter(t => t.id !== id))
      showToast('Transaction deleted successfully!', 'success')
    } catch (err) {
      console.error('Error deleting transaction:', err)
      showToast('Failed to delete transaction. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCredit = async (id) => {
    setIsLoading(true)
    try {
      await creditsAPI.delete(id)
      setCredits(prev => prev.filter(c => c.id !== id))
      showToast('Credit deleted successfully!', 'success')
    } catch (err) {
      console.error('Error deleting credit:', err)
      showToast('Failed to delete credit. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (id) => {
    setIsLoading(true)
    try {
      await notesAPI.delete(id)
      setNotes(prev => prev.filter(n => n.id !== id))
      showToast('Note deleted successfully!', 'success')
    } catch (err) {
      console.error('Error deleting note:', err)
      showToast('Failed to delete note. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNoteFormSubmit = async (formData) => {
    setIsLoading(true)
    try {
      if (formData.id) {
        // Update note
        const updatedNote = await notesAPI.update(formData.id, {
          title: formData.title,
          note: formData.note
        })
        setNotes(prev => prev.map(n => n.id === formData.id ? updatedNote : n))
        showToast('Note updated successfully!', 'success')
      } else {
        // Create note
        const newNote = await notesAPI.create({
          title: formData.title,
          note: formData.note
        })
        setNotes(prev => [newNote, ...prev])
        showToast('Note added successfully!', 'success')
      }
      setIsNoteModalOpen(false)
      setEditNote(null)
    } catch (err) {
      console.error('Error saving note:', err)
      showToast('Failed to save note. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNoteClick = () => {
    setEditNote(null)
    setIsNoteModalOpen(true)
  }

  const handleEditNoteClick = (note) => {
    setEditNote(note)
    setIsNoteModalOpen(true)
  }

  // Task handlers
  const handleAddTaskClick = () => {
    setEditTask(null)
    setIsTaskModalOpen(true)
  }

  const handleEditTaskClick = (task) => {
    setEditTask(task)
    setIsTaskModalOpen(true)
  }

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false)
    setEditTask(null)
  }

  const handleTaskFormSubmit = async (formData) => {
    setIsLoading(true)
    try {
      if (formData.id) {
        // Update task
        const updatedTask = await tasksAPI.update(formData.id, {
          title: formData.title,
          subtitle: formData.subtitle,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status
        })
        setTasks(prev => prev.map(t => t.id === formData.id ? updatedTask : t))
        showToast('Task updated successfully!', 'success')
      } else {
        // Create task
        const newTask = await tasksAPI.create({
          title: formData.title,
          subtitle: formData.subtitle,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status
        })
        setTasks(prev => [newTask, ...prev])
        showToast('Task added successfully!', 'success')
      }
      setIsTaskModalOpen(false)
      setEditTask(null)
    } catch (err) {
      console.error('Error saving task:', err)
      // Show specific error message if it's a time conflict
      const errorMessage = err.message || 'Failed to save task. Please try again.'
      if (errorMessage.includes('Time slot conflict') || errorMessage.includes('conflicts with existing task')) {
        showToast(errorMessage, 'error')
      } else {
        showToast('Failed to save task. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTask = async (id) => {
    setIsLoading(true)
    try {
      await tasksAPI.delete(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      showToast('Task deleted successfully!', 'success')
    } catch (err) {
      console.error('Error deleting task:', err)
      showToast('Failed to delete task. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTaskStatus = async (id, newStatus) => {
    setIsLoading(true)
    try {
      const task = tasks.find(t => t.id === id)
      if (!task) return

      const updatedTask = await tasksAPI.update(id, {
        ...task,
        status: newStatus
      })
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t))
      showToast(`Task marked as ${newStatus}!`, 'success')
    } catch (err) {
      console.error('Error updating task status:', err)
      showToast('Failed to update task status. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Budget handlers
  const handleAddBudgetClick = () => {
    setEditBudget(null)
    setIsBudgetModalOpen(true)
  }

  const handleEditBudgetClick = (budget) => {
    setEditBudget(budget)
    setIsBudgetModalOpen(true)
  }

  const handleBudgetModalClose = () => {
    setIsBudgetModalOpen(false)
    setEditBudget(null)
  }

  // Savings Goals handlers
  const handleAddSavingsGoalClick = () => {
    setEditSavingsGoal(null)
    setIsSavingsGoalModalOpen(true)
  }

  const handleEditSavingsGoalClick = (goal) => {
    setEditSavingsGoal(goal)
    setIsSavingsGoalModalOpen(true)
  }

  const handleSavingsGoalModalClose = () => {
    setIsSavingsGoalModalOpen(false)
    setEditSavingsGoal(null)
  }

  const handleSavingsGoalFormSubmit = async (goalData) => {
    setIsLoading(true)
    try {
      if (goalData.action === 'delete') {
        await savingsGoalsAPI.delete(goalData.id)
        setSavingsGoals(prev => prev.filter(g => g.id !== goalData.id))
        showToast('Savings goal deleted successfully!', 'success')
      } else if (goalData.action === 'update') {
        const updated = await savingsGoalsAPI.update(goalData.id, goalData)
        setSavingsGoals(prev => prev.map(g => g.id === goalData.id ? updated : g))
        showToast('Savings goal updated successfully!', 'success')
      } else {
        const newGoal = await savingsGoalsAPI.create(goalData)
        setSavingsGoals(prev => [newGoal, ...prev])
        showToast('Savings goal created successfully!', 'success')
      }
      handleSavingsGoalModalClose()
    } catch (err) {
      console.error('Error saving savings goal:', err)
      showToast(err.message || 'Failed to save savings goal. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSavingsGoalAmount = async (goalId, newAmount) => {
    try {
      const goal = savingsGoals.find(g => g.id === goalId)
      if (goal) {
        const updated = await savingsGoalsAPI.update(goalId, { ...goal, currentAmount: newAmount })
        setSavingsGoals(prev => prev.map(g => g.id === goalId ? updated : g))
        if (newAmount >= goal.targetAmount) {
          showToast(`🎉 Congratulations! You've reached your goal: ${goal.name}!`, 'success')
        }
      }
    } catch (err) {
      console.error('Error updating savings goal:', err)
      showToast('Failed to update savings goal amount.', 'error')
    }
  }

  const handleBudgetFormSubmit = async (budgetData) => {
    // Check if user is authenticated
    const token = getAuthToken()
    if (!token || !isAuthenticated) {
      showToast('Please login to manage budgets.', 'error')
      return
    }

    setIsLoading(true)
    try {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const currentMonthIncome = income.filter(t => {
        const date = new Date(t.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }).reduce((sum, t) => sum + t.amount, 0)

      if (budgetData.action === 'delete') {
        await budgetsAPI.delete(budgetData.id)
        setBudgets(prev => prev.filter(b => b.id !== budgetData.id))
        showToast('Budget deleted successfully!', 'success')
      } else if (budgetData.action === 'update') {
        const { action, id, ...updateData } = budgetData
        // Recalculate amount if percentage type
        if (updateData.budgetType === 'percentage' && updateData.percentage && currentMonthIncome > 0) {
          updateData.amount = (updateData.percentage / 100) * currentMonthIncome
        }
        const updatedBudget = await budgetsAPI.update(id, { ...updateData, monthlyIncome: currentMonthIncome })
        setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b))
        showToast('Budget updated successfully!', 'success')
      } else {
        // Create new budget
        const createData = { ...budgetData }
        delete createData.action
        // Recalculate amount if percentage type
        if (createData.budgetType === 'percentage' && createData.percentage && currentMonthIncome > 0) {
          createData.amount = (createData.percentage / 100) * currentMonthIncome
        }
        const newBudget = await budgetsAPI.create({ ...createData, monthlyIncome: currentMonthIncome })
        setBudgets(prev => [newBudget, ...prev])
        showToast('Budget added successfully!', 'success')
      }
      handleBudgetModalClose()
    } catch (err) {
      console.error('Error saving budget:', err)
      const errorMessage = err.message || 'Failed to save budget. Please try again.'
      if (errorMessage.includes('Access denied') || errorMessage.includes('login')) {
        showToast('Please login to manage budgets.', 'error')
      } else {
        showToast(errorMessage, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsLoading(true)
    try {
      if (formData.type === 'credit') {
        const apiData = mapCreditToAPI(formData)
        if (formData.id) {
          // Update credit
          const updatedCredit = await creditsAPI.update(formData.id, apiData)
          const mappedCredit = mapCreditFromAPI(updatedCredit)
          setCredits(prev => prev.map(c => c.id === formData.id ? mappedCredit : c))
          showToast('Credit updated successfully!', 'success')
        } else {
          // Create credit via API
          const newCredit = await creditsAPI.create(apiData)
          const mappedCredit = mapCreditFromAPI(newCredit)
          setCredits(prev => [mappedCredit, ...prev])
          showToast('Credit added successfully!', 'success')
        }
      } else if (formData.type === 'expense') {
        const apiData = mapExpenseToAPI({
          ...formData,
          description: formData.note || formData.category
        })
        
        if (formData.id) {
          // Update expense
          const updatedExpense = await expensesAPI.update(formData.id, apiData)
          const mappedExpense = mapExpenseFromAPI(updatedExpense)
          mappedExpense.categoryColor = getCategoryColor(formData.category)
          mappedExpense.paymentMode = formData.paymentMode || 'Cash'
          mappedExpense.note = formData.note || ''
          setTransactions(prev => prev.map(t => t.id === formData.id ? mappedExpense : t))
          showToast('Expense updated successfully!', 'success')
        } else {
          // Create expense
          const newExpense = await expensesAPI.create(apiData)
          const mappedExpense = mapExpenseFromAPI(newExpense)
          mappedExpense.categoryColor = getCategoryColor(formData.category)
          mappedExpense.paymentMode = formData.paymentMode || 'Cash'
          mappedExpense.note = formData.note || ''
          mappedExpense.budget = 0
          mappedExpense.remaining = 0
          setTransactions(prev => [mappedExpense, ...prev])
          
          // If save as template, create template
          if (formData.saveAsTemplate && formData.templateName) {
            try {
              const templateData = {
                name: formData.templateName,
                amount: formData.amount,
                category: formData.category,
                paymentMode: formData.paymentMode || 'Cash',
                note: formData.note || ''
              }
              const newTemplate = await templatesAPI.create(templateData)
              setExpenseTemplates(prev => [newTemplate, ...prev])
            } catch (templateErr) {
              console.error('Error creating template:', templateErr)
            }
          }

          // If recurring, create recurring item
          if (formData.isRecurring) {
            try {
              const recurringData = {
                type: 'expense',
                amount: formData.amount,
                description: formData.note || formData.category,
                category: formData.category,
                frequency: formData.frequency,
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                isActive: true
              }
              const newRecurring = await recurringAPI.create(recurringData)
              setRecurringItems(prev => [newRecurring, ...prev])
              showToast('Expense and recurring item added successfully!', 'success')
            } catch (recurringErr) {
              console.error('Error creating recurring item:', recurringErr)
              showToast('Expense added, but failed to create recurring item', 'error')
            }
          } else if (!formData.saveAsTemplate) {
            showToast('Expense added successfully!', 'success')
          }
        }
      } else if (formData.type === 'income') {
        const apiData = mapIncomeToAPI({
          ...formData,
          description: formData.note || formData.category
        })
        
        if (formData.id) {
          // Update income
          const updatedIncome = await incomeAPI.update(formData.id, apiData)
          const mappedIncome = mapIncomeFromAPI(updatedIncome)
          mappedIncome.categoryColor = getCategoryColor(formData.category)
          mappedIncome.paymentMode = formData.paymentMode || 'Cash'
          mappedIncome.note = formData.note || ''
          setTransactions(prev => prev.map(t => t.id === formData.id ? mappedIncome : t))
          showToast('Income updated successfully!', 'success')
        } else {
          // Create income
          const newIncome = await incomeAPI.create(apiData)
          const mappedIncome = mapIncomeFromAPI(newIncome)
          mappedIncome.categoryColor = getCategoryColor(formData.category)
          mappedIncome.paymentMode = formData.paymentMode || 'Cash'
          mappedIncome.note = formData.note || ''
          setTransactions(prev => [mappedIncome, ...prev])
          
          // If save as template, create template
          if (formData.saveAsTemplate && formData.templateName) {
            try {
              const templateData = {
                name: formData.templateName,
                amount: formData.amount,
                category: formData.category,
                paymentMode: formData.paymentMode || 'Cash',
                note: formData.note || ''
              }
              const newTemplate = await templatesAPI.create(templateData)
              setExpenseTemplates(prev => [newTemplate, ...prev])
            } catch (templateErr) {
              console.error('Error creating template:', templateErr)
            }
          }

          // If recurring, create recurring item
          if (formData.isRecurring) {
            try {
              const recurringData = {
                type: 'income',
                amount: formData.amount,
                description: formData.note || formData.category,
                source: formData.category,
                frequency: formData.frequency,
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                isActive: true
              }
              const newRecurring = await recurringAPI.create(recurringData)
              setRecurringItems(prev => [newRecurring, ...prev])
              showToast('Income and recurring item added successfully!', 'success')
            } catch (recurringErr) {
              console.error('Error creating recurring item:', recurringErr)
              showToast('Income added, but failed to create recurring item', 'error')
            }
          } else if (!formData.saveAsTemplate) {
            showToast('Income added successfully!', 'success')
          }
        }
      }
      handleModalClose()
    } catch (err) {
      console.error('Error saving entry:', err)
      showToast('Failed to save entry. Please check if the API server is running.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique categories
  const getUniqueCategories = () => {
    const cats = new Set()
    currentTransactions.forEach(t => {
      if (t.category) cats.add(t.category)
    })
    return Array.from(cats).sort()
  }

  // Filter transactions based on search, date range, and category
  const filterTransactions = (transactions) => {
    let filtered = [...transactions]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.paymentMode?.toLowerCase().includes(query) ||
        t.note?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateRange.end))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date)
        case 'date-desc':
          return new Date(b.date) - new Date(a.date)
        case 'amount-asc':
          return a.amount - b.amount
        case 'amount-desc':
          return b.amount - a.amount
        case 'category-asc':
          return (a.category || '').localeCompare(b.category || '')
        default:
          return new Date(b.date) - new Date(a.date)
      }
    })

    return filtered
  }

  const filteredTransactions = filterTransactions(currentTransactions)

  // Filter parties based on search query
  const filterParties = (partiesList) => {
    if (!searchQuery.trim()) {
      return partiesList
    }
    
    const query = searchQuery.toLowerCase()
    return partiesList.filter(party => 
      party.name?.toLowerCase().includes(query) ||
      party.contact?.toLowerCase().includes(query) ||
      party.phone?.toLowerCase().includes(query) ||
      party.notes?.toLowerCase().includes(query)
    )
  }

  const filteredParties = filterParties(parties)

  // Quick date filter handler
  const handleQuickDateFilter = (filterType) => {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    let start = ''
    let end = ''

    switch (filterType) {
      case 'today':
        start = startOfDay.toISOString().split('T')[0]
        end = new Date().toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        start = weekStart.toISOString().split('T')[0]
        end = new Date().toISOString().split('T')[0]
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        end = new Date().toISOString().split('T')[0]
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        end = new Date().toISOString().split('T')[0]
        break
      case 'last-month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        start = lastMonth.toISOString().split('T')[0]
        end = lastMonthEnd.toISOString().split('T')[0]
        break
      default:
        return
    }

    setDateRange({ start, end })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setDateRange({ start: '', end: '' })
    setSelectedCategory('')
    setSelectedCategories([])
    setAmountRange({ min: null, max: null })
    setSortBy('date-desc')
  }

  // Save filter preset
  const handleSavePreset = (preset) => {
    const newPresets = [...filterPresets, preset]
    setFilterPresets(newPresets)
    localStorage.setItem('filterPresets', JSON.stringify(newPresets))
    showToast('Filter preset saved!', 'success')
  }

  // Load filter preset
  const handleLoadPreset = (preset) => {
    setSearchQuery(preset.searchQuery || '')
    setDateRange(preset.dateRange || { start: '', end: '' })
    setSelectedCategory(preset.selectedCategory || '')
    setSelectedCategories(preset.selectedCategories || [])
    setAmountRange(preset.amountRange || { min: null, max: null })
    setSortBy(preset.sortBy || 'date-desc')
    showToast(`Loaded preset: ${preset.name}`, 'success')
  }

  // Duplicate transaction
  const handleDuplicateTransaction = (transaction) => {
    setEditTransaction(null)
    // Create a new transaction with same data but today's date
    const duplicateData = {
      ...transaction,
      date: new Date().toISOString().split('T')[0],
      id: undefined // Remove ID so it creates a new entry
    }
    handleFormSubmit(duplicateData)
    showToast('Transaction duplicated!', 'success')
  }

  // Get recent categories (most used in last 30 days)
  const getRecentCategories = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date >= thirtyDaysAgo
    })
    
    const categoryCounts = {}
    recentTransactions.forEach(t => {
      if (t.category) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
      }
    })
    
    // Sort by frequency and return top categories
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category)
      .slice(0, 5) // Top 5 most used
  }

  // Filter credits based on search and date range
  const filterCredits = (creditsList) => {
    let filtered = [...creditsList]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.personName?.toLowerCase().includes(query) ||
        c.note?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.creditType?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(c => new Date(c.date) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      filtered = filtered.filter(c => new Date(c.date) <= new Date(dateRange.end))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date)
        case 'date-desc':
          return new Date(b.date) - new Date(a.date)
        case 'amount-asc':
          return a.amount - b.amount
        case 'amount-desc':
          return b.amount - a.amount
        default:
          return new Date(b.date) - new Date(a.date)
      }
    })

    return filtered
  }


  const handleExportCSV = async () => {
    setIsLoading(true)
    try {
      if (viewMode === 'credits') {
        exportCreditsToCSV(credits)
        showToast('Credits exported successfully!', 'success')
      } else {
        exportTransactionsToCSV(filteredTransactions, viewMode)
        showToast(`${filteredTransactions.length} transactions exported!`, 'success')
      }
    } catch (err) {
      showToast('Failed to export CSV', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => {
      const searchInput = document.querySelector('.search-input')
      if (searchInput) searchInput.focus()
    },
    onAddNew: handleAddClick,
    onClose: () => {
      if (isModalOpen) handleModalClose()
    }
  })

  // Toggle dark mode
  useEffect(() => {
    const appContainer = document.querySelector('.app-container')
    if (darkMode) {
      appContainer?.classList.add('dark-mode')
    } else {
      appContainer?.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Show auth checking state
  if (checkingAuth) {
    return (
      <div className="app-container">
        <div className="content-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication screens
  if (!isAuthenticated) {
    return (
      <>
        {showRegister ? (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => {
              setShowRegister(false)
              setAuthError('')
            }}
            error={authError}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => {
              setShowRegister(true)
              setAuthError('')
            }}
            error={authError}
          />
        )}
      </>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="app-container">
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} user={user} onLogout={handleLogout} />
        <div className="content-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Fetching data from server</div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="app-container">
        <Header />
        <div className="content-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px', color: '#E63946' }}>Error</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} user={user} onLogout={handleLogout} />
      <main id="main-content" className="content-section" role="main">
        <BurgerMenu viewMode={viewMode} setViewMode={setViewMode} />
        
        {viewMode === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            credits={credits}
            parties={parties}
            notes={notes}
            onNavigate={setViewMode}
          />
        )}
        
        {viewMode === 'expenses' && (
          <>
            {/* Expenses View Tabs */}
            <div className="expenses-tabs">
              <button
                className={`expenses-tab ${expensesViewTab === 'expenses' ? 'active' : ''}`}
                onClick={() => setExpensesViewTab('expenses')}
              >
                Expenses
              </button>
              <button
                className={`expenses-tab ${expensesViewTab === 'budgets' ? 'active' : ''}`}
                onClick={() => setExpensesViewTab('budgets')}
              >
                Budgets
              </button>
            </div>

            {expensesViewTab === 'expenses' && (
              <>
                <StatisticsCards transactions={transactions} viewMode={viewMode} />
                <PieChart 
                  total={expenseTotal} 
                  data={expenseChartData}
                />
              </>
            )}

            {expensesViewTab === 'budgets' && (
              (() => {
                const now = new Date()
                const currentMonth = now.getMonth()
                const currentYear = now.getFullYear()
                const currentMonthIncome = income.filter(t => {
                  const date = new Date(t.date)
                  return date.getMonth() === currentMonth && date.getFullYear() === currentYear
                }).reduce((sum, t) => sum + t.amount, 0)
                
                return (
                  <BudgetList
                    budgets={budgets}
                    expenses={expenses}
                    monthlyIncome={currentMonthIncome}
                    onAddClick={handleAddBudgetClick}
                    onEdit={handleEditBudgetClick}
                    onDelete={async (id) => {
                      setIsLoading(true)
                      try {
                        await budgetsAPI.delete(id)
                        setBudgets(prev => prev.filter(b => b.id !== id))
                        showToast('Budget deleted successfully!', 'success')
                      } catch (err) {
                        console.error('Error deleting budget:', err)
                        showToast('Failed to delete budget', 'error')
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    onAlert={(alert) => {
                      // Show toast notification for budget alerts
                      showToast(alert.message, alert.type)
                    }}
                    onApplyRecommendation={async (recommendation) => {
                      setIsBudgetModalOpen(true)
                      setEditBudget(null)
                      // Pre-fill the budget modal with recommendation
                      setTimeout(() => {
                        const budgetData = {
                          category: recommendation.category,
                          budgetType: recommendation.budgetType,
                          amount: recommendation.suggestedAmount,
                          percentage: recommendation.suggestedPercentage,
                          period: 'monthly'
                        }
                        handleBudgetFormSubmit({ action: 'create', ...budgetData })
                      }, 100)
                    }}
                  />
                )
              })()
            )}
          </>
        )}
        {viewMode === 'income' && (
          <PieChart 
            total={incomeTotal} 
            data={incomeChartData}
          />
        )}
        
        {viewMode === 'expenses' && expensesViewTab === 'expenses' && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            dateRange={dateRange}
            onExportCSV={handleExportCSV}
            onToggleSummary={() => setShowMonthlySummary(!showMonthlySummary)}
            showSummary={showMonthlySummary}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            amountRange={amountRange}
            onAmountRangeChange={setAmountRange}
            filterPresets={filterPresets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            categories={getUniqueCategories()}
            viewMode={viewMode}
            onQuickDateFilter={handleQuickDateFilter}
            isLoading={isLoading}
          />
        )}
        {viewMode === 'income' && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            dateRange={dateRange}
            onExportCSV={handleExportCSV}
            onToggleSummary={() => setShowMonthlySummary(!showMonthlySummary)}
            showSummary={showMonthlySummary}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            amountRange={amountRange}
            onAmountRangeChange={setAmountRange}
            filterPresets={filterPresets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            categories={getUniqueCategories()}
            viewMode={viewMode}
            onQuickDateFilter={handleQuickDateFilter}
            isLoading={isLoading}
          />
        )}
        
        {viewMode === 'credits' && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            dateRange={dateRange}
            onExportCSV={handleExportCSV}
            onToggleSummary={() => setShowMonthlySummary(!showMonthlySummary)}
            showSummary={showMonthlySummary}
            selectedCategory=""
            onCategoryChange={() => {}}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            categories={[]}
            viewMode={viewMode}
            onQuickDateFilter={handleQuickDateFilter}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'parties' && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            dateRange={dateRange}
            onExportCSV={handleExportCSV}
            onToggleSummary={() => setShowMonthlySummary(!showMonthlySummary)}
            showSummary={showMonthlySummary}
            selectedCategory=""
            onCategoryChange={() => {}}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            categories={[]}
            viewMode={viewMode}
            onQuickDateFilter={handleQuickDateFilter}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'expenses' && expensesViewTab === 'expenses' && filteredTransactions.length > 0 && (
          <div className="transaction-count-badge">
            Showing {filteredTransactions.length} expenses
          </div>
        )}
        {viewMode === 'income' && filteredTransactions.length > 0 && (
          <div className="transaction-count-badge">
            Showing {filteredTransactions.length} income entries
          </div>
        )}

        {viewMode === 'expenses' && expensesViewTab === 'expenses' && showMonthlySummary && (
          <>
            <MonthlySummary 
              transactions={transactions} 
              viewMode={viewMode}
            />
            <TrendChart 
              transactions={transactions} 
              viewMode={viewMode}
            />
          </>
        )}
        {viewMode === 'credits' ? (
          <CreditsList 
            credits={filterCredits(credits)}
            onAddClick={handleAddClick}
            viewMode={viewMode}
            onEdit={handleEditClick}
            onDelete={handleDeleteCredit}
          />
        ) : viewMode === 'notes' ? (
          <NotesList 
            notes={notes}
            onAddClick={handleAddNoteClick}
            onEdit={handleEditNoteClick}
            onDelete={handleDeleteNote}
          />
        ) : viewMode === 'tasks' ? (
          <TasksList 
            tasks={tasks}
            onAddClick={handleAddTaskClick}
            onEdit={handleEditTaskClick}
            onDelete={handleDeleteTask}
            onToggleStatus={handleToggleTaskStatus}
          />
        ) : showPartyLedger && selectedParty ? (
          <PartyLedger
            party={selectedParty}
            ledgerEntries={ledgerEntries}
            onBack={handlePartyLedgerBack}
            onAddEntry={handleAddLedgerEntryClick}
            onEditEntry={handleEditLedgerEntryClick}
            onDeleteEntry={handleDeleteLedgerEntry}
          />
        ) : viewMode === 'parties' ? (
          <>
            {filteredParties.length > 0 && searchQuery.trim() && (
              <div className="transaction-count-badge">
                Showing {filteredParties.length} {filteredParties.length === 1 ? 'party' : 'parties'}
              </div>
            )}
            <PartyList
              parties={filteredParties}
              onAddClick={handleAddPartyClick}
              onPartyClick={handlePartyClick}
              onEdit={handleEditPartyClick}
              onDelete={handleDeleteParty}
            />
          </>
        ) : viewMode === 'savings-goals' ? (
          <SavingsGoalsList
            goals={savingsGoals}
            totalSavings={savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)}
            onAddClick={handleAddSavingsGoalClick}
            onEdit={handleEditSavingsGoalClick}
            onDelete={(id) => handleSavingsGoalFormSubmit({ action: 'delete', id })}
            onUpdateAmount={handleUpdateSavingsGoalAmount}
          />
        ) : viewMode === 'expenses' && expensesViewTab === 'expenses' ? (
          <TransactionList 
            transactions={filteredTransactions} 
            viewMode={viewMode}
            onAddClick={handleAddClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransactionDirect}
            onDeleteRequest={handleDeleteTransaction}
            onDuplicate={handleDuplicateTransaction}
          />
        ) : viewMode !== 'dashboard' && viewMode !== 'expenses' ? (
          <TransactionList 
            transactions={filteredTransactions} 
            viewMode={viewMode}
            onAddClick={handleAddClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransactionDirect}
            onDeleteRequest={handleDeleteTransaction}
            onDuplicate={handleDuplicateTransaction}
          />
        ) : null}
      </main>
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        viewMode={viewMode}
        editTransaction={editTransaction}
        recentCategories={getRecentCategories()}
        templates={expenseTemplates}
      />
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        onSubmit={handleNoteFormSubmit}
        editNote={editNote}
      />
      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={handleTaskModalClose}
        onSubmit={handleTaskFormSubmit}
        editTask={editTask}
        existingTasks={tasks}
      />
      <AddPartyModal
        isOpen={isPartyModalOpen}
        onClose={handlePartyModalClose}
        onSubmit={handlePartyFormSubmit}
        editParty={editParty}
      />
      <PartyDetailsModal
        isOpen={isPartyDetailsModalOpen}
        onClose={handlePartyDetailsModalClose}
        party={selectedParty}
        ledgerEntries={ledgerEntries}
        onAddPayment={handleAddPaymentFromModal}
        onEditEntry={handleEditLedgerEntryClick}
        onDeleteEntry={handleDeleteLedgerEntry}
      />
      <AddLedgerEntryModal
        isOpen={isLedgerEntryModalOpen}
        onClose={handleLedgerEntryModalClose}
        onSubmit={handleLedgerEntryFormSubmit}
        party={selectedParty}
        editEntry={editLedgerEntry}
        defaultType={ledgerEntryType}
      />
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleBudgetModalClose}
        onSubmit={handleBudgetFormSubmit}
        budgets={budgets}
        monthlyIncome={(() => {
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          return income.filter(t => {
            const date = new Date(t.date)
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear
          }).reduce((sum, t) => sum + t.amount, 0)
        })()}
        editBudget={editBudget}
      />
      <SavingsGoalModal
        isOpen={isSavingsGoalModalOpen}
        onClose={handleSavingsGoalModalClose}
        onSubmit={handleSavingsGoalFormSubmit}
        editGoal={editSavingsGoal}
      />
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        type={confirmationDialog.type}
        confirmText={confirmationDialog.confirmText}
        cancelText={confirmationDialog.cancelText}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={confirmationDialog.onCancel}
        showUndo={lastDeletedItem !== null}
        undoText="Undo Delete"
        onUndo={lastDeletedItem ? async () => {
          try {
            if (lastDeletedItem.type === 'transaction') {
              if (lastDeletedItem.data.type === 'expense') {
                const restored = await expensesAPI.create({
                  amount: lastDeletedItem.data.amount,
                  description: lastDeletedItem.data.description,
                  category: lastDeletedItem.data.category,
                  date: lastDeletedItem.data.date,
                  paymentMode: lastDeletedItem.data.paymentMode,
                  note: lastDeletedItem.data.note
                })
                setTransactions(prev => [mapExpenseFromAPI(restored), ...prev])
              } else {
                const restored = await incomeAPI.create({
                  amount: lastDeletedItem.data.amount,
                  description: lastDeletedItem.data.description,
                  source: lastDeletedItem.data.category,
                  date: lastDeletedItem.data.date
                })
                setTransactions(prev => [mapIncomeFromAPI(restored), ...prev])
              }
            }
            setLastDeletedItem(null)
            showToast('Transaction restored!', 'success')
          } catch (err) {
            console.error('Error restoring transaction:', err)
            showToast('Failed to restore transaction', 'error')
          }
        } : undefined}
      />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}

export default App


