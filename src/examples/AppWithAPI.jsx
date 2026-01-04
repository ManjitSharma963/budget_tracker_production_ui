// Example: How to integrate API with App.jsx
// This is a reference implementation showing how to use the API endpoints

import React, { useState, useEffect } from 'react'
import { expensesAPI, incomeAPI, creditsAPI } from '../services/api'
import { mapExpenseFromAPI, mapExpenseToAPI, mapIncomeFromAPI, mapIncomeToAPI, mapCreditFromAPI, mapCreditToAPI } from '../utils/dataMapper'

// Example App component with API integration
function AppWithAPI() {
  const [viewMode, setViewMode] = useState('expenses')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAll()
      const mappedExpenses = data.map(mapExpenseFromAPI)
      setTransactions(prev => {
        const income = prev.filter(t => t.type === 'income')
        return [...mappedExpenses, ...income]
      })
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError('Failed to fetch expenses')
    }
  }

  // Fetch income from API
  const fetchIncome = async () => {
    try {
      const data = await incomeAPI.getAll()
      const mappedIncome = data.map(mapIncomeFromAPI)
      setTransactions(prev => {
        const expenses = prev.filter(t => t.type === 'expense')
        return [...expenses, ...mappedIncome]
      })
    } catch (err) {
      console.error('Error fetching income:', err)
      setError('Failed to fetch income')
    }
  }

  // Fetch credits from API
  const fetchCredits = async () => {
    try {
      const data = await creditsAPI.getAll()
      const mappedCredits = data.map(mapCreditFromAPI)
      setCredits(mappedCredits)
    } catch (err) {
      console.error('Error fetching credits:', err)
      setError('Failed to fetch credits')
    }
  }

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchExpenses(),
          fetchIncome(),
          fetchCredits()
        ])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (formData.type === 'credit') {
        // Create credit via API
        const apiData = mapCreditToAPI(formData)
        const newCredit = await creditsAPI.create(apiData)
        const mappedCredit = mapCreditFromAPI(newCredit)
        setCredits(prev => [mappedCredit, ...prev])
      } else if (formData.type === 'expense') {
        // Create expense via API
        const apiData = mapExpenseToAPI(formData)
        const newExpense = await expensesAPI.create(apiData)
        const mappedExpense = mapExpenseFromAPI(newExpense)
        setTransactions(prev => [mappedExpense, ...prev])
      } else if (formData.type === 'income') {
        // Create income via API
        const apiData = mapIncomeToAPI(formData)
        const newIncome = await incomeAPI.create(apiData)
        const mappedIncome = mapIncomeFromAPI(newIncome)
        setTransactions(prev => [mappedIncome, ...prev])
      }
    } catch (err) {
      console.error('Error creating entry:', err)
      alert('Failed to create entry. Please try again.')
    }
  }

  // Handle delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error deleting expense:', err)
      alert('Failed to delete expense. Please try again.')
    }
  }

  // Handle delete income
  const handleDeleteIncome = async (id) => {
    try {
      await incomeAPI.delete(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error deleting income:', err)
      alert('Failed to delete income. Please try again.')
    }
  }

  // Handle delete credit
  const handleDeleteCredit = async (id) => {
    try {
      await creditsAPI.delete(id)
      setCredits(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting credit:', err)
      alert('Failed to delete credit. Please try again.')
    }
  }

  // Handle update expense
  const handleUpdateExpense = async (id, updatedData) => {
    try {
      const apiData = mapExpenseToAPI(updatedData)
      const updated = await expensesAPI.update(id, apiData)
      const mappedExpense = mapExpenseFromAPI(updated)
      setTransactions(prev => 
        prev.map(t => t.id === id ? mappedExpense : t)
      )
    } catch (err) {
      console.error('Error updating expense:', err)
      alert('Failed to update expense. Please try again.')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  // Rest of your component JSX...
  return (
    <div>
      {/* Your existing UI components */}
    </div>
  )
}

export default AppWithAPI

