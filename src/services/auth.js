// API Configuration
// Use environment variable or detect the current host
const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol; // Will be 'https:' or 'http:'
    const port = window.location.port;
    
    // If accessing from a public IP or domain, use same protocol/host but /api path
    // This assumes nginx/apache is proxying /api to backend:8080
    if (host !== 'localhost' && host !== '127.0.0.1') {
      // Use same protocol (http/https) and domain WITHOUT port 8080
      // Only include port if it's a non-standard port (not 80/443)
      // NEVER use port 8080 for production domains - nginx handles routing
      if (port && port !== '80' && port !== '443' && port !== '8080') {
        return `${protocol}//${host}:${port}/api`;
      }
      // Use same protocol as the page (https if page is https, http if page is http)
      return `${protocol}//${host}/api`;
    }
  }
  // Default to localhost for local development
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl()

// Debug: Log API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Store token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token)
}

export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

export const removeAuthToken = () => {
  localStorage.removeItem('authToken')
}

// Register a new user
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))
      throw new Error(errorData.error || errorData.message || 'Registration failed')
    }

    const data = await response.json()
    // Registration doesn't return token, user needs to login
    return data
  } catch (error) {
    if (error.message) {
      throw error
    }
    throw new Error('Network error. Please check if the server is running.')
  }
}

// Login user
export const login = async (email, password) => {
  try {
    // Prepare request body exactly as curl format
    const requestBody = {
      email: email,
      password: password
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(errorData.error || errorData.message || 'Invalid email or password')
    }

    const data = await response.json()
    if (data.token) {
      setAuthToken(data.token)
    }
    return data
  } catch (error) {
    if (error.message) {
      throw error
    }
    throw new Error('Network error. Please check if the server is running.')
  }
}

// Logout user
export const logout = () => {
  removeAuthToken()
}

// Get current user info
export const getCurrentUser = async () => {
  const token = getAuthToken()
  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      removeAuthToken()
      return null
    }

    return await response.json()
  } catch (error) {
    removeAuthToken()
    return null
  }
}

