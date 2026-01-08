// API Configuration
// Automatically detects API URL based on environment
const getApiBaseUrl = () => {
  // Priority 1: Environment variable (explicit override)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Auto-detect based on current hostname
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol; // 'https:' or 'http:'
    const port = window.location.port;
    
    // Production: Use same protocol and hostname (nginx handles /api routing)
    // Works for: www.trackmyexpenses.in, trackmyexpenses.in, or any production domain
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
      // For production domains, use same protocol and hostname
      // Nginx/Apache should proxy /api/* to backend
      // Only include port if it's a non-standard port (not 80/443)
      if (port && port !== '80' && port !== '443' && port !== '8080') {
        return `${protocol}//${host}:${port}/api`;
      }
      // Standard ports (80/443) - no port in URL
      return `${protocol}//${host}/api`;
    }
  }
  
  // Priority 3: Default to localhost for local development
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log API URL only in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No auth token found for request to:', endpoint);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Handle 404 Not Found - endpoint might not exist yet (for new features)
    if (response.status === 404) {
      const text = await response.text();
      let errorMessage = 'Endpoint not found. The backend might not have this feature yet.';
      try {
        const data = JSON.parse(text);
        errorMessage = data.error || data.message || errorMessage;
      } catch (e) {
        // If parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    // Handle 403 Forbidden - authentication issue
    // Only auto-logout for critical auth endpoints, not for feature endpoints that might not exist
    if (response.status === 403) {
      const text = await response.text();
      let errorMessage = 'Access denied.';
      try {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      } catch (e) {
        // If parsing fails, use default message
      }
      
      // Only auto-logout for critical auth endpoints (like /auth/me)
      // For other endpoints, just throw error without logging out
      const isAuthEndpoint = endpoint.includes('/auth/me') || endpoint.includes('/auth/login');
      
      if (isAuthEndpoint && token) {
        localStorage.removeItem('authToken');
        // Reload page to redirect to login
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
      
      throw new Error(errorMessage);
    }

    // Handle 204 No Content (DELETE requests)
    if (response.status === 204) {
      return { success: true };
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    const data = JSON.parse(text);
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the API server is running.');
    }
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== EXPENSES API ====================

export const expensesAPI = {
  // Get all expenses
  getAll: async () => {
    return apiCall('/expenses');
  },

  // Get single expense by ID
  getById: async (id) => {
    return apiCall(`/expenses/${id}`);
  },

  // Create new expense
  create: async (expenseData) => {
    return apiCall('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  // Update expense
  update: async (id, expenseData) => {
    return apiCall(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  // Delete expense
  delete: async (id) => {
    return apiCall(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== INCOME API ====================

export const incomeAPI = {
  // Get all income
  getAll: async () => {
    return apiCall('/income');
  },

  // Get single income by ID
  getById: async (id) => {
    return apiCall(`/income/${id}`);
  },

  // Create new income
  create: async (incomeData) => {
    return apiCall('/income', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  },

  // Update income
  update: async (id, incomeData) => {
    return apiCall(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incomeData),
    });
  },

  // Delete income
  delete: async (id) => {
    return apiCall(`/income/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CREDITS API ====================

export const creditsAPI = {
  // Get all credits
  getAll: async () => {
    return apiCall('/credits');
  },

  // Get single credit by ID
  getById: async (id) => {
    return apiCall(`/credits/${id}`);
  },

  // Create new credit
  create: async (creditData) => {
    return apiCall('/credits', {
      method: 'POST',
      body: JSON.stringify(creditData),
    });
  },

  // Update credit
  update: async (id, creditData) => {
    return apiCall(`/credits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(creditData),
    });
  },

  // Delete credit
  delete: async (id) => {
    return apiCall(`/credits/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== NOTES API ====================

export const notesAPI = {
  // Get all notes
  getAll: async () => {
    return apiCall('/notes');
  },

  // Get single note by ID
  getById: async (id) => {
    return apiCall(`/notes/${id}`);
  },

  // Create new note
  create: async (noteData) => {
    return apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  // Update note
  update: async (id, noteData) => {
    return apiCall(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  // Delete note
  delete: async (id) => {
    return apiCall(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PARTIES API ====================

export const partiesAPI = {
  // Get all parties
  getAll: async () => {
    return apiCall('/parties');
  },

  // Get single party by ID
  getById: async (id) => {
    return apiCall(`/parties/${id}`);
  },

  // Search parties
  search: async (query) => {
    return apiCall(`/parties/search?q=${encodeURIComponent(query)}`);
  },

  // Create new party
  create: async (partyData) => {
    // Map UI format to API format
    const apiData = {
      name: partyData.name,
      phone: partyData.contact || partyData.phone || undefined,
      notes: partyData.notes || undefined,
      openingBalance: partyData.openingBalance || 0.00
    };
    return apiCall('/parties', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  },

  // Update party
  update: async (id, partyData) => {
    // Map UI format to API format
    const apiData = {
      name: partyData.name,
      phone: partyData.contact || partyData.phone || undefined,
      notes: partyData.notes || undefined,
      openingBalance: partyData.openingBalance !== undefined ? partyData.openingBalance : undefined
    };
    return apiCall(`/parties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
  },

  // Delete party
  delete: async (id) => {
    return apiCall(`/parties/${id}`, {
      method: 'DELETE',
    });
  },

  // Get party ledger entries
  getLedger: async (partyId) => {
    return apiCall(`/ledger/parties/${partyId}/entries`);
  },

  // Get party summary
  getSummary: async (partyId) => {
    return apiCall(`/ledger/parties/${partyId}/summary`);
  },

  // Get party outstanding balance
  getOutstanding: async (partyId) => {
    return apiCall(`/ledger/parties/${partyId}/outstanding`);
  },
};

// ==================== LEDGER ENTRIES API ====================

export const ledgerAPI = {
  // Get single ledger entry by ID
  getById: async (entryId) => {
    return apiCall(`/ledger/entries/${entryId}`);
  },

  // Add ledger entry (purchase, payment, adjustment)
  create: async (partyId, entryData) => {
    // Map UI format to API format
    const apiData = {
      party: { id: partyId },
      transactionType: entryData.type?.toUpperCase() || 'PURCHASE',
      amount: entryData.amount,
      transactionDate: entryData.date,
      description: entryData.description || undefined,
      referenceNumber: entryData.reference || entryData.referenceNumber || undefined,
      paymentMode: entryData.paymentMode || undefined
    };
    return apiCall('/ledger/entries', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  },

  // Update ledger entry
  update: async (entryId, entryData) => {
    // Map UI format to API format
    const apiData = {
      amount: entryData.amount !== undefined ? entryData.amount : undefined,
      transactionDate: entryData.date || undefined,
      description: entryData.description || undefined,
      referenceNumber: entryData.reference || undefined
    };
    // Remove undefined fields
    Object.keys(apiData).forEach(key => apiData[key] === undefined && delete apiData[key]);
    return apiCall(`/ledger/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
  },

  // Delete ledger entry
  delete: async (entryId) => {
    return apiCall(`/ledger/entries/${entryId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  return apiCall('/health');
};

