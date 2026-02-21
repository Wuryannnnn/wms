import { describe, it, expect } from 'vitest'
import { getWarehouseAndSkuKey, getSourceWarehouseAndSkuKey } from '../wmsUtil'

describe('wmsUtil.js', () => {
  describe('getWarehouseAndSkuKey', () => {
    it('should combine warehouseId and skuId', () => {
      expect(getWarehouseAndSkuKey({ warehouseId: 1, skuId: 100 })).toBe('1_100')
    })

    it('should handle string ids', () => {
      expect(getWarehouseAndSkuKey({ warehouseId: '1', skuId: '100' })).toBe('1_100')
    })
  })

  describe('getSourceWarehouseAndSkuKey', () => {
    it('should combine sourceWarehouseId and skuId', () => {
      expect(getSourceWarehouseAndSkuKey({ sourceWarehouseId: 2, skuId: 200 })).toBe('2_200')
    })

    it('should handle string ids', () => {
      expect(getSourceWarehouseAndSkuKey({ sourceWarehouseId: '2', skuId: '200' })).toBe('2_200')
    })
  })
})
