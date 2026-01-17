import React from 'react'
import { getCurrencies, getPreferredCurrency, savePreferredCurrency } from '../services/currency'
import './CurrencySelector.css'

function CurrencySelector({ currentCurrency, onCurrencyChange }) {
  const currencies = getCurrencies()

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value
    savePreferredCurrency(newCurrency)
    onCurrencyChange(newCurrency)
  }

  return (
    <div className="currency-selector">
      <label htmlFor="currency-select" className="currency-label">
        Currency:
      </label>
      <select
        id="currency-select"
        value={currentCurrency}
        onChange={handleCurrencyChange}
        className="currency-select"
      >
        {currencies.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  )
}

export default CurrencySelector

