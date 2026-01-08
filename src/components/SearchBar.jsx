import React, { useState } from 'react'
import './SearchBar.css'

function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  onDateRangeChange, 
  dateRange, 
  onExportCSV, 
  onToggleSummary, 
  showSummary,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters,
  categories = [],
  viewMode,
  onQuickDateFilter,
  isLoading
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const hasActiveFilters = searchQuery || dateRange.start || dateRange.end || selectedCategory || sortBy !== 'date-desc'

  const quickDateFilters = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
    { label: 'Last Month', value: 'last-month' }
  ]

  const sortOptions = [
    { label: 'Date (Newest)', value: 'date-desc' },
    { label: 'Date (Oldest)', value: 'date-asc' },
    { label: 'Amount (High)', value: 'amount-desc' },
    { label: 'Amount (Low)', value: 'amount-asc' },
    { label: 'Category (A-Z)', value: 'category-asc' }
  ]

  return (
    <div className="search-bar-container">
      {/* Main Search Bar with Action Buttons */}
      <div className="search-bar-with-actions">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={viewMode === 'parties' ? "Search parties by name, phone, or notes... (Ctrl+K)" : "Search transactions... (Ctrl+K)"}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
          {hasActiveFilters && (
            <button 
              className="clear-filters-btn"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="action-buttons-inline">
          <button 
            className="action-btn-compact export-btn"
            onClick={onExportCSV}
            title="Export to CSV"
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '📥'}
          </button>
          {(categories.length > 0 || viewMode === 'expenses' || viewMode === 'income') && (
            <button 
              className="action-btn-compact filter-toggle-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              title={showAdvancedFilters ? "Hide Filters" : "Show Filters"}
            >
              {showAdvancedFilters ? '▲' : '▼'} Filters
            </button>
          )}
        </div>
      </div>
      
      
      {/* Advanced Filters (Collapsible) */}
      {showAdvancedFilters && (
        <div className="advanced-filters-panel">
          <div className="filter-row-compact">
            {categories.length > 0 && (
              <div className="filter-group-compact">
                <label className="filter-label-small">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="filter-select-small"
                >
                  <option value="">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="filter-group-compact">
              <label className="filter-label-small">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="filter-select-small"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="date-range-compact">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="date-input-small"
              placeholder="From"
            />
            <span className="date-separator-small">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="date-input-small"
              placeholder="To"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar

