import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatTime,
  getQueryObject,
  byteLength,
  cleanArray,
  param,
  param2Obj,
  objectMerge,
  deepClone,
  uniqueArr,
  createUniqueString,
  makeMap,
  titleCase,
  camelCase,
  isNumberStr,
} from '../index'

describe('index.js', () => {
  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-01-15T10:30:45')
      expect(result).toBe('2024-01-15 10:30:45')
    })

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate('')).toBe('')
    })
  })

  describe('formatTime', () => {
    it('should return "刚刚" for recent timestamps', () => {
      const now = Date.now()
      expect(formatTime(now)).toBe('刚刚')
    })

    it('should return minutes ago', () => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000
      const result = formatTime(fiveMinAgo)
      expect(result).toContain('分钟前')
    })

    it('should return hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 3600 * 1000
      const result = formatTime(twoHoursAgo)
      expect(result).toContain('小时前')
    })

    it('should handle 10-digit timestamps (seconds)', () => {
      const now = Math.floor(Date.now() / 1000)
      const result = formatTime(String(now))
      expect(result).toBe('刚刚')
    })
  })

  describe('getQueryObject', () => {
    it('should parse query string from url', () => {
      const result = getQueryObject('http://example.com?name=test&age=25')
      expect(result.name).toBe('test')
      expect(result.age).toBe('25')
    })

    it('should handle encoded params', () => {
      const result = getQueryObject('http://example.com?name=%E4%B8%AD%E6%96%87')
      expect(result.name).toBe('中文')
    })
  })

  describe('byteLength', () => {
    it('should return correct byte length for ASCII', () => {
      expect(byteLength('hello')).toBe(5)
    })

    it('should return correct byte length for Chinese chars', () => {
      expect(byteLength('中文')).toBe(6)
    })

    it('should return 0 for empty string', () => {
      expect(byteLength('')).toBe(0)
    })
  })

  describe('cleanArray', () => {
    it('should remove falsy values', () => {
      expect(cleanArray([1, null, 2, undefined, 3, '', 0])).toEqual([1, 2, 3])
    })

    it('should return empty array for all falsy', () => {
      expect(cleanArray([null, undefined, 0, ''])).toEqual([])
    })
  })

  describe('param', () => {
    it('should serialize object to query string', () => {
      const result = param({ name: 'test', age: 25 })
      expect(result).toBe('name=test&age=25')
    })

    it('should return empty string for null', () => {
      expect(param(null)).toBe('')
    })

    it('should skip undefined values', () => {
      expect(param({ a: 'ok', b: undefined })).toBe('a=ok')
    })
  })

  describe('param2Obj', () => {
    it('should parse url query to object', () => {
      const result = param2Obj('http://example.com?name=test&age=25')
      expect(result).toEqual({ name: 'test', age: '25' })
    })

    it('should return empty object for no query', () => {
      expect(param2Obj('http://example.com')).toEqual({})
    })
  })

  describe('objectMerge', () => {
    it('should merge objects', () => {
      const result = objectMerge({ a: 1 }, { b: 2 })
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should deep merge', () => {
      const result = objectMerge({ nested: { a: 1 } }, { nested: { b: 2 } })
      expect(result.nested).toEqual({ a: 1, b: 2 })
    })

    it('should return array copy for array source', () => {
      const result = objectMerge({}, [1, 2, 3])
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle non-object target', () => {
      const result = objectMerge('string', { a: 1 })
      expect(result).toEqual({ a: 1 })
    })
  })

  describe('deepClone', () => {
    it('should clone objects', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
    })

    it('should clone arrays', () => {
      const original = [1, [2, 3], { a: 4 }]
      const cloned = deepClone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })
  })

  describe('uniqueArr', () => {
    it('should remove duplicates', () => {
      expect(uniqueArr([1, 2, 2, 3, 3])).toEqual([1, 2, 3])
    })

    it('should handle strings', () => {
      expect(uniqueArr(['a', 'b', 'a'])).toEqual(['a', 'b'])
    })
  })

  describe('createUniqueString', () => {
    it('should return a string', () => {
      const result = createUniqueString()
      expect(typeof result).toBe('string')
    })

    it('should generate unique values', () => {
      const a = createUniqueString()
      const b = createUniqueString()
      expect(a).not.toBe(b)
    })
  })

  describe('makeMap', () => {
    it('should create map from comma-separated string', () => {
      const map = makeMap('div,span,p')
      expect(map('div')).toBe(true)
      expect(map('span')).toBe(true)
      expect(map('h1')).toBeUndefined()
    })

    it('should support case insensitive lookup', () => {
      const map = makeMap('div,span', true)
      expect(map('DIV')).toBe(true)
      expect(map('SPAN')).toBe(true)
    })
  })

  describe('titleCase', () => {
    it('should capitalize first letter of each word', () => {
      expect(titleCase('hello world')).toBe('Hello World')
    })

    it('should capitalize first letter of string', () => {
      expect(titleCase('hello')).toBe('Hello')
    })
  })

  describe('camelCase', () => {
    it('should convert underscore to camelCase', () => {
      expect(camelCase('hello_world')).toBe('helloWorld')
    })

    it('should handle multiple underscores', () => {
      expect(camelCase('a_b_c')).toBe('aBC')
    })

    it('should return unchanged if no underscores', () => {
      expect(camelCase('hello')).toBe('hello')
    })
  })

  describe('isNumberStr', () => {
    it('should return true for integer strings', () => {
      expect(isNumberStr('123')).toBe(true)
      expect(isNumberStr('0')).toBe(true)
    })

    it('should return true for decimal strings', () => {
      expect(isNumberStr('12.34')).toBe(true)
    })

    it('should return true for negative numbers', () => {
      expect(isNumberStr('-5')).toBe(true)
    })

    it('should return true for positive sign', () => {
      expect(isNumberStr('+5')).toBe(true)
    })

    it('should return false for non-numeric strings', () => {
      expect(isNumberStr('abc')).toBe(false)
      expect(isNumberStr('')).toBe(false)
    })
  })
})
