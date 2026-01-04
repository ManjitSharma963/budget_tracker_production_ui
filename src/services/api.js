// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

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
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

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
      throw new Error('Unable to connect to server. Please make sure the API server is running on http://localhost:8080');
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

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  return apiCall('/health');
};

