import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, setToken, removeToken } from '../auth'
import Cookies from 'js-cookie'

describe('auth.js', () => {
  beforeEach(() => {
    Cookies.remove('Admin-Token')
  })

  describe('setToken', () => {
    it('should set token in cookies', () => {
      setToken('test-token-123')
      expect(Cookies.get('Admin-Token')).toBe('test-token-123')
    })
  })

  describe('getToken', () => {
    it('should return token from cookies', () => {
      Cookies.set('Admin-Token', 'my-token')
      expect(getToken()).toBe('my-token')
    })

    it('should return undefined when no token set', () => {
      expect(getToken()).toBeUndefined()
    })
  })

  describe('removeToken', () => {
    it('should remove token from cookies', () => {
      Cookies.set('Admin-Token', 'some-token')
      removeToken()
      expect(Cookies.get('Admin-Token')).toBeUndefined()
    })
  })
})
