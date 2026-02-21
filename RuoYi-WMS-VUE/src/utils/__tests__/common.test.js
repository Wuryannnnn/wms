import { describe, it, expect } from 'vitest'
import {
  parseTime,
  addDateRange,
  selectDictLabel,
  selectDictLabels,
  sprintf,
  parseStrEmpty,
  mergeRecursive,
  handleTree,
  tansParams,
  getNormalPath,
  blobValidate,
  numSub,
} from '../common'

describe('common.js', () => {
  describe('parseTime', () => {
    it('should return null for empty arguments', () => {
      expect(parseTime(null)).toBe(null)
      expect(parseTime(undefined)).toBe(null)
      expect(parseTime('')).toBe(null)
      expect(parseTime(0)).toBe(null)
    })

    it('should format Date object with default pattern', () => {
      const date = new Date(2024, 0, 15, 10, 30, 45) // Jan 15, 2024
      const result = parseTime(date)
      expect(result).toBe('2024-01-15 10:30:45')
    })

    it('should format with custom pattern', () => {
      const date = new Date(2024, 0, 15, 10, 30, 45)
      expect(parseTime(date, '{y}/{m}/{d}')).toBe('2024/01/15')
    })

    it('should handle numeric timestamp (seconds)', () => {
      const timestamp = Math.floor(new Date(2024, 0, 15, 10, 30, 45).getTime() / 1000)
      const result = parseTime(timestamp)
      expect(result).toBe('2024-01-15 10:30:45')
    })

    it('should handle numeric timestamp (milliseconds)', () => {
      const timestamp = new Date(2024, 0, 15, 10, 30, 45).getTime()
      const result = parseTime(timestamp)
      expect(result).toBe('2024-01-15 10:30:45')
    })

    it('should handle string timestamp', () => {
      const timestamp = String(new Date(2024, 0, 15, 10, 30, 45).getTime())
      const result = parseTime(timestamp)
      expect(result).toBe('2024-01-15 10:30:45')
    })

    it('should handle ISO date strings', () => {
      const result = parseTime('2024-01-15T10:30:45.000')
      expect(result).toContain('2024-01-15')
    })
  })

  describe('addDateRange', () => {
    it('should add default date range params', () => {
      const params = {}
      const result = addDateRange(params, ['2024-01-01', '2024-12-31'])
      expect(result.params.beginTime).toBe('2024-01-01')
      expect(result.params.endTime).toBe('2024-12-31')
    })

    it('should add named date range params', () => {
      const params = {}
      const result = addDateRange(params, ['2024-01-01', '2024-12-31'], 'CreateTime')
      expect(result.params.beginCreateTime).toBe('2024-01-01')
      expect(result.params.endCreateTime).toBe('2024-12-31')
    })

    it('should handle empty dateRange', () => {
      const params = {}
      const result = addDateRange(params, null)
      expect(result.params.beginTime).toBeUndefined()
      expect(result.params.endTime).toBeUndefined()
    })

    it('should preserve existing params', () => {
      const params = { params: { existing: 'value' } }
      const result = addDateRange(params, ['2024-01-01', '2024-12-31'])
      expect(result.params.existing).toBe('value')
      expect(result.params.beginTime).toBe('2024-01-01')
    })
  })

  describe('selectDictLabel', () => {
    const dicts = [
      { value: '1', label: 'Active' },
      { value: '2', label: 'Inactive' },
    ]

    it('should return matching label', () => {
      expect(selectDictLabel(dicts, '1')).toBe('Active')
      expect(selectDictLabel(dicts, 1)).toBe('Active')
    })

    it('should return value if no match', () => {
      expect(selectDictLabel(dicts, '3')).toBe('3')
    })

    it('should return empty string for undefined', () => {
      expect(selectDictLabel(dicts, undefined)).toBe('')
    })
  })

  describe('selectDictLabels', () => {
    const dicts = [
      { value: '1', label: 'Active' },
      { value: '2', label: 'Inactive' },
      { value: '3', label: 'Pending' },
    ]

    it('should return comma-separated labels', () => {
      expect(selectDictLabels(dicts, '1,2')).toBe('Active,Inactive')
    })

    it('should handle array values', () => {
      expect(selectDictLabels(dicts, ['1', '2'])).toBe('Active,Inactive')
    })

    it('should return empty string for undefined', () => {
      expect(selectDictLabels(dicts, undefined)).toBe('')
    })

    it('should return empty string for empty', () => {
      expect(selectDictLabels(dicts, '')).toBe('')
    })

    it('should handle custom separator', () => {
      expect(selectDictLabels(dicts, '1|2', '|')).toBe('Active|Inactive')
    })
  })

  describe('sprintf', () => {
    it('should replace %s with arguments', () => {
      expect(sprintf('Hello %s!', 'World')).toBe('Hello World!')
    })

    it('should replace multiple %s', () => {
      expect(sprintf('%s + %s = %s', 1, 2, 3)).toBe('1 + 2 = 3')
    })

    it('should return empty string if args are missing', () => {
      expect(sprintf('Hello %s %s!', 'World')).toBe('')
    })
  })

  describe('parseStrEmpty', () => {
    it('should return empty string for falsy values', () => {
      expect(parseStrEmpty(null)).toBe('')
      expect(parseStrEmpty(undefined)).toBe('')
      expect(parseStrEmpty('')).toBe('')
    })

    it('should return empty for string "undefined" and "null"', () => {
      expect(parseStrEmpty('undefined')).toBe('')
      expect(parseStrEmpty('null')).toBe('')
    })

    it('should return the original string for valid values', () => {
      expect(parseStrEmpty('hello')).toBe('hello')
      expect(parseStrEmpty('123')).toBe('123')
    })
  })

  describe('mergeRecursive', () => {
    it('should merge flat objects', () => {
      const result = mergeRecursive({ a: 1 }, { b: 2 })
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should deep merge nested objects', () => {
      const source = { nested: { a: 1 } }
      const target = { nested: { b: 2 } }
      const result = mergeRecursive(source, target)
      expect(result.nested.a).toBe(1)
      expect(result.nested.b).toBe(2)
    })

    it('should override primitive values', () => {
      const result = mergeRecursive({ a: 1 }, { a: 2 })
      expect(result.a).toBe(2)
    })
  })

  describe('handleTree', () => {
    it('should build tree structure from flat data', () => {
      const data = [
        { id: 1, parentId: 0, name: 'root' },
        { id: 2, parentId: 1, name: 'child1' },
        { id: 3, parentId: 1, name: 'child2' },
      ]
      const tree = handleTree(data)
      expect(tree).toHaveLength(1)
      expect(tree[0].children).toHaveLength(2)
    })

    it('should handle empty data', () => {
      expect(handleTree([])).toEqual([])
    })

    it('should support custom field names', () => {
      const data = [
        { uid: 1, pid: 0, name: 'root' },
        { uid: 2, pid: 1, name: 'child' },
      ]
      const tree = handleTree(data, 'uid', 'pid', 'items')
      expect(tree).toHaveLength(1)
      expect(tree[0].items).toHaveLength(1)
    })
  })

  describe('tansParams', () => {
    it('should transform flat params', () => {
      const result = tansParams({ name: 'test', age: 25 })
      expect(result).toContain('name=test')
      expect(result).toContain('age=25')
    })

    it('should transform nested params', () => {
      const result = tansParams({ filter: { status: 'active' } })
      expect(result).toContain('filter%5Bstatus%5D=active')
    })

    it('should skip null/empty/undefined values', () => {
      const result = tansParams({ a: null, b: '', c: undefined, d: 'ok' })
      expect(result).toBe('d=ok&')
    })
  })

  describe('getNormalPath', () => {
    it('should remove trailing slash', () => {
      expect(getNormalPath('/path/')).toBe('/path')
    })

    it('should replace double slashes', () => {
      expect(getNormalPath('/path//to')).toBe('/path/to')
    })

    it('should return empty string as is', () => {
      expect(getNormalPath('')).toBe('')
    })
  })

  describe('blobValidate', () => {
    it('should return true for non-json types', () => {
      expect(blobValidate({ type: 'application/pdf' })).toBe(true)
    })

    it('should return false for json type', () => {
      expect(blobValidate({ type: 'application/json' })).toBe(false)
    })
  })

  describe('numSub', () => {
    it('should subtract integers correctly', () => {
      expect(numSub(10, 3)).toBe(7)
    })

    it('should handle floating point precision', () => {
      expect(numSub(0.3, 0.1)).toBe(0.2)
      expect(numSub(1.1, 0.1)).toBe(1.0)
    })

    it('should handle zero', () => {
      expect(numSub(5, 0)).toBe(5)
      expect(numSub(0, 5)).toBe(-5)
    })
  })
})
