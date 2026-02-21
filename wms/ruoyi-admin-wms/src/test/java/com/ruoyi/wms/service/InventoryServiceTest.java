package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ruoyi.wms.domain.vo.InventoryVo;
import com.ruoyi.wms.mapper.InventoryMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("库存服务单元测试")
@org.junit.jupiter.api.Tag("dev")
class InventoryServiceTest {

    @Mock
    private InventoryMapper inventoryMapper;

    @Mock
    private ItemSkuService itemSkuService;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    @DisplayName("根据ID查询库存")
    void testQueryById() {
        InventoryVo vo = new InventoryVo();
        vo.setId(1L);

        when(inventoryMapper.selectVoById(1L)).thenReturn(vo);

        InventoryVo result = inventoryService.queryById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("根据ID查询-不存在")
    void testQueryByIdNotFound() {
        when(inventoryMapper.selectVoById(999L)).thenReturn(null);
        assertNull(inventoryService.queryById(999L));
    }

    @Test
    @DisplayName("校验仓库是否有库存-有库存")
    void testExistsByWarehouseIdTrue() {
        when(inventoryMapper.exists(any(LambdaQueryWrapper.class))).thenReturn(true);

        assertTrue(inventoryService.existsByWarehouseId(1L));
    }

    @Test
    @DisplayName("校验仓库是否有库存-无库存")
    void testExistsByWarehouseIdFalse() {
        when(inventoryMapper.exists(any(LambdaQueryWrapper.class))).thenReturn(false);

        assertFalse(inventoryService.existsByWarehouseId(1L));
    }

    @Test
    @DisplayName("校验SKU是否有库存-有库存")
    void testExistsBySkuIdsTrue() {
        when(inventoryMapper.exists(any(LambdaQueryWrapper.class))).thenReturn(true);

        assertTrue(inventoryService.existsBySkuIds(Set.of(1L, 2L)));
    }

    @Test
    @DisplayName("校验SKU是否有库存-无库存")
    void testExistsBySkuIdsFalse() {
        when(inventoryMapper.exists(any(LambdaQueryWrapper.class))).thenReturn(false);

        assertFalse(inventoryService.existsBySkuIds(Set.of(1L, 2L)));
    }

    @Test
    @DisplayName("批量删除库存")
    void testDeleteByIds() {
        var ids = List.of(1L, 2L, 3L);
        when(inventoryMapper.deleteBatchIds(ids)).thenReturn(3);

        inventoryService.deleteByIds(ids);

        verify(inventoryMapper).deleteBatchIds(ids);
    }
}
