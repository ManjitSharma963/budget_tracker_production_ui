/**
 * Encryption Utilities
 * Provides data encryption for sensitive information
 * Note: For production, use a proper encryption library like crypto-js
 */

/**
 * Simple encryption for sensitive data (Base64 encoding)
 * WARNING: This is basic obfuscation, not true encryption
 * For production, use proper encryption with a secret key
 */
export const encryptData = (data) => {
  if (!data) return null
  try {
    const jsonString = JSON.stringify(data)
    return btoa(unescape(encodeURIComponent(jsonString)))
  } catch (error) {
    console.error('Encryption error:', error)
    return null
  }
}

/**
 * Decrypt data
 */
export const decryptData = (encryptedData) => {
  if (!encryptedData) return null
  try {
    const jsonString = decodeURIComponent(escape(atob(encryptedData)))
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

/**
 * Hash sensitive data (one-way)
 */
export const hashData = async (data) => {
  if (!data) return null
  try {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('Hashing error:', error)
    return null
  }
}

/**
 * Mask sensitive information (e.g., credit card numbers)
 */
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || typeof data !== 'string') return ''
  if (data.length <= visibleChars) return '*'.repeat(data.length)
  const visible = data.slice(-visibleChars)
  const masked = '*'.repeat(data.length - visibleChars)
  return masked + visible
}

/**
 * Encrypt amount (for storage)
 */
export const encryptAmount = (amount) => {
  if (typeof amount !== 'number') return null
  // In production, use proper encryption
  return encryptData({ amount, timestamp: Date.now() })
}

/**
 * Decrypt amount
 */
export const decryptAmount = (encryptedAmount) => {
  if (!encryptedAmount) return null
  const decrypted = decryptData(encryptedAmount)
  return decrypted?.amount || null
}

/**
 * Secure storage wrapper
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = encryptData(value)
      if (encrypted) {
        localStorage.setItem(key, encrypted)
      }
    } catch (error) {
      console.error('Secure storage error:', error)
    }
  },
  
  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key)
      if (encrypted) {
        return decryptData(encrypted)
      }
      return null
    } catch (error) {
      console.error('Secure storage error:', error)
      return null
    }
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key)
  }
}


