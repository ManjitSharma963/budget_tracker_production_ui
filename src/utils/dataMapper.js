// Utility functions to map between UI data format and API format

// ==================== EXPENSES MAPPING ====================

/**
 * Convert API expense format to UI format
 * API: { id, amount, description, category, createdAt, updatedAt }
 * UI: { id, date, description, amount, type, category, paymentMode, note, budget, remaining, categoryColor }
 */
export const mapExpenseFromAPI = (apiExpense) => {
  return {
    id: apiExpense.id,
    date: apiExpense.createdAt ? apiExpense.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    description: apiExpense.description || apiExpense.category,
    amount: apiExpense.amount,
    type: 'expense',
    category: apiExpense.category,
    paymentMode: apiExpense.paymentMode || 'Cash',
    note: apiExpense.note || apiExpense.description || '',
    budget: apiExpense.budget || 0,
    remaining: apiExpense.remaining || 0,
    categoryColor: apiExpense.categoryColor || getCategoryColor(apiExpense.category)
  };
};

/**
 * Convert UI expense format to API format
 */
export const mapExpenseToAPI = (uiExpense) => {
  return {
    amount: parseFloat(uiExpense.amount),
    description: uiExpense.description || uiExpense.category,
    category: uiExpense.category
  };
};

// ==================== INCOME MAPPING ====================

/**
 * Convert API income format to UI format
 * API: { id, amount, description, source, createdAt, updatedAt }
 * UI: { id, date, description, amount, type, category, paymentMode, note, categoryColor }
 */
export const mapIncomeFromAPI = (apiIncome) => {
  return {
    id: apiIncome.id,
    date: apiIncome.createdAt ? apiIncome.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    description: apiIncome.description || apiIncome.source,
    amount: apiIncome.amount,
    type: 'income',
    category: apiIncome.source, // Map source to category for UI
    paymentMode: apiIncome.paymentMode || 'Cash',
    note: apiIncome.note || apiIncome.description || '',
    categoryColor: apiIncome.categoryColor || getCategoryColor(apiIncome.source)
  };
};

/**
 * Convert UI income format to API format
 */
export const mapIncomeToAPI = (uiIncome) => {
  return {
    amount: parseFloat(uiIncome.amount),
    description: uiIncome.description || uiIncome.category,
    source: uiIncome.category // Map category to source for API
  };
};

// ==================== CREDITS MAPPING ====================

/**
 * Convert API credit format to UI format
 * API: { id, amount, description, creditor, creditType, createdAt, updatedAt }
 * UI: { id, date, amount, creditType, personName, note }
 */
export const mapCreditFromAPI = (apiCredit) => {
  // Use creditType from API if available, otherwise determine from description
  let creditType = 'borrowed';
  
  if (apiCredit.creditType) {
    creditType = apiCredit.creditType.toLowerCase();
  } else {
    // Fallback: Determine creditType based on description
    const description = (apiCredit.description || '').toLowerCase();
    if (description.includes('lent') || description.includes('gave')) {
      creditType = 'lent';
    } else if (description.includes('borrowed') || description.includes('took')) {
      creditType = 'borrowed';
    }
  }
  
  return {
    id: apiCredit.id,
    date: apiCredit.createdAt ? apiCredit.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    amount: apiCredit.amount,
    creditType: creditType,
    personName: apiCredit.creditor,
    note: apiCredit.description || ''
  };
};

/**
 * Convert UI credit format to API format
 */
export const mapCreditToAPI = (uiCredit) => {
  // Use note if provided, otherwise build description based on creditType
  let description = uiCredit.note;
  
  if (!description || description.trim() === '') {
    description = uiCredit.creditType === 'borrowed' || uiCredit.creditType === 'Borrowed'
      ? `Borrowed from ${uiCredit.personName}`
      : `Lent to ${uiCredit.personName}`;
  }
  
  // Map creditType (capitalize first letter)
  const creditType = uiCredit.creditType || 'borrowed';
  const finalCreditType = creditType.charAt(0).toUpperCase() + creditType.slice(1).toLowerCase();
  
  return {
    amount: parseFloat(uiCredit.amount),
    description: description,
    creditor: uiCredit.personName,
    creditType: finalCreditType === 'Borrowed' || finalCreditType === 'Lent' ? finalCreditType : 'Borrowed'
  };
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get category color (same as in App.jsx)
 */
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
    'Other Add Income Type': '#95a5a6',
    'Employer': '#2ecc71'
  };
  
  if (colorMap[category]) {
    return colorMap[category];
  }
  
  const colors = ['#FF6B35', '#E63946', '#4ECDC4', '#45B7D1', '#F7B731', '#9B59B6', '#FF69B4', '#E63946'];
  const hash = category ? category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  return colors[hash % colors.length];
};

