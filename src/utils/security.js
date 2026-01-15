/**
 * Security Utilities
 * Provides input sanitization, XSS protection, and data validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return ''
  
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/**
 * Sanitize user input (remove potentially dangerous characters)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/&#/g, '') // Remove HTML entities
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/</g, '&lt;') // Escape <
    .replace(/>/g, '&gt;') // Escape >
    .replace(/"/g, '&quot;') // Escape "
    .replace(/'/g, '&#x27;') // Escape '
    .replace(/\//g, '&#x2F;') // Escape /
}

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return ''
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with _
    .replace(/\.\./g, '') // Remove path traversal attempts
    .substring(0, 255) // Limit length
}

/**
 * Validate file type for uploads
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  if (!file || !file.type) return false
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size (in bytes)
 */
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => { // 5MB default
  if (!file || !file.size) return false
  return file.size <= maxSize
}

/**
 * Sanitize amount (prevent injection)
 */
export const sanitizeAmount = (amount) => {
  if (typeof amount === 'number') return Math.abs(amount)
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ''))
    return isNaN(parsed) ? 0 : Math.abs(parsed)
  }
  return 0
}

/**
 * Sanitize date string
 */
export const sanitizeDate = (date) => {
  if (!date) return null
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  if (typeof date === 'string') {
    // Validate YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (dateRegex.test(date)) {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        return date
      }
    }
  }
  return null
}

/**
 * Escape special characters for regex
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validate URL
 */
export const validateURL = (url) => {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Rate limiting helper (client-side check)
 */
export const createRateLimiter = (maxRequests = 10, windowMs = 60000) => {
  const requests = []
  
  return () => {
    const now = Date.now()
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < now - windowMs) {
      requests.shift()
    }
    
    if (requests.length >= maxRequests) {
      return false // Rate limit exceeded
    }
    
    requests.push(now)
    return true // Request allowed
  }
}

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  if (typeof obj === 'object') {
    const sanitized = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const sanitizedKey = sanitizeInput(key)
        sanitized[sanitizedKey] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }
  
  return obj
}


