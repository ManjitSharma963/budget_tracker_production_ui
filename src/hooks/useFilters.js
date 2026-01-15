import { useState, useMemo, useCallback } from 'react'

export const useFilters = (transactions) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [amountRange, setAmountRange] = useState({ min: null, max: null })
  const [sortBy, setSortBy] = useState('date-desc')

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDateRange({ start: '', end: '' })
    setSelectedCategory('')
    setSelectedCategories([])
    setAmountRange({ min: null, max: null })
    setSortBy('date-desc')
  }, [])

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Apply search filter (by description keywords)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.note?.toLowerCase().includes(query) ||
        t.paymentMode?.toLowerCase().includes(query)
      )
    }

    // Apply category filter (single or multiple)
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory)
    } else if (selectedCategories && selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category))
    }

    // Apply amount range filter
    if (amountRange?.min !== null && amountRange?.min !== undefined) {
      filtered = filtered.filter(t => t.amount >= amountRange.min)
    }
    if (amountRange?.max !== null && amountRange?.max !== undefined) {
      filtered = filtered.filter(t => t.amount <= amountRange.max)
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
        case 'date-desc':
          return new Date(b.date) - new Date(a.date)
        case 'date-asc':
          return new Date(a.date) - new Date(b.date)
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'category-asc':
          return (a.category || '').localeCompare(b.category || '')
        default:
          return 0
      }
    })

    return filtered
  }, [transactions, searchQuery, dateRange, selectedCategory, selectedCategories, amountRange, sortBy])

  return {
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    selectedCategory,
    setSelectedCategory,
    selectedCategories,
    setSelectedCategories,
    amountRange,
    setAmountRange,
    sortBy,
    setSortBy,
    filteredTransactions,
    clearFilters
  }
}

