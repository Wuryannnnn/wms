package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ruoyi.common.core.exception.ServiceException;
import com.ruoyi.wms.domain.entity.Warehouse;
import com.ruoyi.wms.domain.vo.WarehouseVo;
import com.ruoyi.wms.mapper.WarehouseMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("仓库服务单元测试")
@org.junit.jupiter.api.Tag("dev")
class WarehouseServiceTest {

    @Mock
    private WarehouseMapper warehouseMapper;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private WarehouseService warehouseService;

    @Test
    @DisplayName("根据ID查询仓库")
    void testQueryById() {
        WarehouseVo vo = new WarehouseVo();
        vo.setId(1L);
        vo.setWarehouseName("主仓库");

        when(warehouseMapper.selectVoById(1L)).thenReturn(vo);

        WarehouseVo result = warehouseService.queryById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("主仓库", result.getWarehouseName());
        verify(warehouseMapper).selectVoById(1L);
    }

    @Test
    @DisplayName("根据ID查询仓库-不存在")
    void testQueryByIdNotFound() {
        when(warehouseMapper.selectVoById(999L)).thenReturn(null);

        WarehouseVo result = warehouseService.queryById(999L);

        assertNull(result);
    }

    @Test
    @DisplayName("删除仓库-有业务关联时抛出异常")
    void testDeleteByIdWithInventory() {
        when(inventoryService.existsByWarehouseId(1L)).thenReturn(true);

        ServiceException exception = assertThrows(ServiceException.class,
            () -> warehouseService.deleteById(1L));

        assertEquals("删除失败", exception.getMessage());
        verify(warehouseMapper, never()).deleteById(any());
    }

    @Test
    @DisplayName("删除仓库-无关联时正常删除")
    void testDeleteByIdSuccess() {
        when(inventoryService.existsByWarehouseId(1L)).thenReturn(false);
        when(warehouseMapper.deleteById(1L)).thenReturn(1);

        warehouseService.deleteById(1L);

        verify(warehouseMapper).deleteById(1L);
    }

    @Test
    @DisplayName("批量删除仓库")
    void testDeleteByIds() {
        var ids = java.util.List.of(1L, 2L, 3L);
        when(warehouseMapper.deleteBatchIds(ids)).thenReturn(3);

        warehouseService.deleteByIds(ids);

        verify(warehouseMapper).deleteBatchIds(ids);
    }
}
