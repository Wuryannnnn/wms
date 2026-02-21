import { describe, it, expect } from 'vitest'
import errorCode from '../errorCode'

describe('errorCode.js', () => {
  it('should have 401 message', () => {
    expect(errorCode['401']).toBe('认证失败，无法访问系统资源')
  })

  it('should have 403 message', () => {
    expect(errorCode['403']).toBe('当前操作没有权限')
  })

  it('should have 404 message', () => {
    expect(errorCode['404']).toBe('访问资源不存在')
  })

  it('should have default message', () => {
    expect(errorCode['default']).toBe('系统未知错误，请反馈给管理员')
  })
})
