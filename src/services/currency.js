// Currency Service

const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', code: 'CHF' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' }
}

// Exchange rates (mock - in production, fetch from API)
const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.8,
  AUD: 0.018,
  CAD: 0.016,
  CHF: 0.011,
  CNY: 0.086,
  SGD: 0.016
}

// Get all available currencies
export const getCurrencies = () => {
  return Object.values(CURRENCIES)
}

// Get currency by code
export const getCurrency = (code) => {
  return CURRENCIES[code] || CURRENCIES.INR
}

// Format amount with currency
export const formatCurrency = (amount, currencyCode = 'INR', options = {}) => {
  const currency = getCurrency(currencyCode)
  const { 
    showSymbol = true, 
    decimals = 2,
    locale = currencyCode === 'INR' ? 'en-IN' : 'en-US'
  } = options

  const formatted = Math.abs(amount).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  if (showSymbol) {
    return `${currency.symbol}${formatted}`
  }
  return formatted
}

// Convert amount from one currency to another
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to base currency (INR) first
  const baseAmount = amount / (EXCHANGE_RATES[fromCurrency] || 1)
  // Convert to target currency
  const convertedAmount = baseAmount * (EXCHANGE_RATES[toCurrency] || 1)
  
  return convertedAmount
}

// Get exchange rate
export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1
  return (EXCHANGE_RATES[toCurrency] || 1) / (EXCHANGE_RATES[fromCurrency] || 1)
}

// Fetch real-time exchange rates (mock implementation)
export const fetchExchangeRates = async (baseCurrency = 'INR') => {
  // In production, use a real API like exchangerate-api.com or fixer.io
  // For now, return mock rates
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(EXCHANGE_RATES)
    }, 100)
  })
}

// Save user's preferred currency to localStorage
export const savePreferredCurrency = (currencyCode) => {
  localStorage.setItem('preferredCurrency', currencyCode)
}

// Get user's preferred currency from localStorage
export const getPreferredCurrency = () => {
  return localStorage.getItem('preferredCurrency') || 'INR'
}

