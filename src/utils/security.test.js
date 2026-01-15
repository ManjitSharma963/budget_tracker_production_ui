import { describe, it, expect } from 'vitest'
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  sanitizeFileName,
  validateFileType,
  validateFileSize,
  sanitizeAmount,
  sanitizeDate,
  validateURL,
  sanitizeObject
} from './security'

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes dangerous HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>')
      expect(sanitizeInput('<img src=x onerror=alert(1)>')).not.toContain('onerror')
    })

    it('escapes special characters', () => {
      const result = sanitizeInput('<>&"\'')
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('handles non-string input', () => {
      expect(sanitizeInput(null)).toBe(null)
      expect(sanitizeInput(123)).toBe(123)
    })
  })

  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('Password123')).toBe(true)
      expect(validatePassword('StrongPass1')).toBe(true)
    })

    it('rejects weak passwords', () => {
      expect(validatePassword('weak')).toBe(false)
      expect(validatePassword('weakpass')).toBe(false)
      expect(validatePassword('WEAKPASS')).toBe(false)
      expect(validatePassword('WeakPass')).toBe(false)
    })
  })

  describe('sanitizeFileName', () => {
    it('removes invalid characters', () => {
      expect(sanitizeFileName('file<>name.txt')).toBe('file__name.txt')
      expect(sanitizeFileName('../../../etc/passwd')).not.toContain('..')
    })

    it('limits file name length', () => {
      const longName = 'a'.repeat(300)
      expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255)
    })
  })

  describe('validateFileType', () => {
    it('validates allowed file types', () => {
      const imageFile = { type: 'image/jpeg' }
      expect(validateFileType(imageFile)).toBe(true)
    })

    it('rejects disallowed file types', () => {
      const scriptFile = { type: 'application/javascript' }
      expect(validateFileType(scriptFile)).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('validates file size within limit', () => {
      const smallFile = { size: 1024 * 1024 } // 1MB
      expect(validateFileSize(smallFile, 5 * 1024 * 1024)).toBe(true)
    })

    it('rejects files exceeding limit', () => {
      const largeFile = { size: 10 * 1024 * 1024 } // 10MB
      expect(validateFileSize(largeFile, 5 * 1024 * 1024)).toBe(false)
    })
  })

  describe('sanitizeAmount', () => {
    it('handles numeric input', () => {
      expect(sanitizeAmount(100)).toBe(100)
      expect(sanitizeAmount(-50)).toBe(50) // Absolute value
    })

    it('handles string input', () => {
      expect(sanitizeAmount('100.50')).toBe(100.5)
      expect(sanitizeAmount('$100')).toBe(100)
    })

    it('returns 0 for invalid input', () => {
      expect(sanitizeAmount('invalid')).toBe(0)
      expect(sanitizeAmount(null)).toBe(0)
    })
  })

  describe('sanitizeDate', () => {
    it('validates correct date format', () => {
      expect(sanitizeDate('2024-01-15')).toBe('2024-01-15')
    })

    it('rejects invalid date formats', () => {
      expect(sanitizeDate('invalid-date')).toBe(null)
      expect(sanitizeDate('15/01/2024')).toBe(null)
    })

    it('handles Date objects', () => {
      const date = new Date('2024-01-15')
      expect(sanitizeDate(date)).toBe('2024-01-15')
    })
  })

  describe('validateURL', () => {
    it('validates correct URLs', () => {
      expect(validateURL('https://example.com')).toBe(true)
      expect(validateURL('http://example.com')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(validateURL('javascript:alert(1)')).toBe(false)
      expect(validateURL('not-a-url')).toBe(false)
    })
  })

  describe('sanitizeObject', () => {
    it('sanitizes nested objects', () => {
      const obj = {
        name: '<script>alert(1)</script>',
        nested: {
          value: '<img src=x>'
        }
      }
      const sanitized = sanitizeObject(obj)
      expect(sanitized.name).not.toContain('<script>')
      expect(sanitized.nested.value).not.toContain('<img')
    })

    it('sanitizes arrays', () => {
      const arr = ['<script>', 'normal', '<img>']
      const sanitized = sanitizeObject(arr)
      expect(sanitized[0]).not.toContain('<script>')
      expect(sanitized[1]).toBe('normal')
    })
  })
})


