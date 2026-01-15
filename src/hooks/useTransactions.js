import { useState, useEffect, useCallback } from 'react'
import { expensesAPI, incomeAPI } from '../services/api'
import { mapExpenseFromAPI, mapExpenseToAPI, mapIncomeFromAPI, mapIncomeToAPI } from '../utils/dataMapper'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [expensesData, incomeData] = await Promise.all([
        expensesAPI.getAll().catch(() => []),
        incomeAPI.getAll().catch(() => [])
      ])

      const mappedExpenses = (expensesData || []).map(exp => {
        const mapped = mapExpenseFromAPI(exp)
        mapped.categoryColor = getCategoryColor(exp.category)
        mapped.paymentMode = exp.paymentMode || 'Cash'
        mapped.note = exp.note || ''
        mapped.budget = 0
        mapped.remaining = 0
        return mapped
      })

      const mappedIncome = (incomeData || []).map(inc => {
        const mapped = mapIncomeFromAPI(inc)
        mapped.categoryColor = getCategoryColor(inc.source)
        return mapped
      })

      setExpenses(mappedExpenses)
      setIncome(mappedIncome)
      setTransactions([...mappedExpenses, ...mappedIncome])
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  const addTransaction = useCallback(async (transactionData, viewMode) => {
    try {
      if (transactionData.type === 'expense') {
        const apiData = mapExpenseToAPI(transactionData)
        const newExpense = await expensesAPI.create(apiData)
        const mapped = mapExpenseFromAPI(newExpense)
        mapped.categoryColor = getCategoryColor(transactionData.category)
        mapped.paymentMode = transactionData.paymentMode || 'Cash'
        mapped.note = transactionData.note || ''
        setExpenses(prev => [mapped, ...prev])
        setTransactions(prev => [mapped, ...prev])
        return mapped
      } else {
        const apiData = mapIncomeToAPI(transactionData)
        const newIncome = await incomeAPI.create(apiData)
        const mapped = mapIncomeFromAPI(newIncome)
        mapped.categoryColor = getCategoryColor(transactionData.category)
        setIncome(prev => [mapped, ...prev])
        setTransactions(prev => [mapped, ...prev])
        return mapped
      }
    } catch (err) {
      throw err
    }
  }, [])

  const updateTransaction = useCallback(async (transactionData) => {
    try {
      if (transactionData.type === 'expense') {
        const apiData = mapExpenseToAPI(transactionData)
        const updated = await expensesAPI.update(transactionData.id, apiData)
        const mapped = mapExpenseFromAPI(updated)
        mapped.categoryColor = getCategoryColor(transactionData.category)
        mapped.paymentMode = transactionData.paymentMode || 'Cash'
        mapped.note = transactionData.note || ''
        setExpenses(prev => prev.map(t => t.id === transactionData.id ? mapped : t))
        setTransactions(prev => prev.map(t => t.id === transactionData.id ? mapped : t))
        return mapped
      } else {
        const apiData = mapIncomeToAPI(transactionData)
        const updated = await incomeAPI.update(transactionData.id, apiData)
        const mapped = mapIncomeFromAPI(updated)
        mapped.categoryColor = getCategoryColor(transactionData.category)
        setIncome(prev => prev.map(t => t.id === transactionData.id ? mapped : t))
        setTransactions(prev => prev.map(t => t.id === transactionData.id ? mapped : t))
        return mapped
      }
    } catch (err) {
      throw err
    }
  }, [])

  const deleteTransaction = useCallback(async (id, type) => {
    try {
      if (type === 'expense') {
        await expensesAPI.delete(id)
        setExpenses(prev => prev.filter(t => t.id !== id))
      } else {
        await incomeAPI.delete(id)
        setIncome(prev => prev.filter(t => t.id !== id))
      }
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    expenses,
    income,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  }
}

// Helper function
const getCategoryColor = (category) => {
  const colors = {
    'Basic': '#FF6B6B',
    'Enjoyment': '#4ECDC4',
    'Health Care': '#45B7D1',
    'Give': '#FFA07A',
    'Others': '#98D8C8',
    'Food': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Shopping': '#45B7D1'
  }
  return colors[category] || '#98D8C8'
}

