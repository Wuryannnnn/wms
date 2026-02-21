import { describe, it, expect } from 'vitest'
import {
  isHttp,
  isExternal,
  validUsername,
  validURL,
  validLowerCase,
  validUpperCase,
  validAlphabets,
  validEmail,
  isString,
  isArray,
} from '../validate'

describe('validate.js', () => {
  describe('isHttp', () => {
    it('should return true for http urls', () => {
      expect(isHttp('http://example.com')).toBe(true)
    })
    it('should return true for https urls', () => {
      expect(isHttp('https://example.com')).toBe(true)
    })
    it('should return false for non-http urls', () => {
      expect(isHttp('/api/test')).toBe(false)
      expect(isHttp('ftp://example.com')).toBe(false)
    })
  })

  describe('isExternal', () => {
    it('should return true for https links', () => {
      expect(isExternal('https://example.com')).toBe(true)
    })
    it('should return true for http links', () => {
      expect(isExternal('http://example.com')).toBe(true)
    })
    it('should return true for mailto links', () => {
      expect(isExternal('mailto:test@example.com')).toBe(true)
    })
    it('should return true for tel links', () => {
      expect(isExternal('tel:123456')).toBe(true)
    })
    it('should return false for relative paths', () => {
      expect(isExternal('/dashboard')).toBe(false)
      expect(isExternal('dashboard')).toBe(false)
    })
  })

  describe('validUsername', () => {
    it('should return true for admin', () => {
      expect(validUsername('admin')).toBe(true)
    })
    it('should return true for editor', () => {
      expect(validUsername('editor')).toBe(true)
    })
    it('should trim whitespace', () => {
      expect(validUsername('  admin  ')).toBe(true)
    })
    it('should return false for unknown users', () => {
      expect(validUsername('guest')).toBe(false)
      expect(validUsername('')).toBe(false)
    })
  })

  describe('validURL', () => {
    it('should return true for valid http urls', () => {
      expect(validURL('http://example.com')).toBe(true)
    })
    it('should return true for valid https urls', () => {
      expect(validURL('https://www.example.com')).toBe(true)
    })
    it('should return false for invalid urls', () => {
      expect(validURL('not-a-url')).toBe(false)
      expect(validURL('')).toBe(false)
    })
  })

  describe('validLowerCase', () => {
    it('should return true for lowercase strings', () => {
      expect(validLowerCase('abc')).toBe(true)
    })
    it('should return false for uppercase strings', () => {
      expect(validLowerCase('ABC')).toBe(false)
    })
    it('should return false for mixed case', () => {
      expect(validLowerCase('aBc')).toBe(false)
    })
    it('should return false for empty strings', () => {
      expect(validLowerCase('')).toBe(false)
    })
    it('should return false for strings with numbers', () => {
      expect(validLowerCase('abc123')).toBe(false)
    })
  })

  describe('validUpperCase', () => {
    it('should return true for uppercase strings', () => {
      expect(validUpperCase('ABC')).toBe(true)
    })
    it('should return false for lowercase', () => {
      expect(validUpperCase('abc')).toBe(false)
    })
    it('should return false for empty strings', () => {
      expect(validUpperCase('')).toBe(false)
    })
  })

  describe('validAlphabets', () => {
    it('should return true for alphabetic strings', () => {
      expect(validAlphabets('abcABC')).toBe(true)
    })
    it('should return false for numeric strings', () => {
      expect(validAlphabets('123')).toBe(false)
    })
    it('should return false for mixed', () => {
      expect(validAlphabets('abc123')).toBe(false)
    })
  })

  describe('validEmail', () => {
    it('should return true for valid emails', () => {
      expect(validEmail('test@example.com')).toBe(true)
      expect(validEmail('user.name@domain.co')).toBe(true)
    })
    it('should return false for invalid emails', () => {
      expect(validEmail('not-an-email')).toBe(false)
      expect(validEmail('@example.com')).toBe(false)
      expect(validEmail('test@')).toBe(false)
    })
  })

  describe('isString', () => {
    it('should return true for string primitives', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
    })
    it('should return true for String objects', () => {
      expect(isString(new String('hello'))).toBe(true)
    })
    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString([])).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })
    it('should return false for non-arrays', () => {
      expect(isArray('string')).toBe(false)
      expect(isArray(123)).toBe(false)
      expect(isArray({})).toBe(false)
      expect(isArray(null)).toBe(false)
    })
  })
})
