const API_BASE_URL = 'http://localhost:8080/api'

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

