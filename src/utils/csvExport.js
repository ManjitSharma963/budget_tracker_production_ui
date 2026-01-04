// CSV Export Utility

export const exportToCSV = (data, filename = 'expenses') => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first item
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values with commas, quotes, or newlines
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export const exportTransactionsToCSV = (transactions, viewMode) => {
  const csvData = transactions.map(t => ({
    Date: t.date,
    Type: t.type === 'expense' ? 'Expense' : 'Income',
    Description: t.description || '',
    Category: t.category || '',
    Amount: t.amount,
    'Payment Mode': t.paymentMode || '',
    Note: t.note || ''
  }))
  
  exportToCSV(csvData, `${viewMode}_transactions`)
}

export const exportCreditsToCSV = (credits) => {
  const csvData = credits.map(c => ({
    Date: c.date,
    Type: c.creditType === 'borrowed' ? 'Borrowed' : 'Lent',
    'Person Name': c.personName || '',
    Amount: c.amount,
    Note: c.note || ''
  }))
  
  exportToCSV(csvData, 'credits')
}

