// API Configuration
// Use environment variable or detect the current host
const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // If accessing from a public IP or domain, use same protocol/host but /api path
    // This assumes nginx/apache is proxying /api to backend:8080
    if (host !== 'localhost' && host !== '127.0.0.1') {
      // Use same domain WITHOUT port 8080, let reverse proxy handle routing
      // Only include port if it's not 80/443 (standard HTTP/HTTPS ports)
      if (port && port !== '80' && port !== '443') {
        return `${protocol}//${host}:${port}/api`;
      }
      return `${protocol}//${host}/api`;
    }
  }
  // Default to localhost for local development
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

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

    // Handle 403 Forbidden - authentication issue
    if (response.status === 403) {
      const text = await response.text();
      let errorMessage = 'Access denied. Please login again.';
      try {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      } catch (e) {
        // If parsing fails, use default message
      }
      
      // Clear invalid token
      if (token) {
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

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  return apiCall('/health');
};

