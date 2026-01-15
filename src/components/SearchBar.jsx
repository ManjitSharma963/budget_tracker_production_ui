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
  selectedCategories = [],
  onCategoriesChange,
  amountRange,
  onAmountRangeChange,
  sortBy,
  onSortChange,
  onClearFilters,
  categories = [],
  viewMode,
  onQuickDateFilter,
  filterPresets = [],
  onSavePreset,
  onLoadPreset,
  isLoading
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [presetName, setPresetName] = useState('')
  const hasActiveFilters = searchQuery || dateRange.start || dateRange.end || selectedCategory || (selectedCategories && selectedCategories.length > 0) || amountRange?.min || amountRange?.max || sortBy !== 'date-desc'

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
          {/* Filter Presets */}
          {filterPresets && filterPresets.length > 0 && (
            <div className="filter-presets-section">
              <div className="presets-header">
                <label className="filter-label-small">Saved Presets</label>
                <button 
                  className="preset-toggle-btn"
                  onClick={() => setShowPresets(!showPresets)}
                >
                  {showPresets ? '▼' : '▶'}
                </button>
              </div>
              {showPresets && (
                <div className="presets-list">
                  {filterPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      className="preset-btn"
                      onClick={() => onLoadPreset && onLoadPreset(preset)}
                      title={preset.name}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="filter-row-compact">
            {categories.length > 0 && (
              <>
                <div className="filter-group-compact">
                  <label className="filter-label-small">Single Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      onCategoryChange(e.target.value)
                      // Clear multi-select when single is selected
                      if (onCategoriesChange && e.target.value) {
                        onCategoriesChange([])
                      }
                    }}
                    className="filter-select-small"
                  >
                    <option value="">All</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group-compact">
                  <label className="filter-label-small">Multiple Categories</label>
                  <select
                    multiple
                    value={selectedCategories || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      onCategoriesChange && onCategoriesChange(selected)
                      // Clear single select when multi is used
                      if (selected.length > 0 && onCategoryChange) {
                        onCategoryChange('')
                      }
                    }}
                    className="filter-select-small filter-multi-select"
                    size="3"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <small className="filter-hint">Hold Ctrl/Cmd to select multiple</small>
                </div>
              </>
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

          {/* Amount Range Filter */}
          <div className="filter-row-compact">
            <div className="filter-group-compact">
              <label className="filter-label-small">Min Amount (₹)</label>
              <input
                type="number"
                value={amountRange?.min || ''}
                onChange={(e) => onAmountRangeChange && onAmountRangeChange({ 
                  ...amountRange, 
                  min: e.target.value ? parseFloat(e.target.value) : null 
                })}
                className="filter-input-small"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="filter-group-compact">
              <label className="filter-label-small">Max Amount (₹)</label>
              <input
                type="number"
                value={amountRange?.max || ''}
                onChange={(e) => onAmountRangeChange && onAmountRangeChange({ 
                  ...amountRange, 
                  max: e.target.value ? parseFloat(e.target.value) : null 
                })}
                className="filter-input-small"
                placeholder="No limit"
                min="0"
                step="0.01"
              />
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

          {/* Save Preset */}
          {onSavePreset && (
            <div className="save-preset-section">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="preset-input"
              />
              <button
                className="save-preset-btn"
                onClick={() => {
                  if (presetName.trim()) {
                    onSavePreset({
                      name: presetName,
                      searchQuery,
                      dateRange,
                      selectedCategory,
                      selectedCategories,
                      amountRange,
                      sortBy
                    })
                    setPresetName('')
                  }
                }}
                disabled={!presetName.trim()}
              >
                💾 Save Preset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar

