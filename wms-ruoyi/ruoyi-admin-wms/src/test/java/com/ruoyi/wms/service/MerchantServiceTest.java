package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ruoyi.common.core.exception.ServiceException;
import com.ruoyi.wms.domain.vo.MerchantVo;
import com.ruoyi.wms.mapper.MerchantMapper;
import com.ruoyi.wms.mapper.ReceiptOrderMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("往来单位服务单元测试")
@org.junit.jupiter.api.Tag("dev")
class MerchantServiceTest {

    @Mock
    private MerchantMapper merchantMapper;

    @Mock
    private ReceiptOrderMapper receiptOrderMapper;

    @InjectMocks
    private MerchantService merchantService;

    @Test
    @DisplayName("根据ID查询往来单位")
    void testQueryById() {
        MerchantVo vo = new MerchantVo();
        vo.setId(1L);
        vo.setMerchantName("供应商A");

        when(merchantMapper.selectVoById(1L)).thenReturn(vo);

        MerchantVo result = merchantService.queryById(1L);

        assertNotNull(result);
        assertEquals("供应商A", result.getMerchantName());
    }

    @Test
    @DisplayName("根据ID查询-不存在")
    void testQueryByIdNotFound() {
        when(merchantMapper.selectVoById(999L)).thenReturn(null);
        assertNull(merchantService.queryById(999L));
    }

    @Test
    @DisplayName("删除往来单位-有业务关联时抛异常")
    void testDeleteByIdWithOrders() {
        when(receiptOrderMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(5L);

        ServiceException exception = assertThrows(ServiceException.class,
            () -> merchantService.deleteById(1L));

        assertEquals("删除失败", exception.getMessage());
        verify(merchantMapper, never()).deleteById(any());
    }

    @Test
    @DisplayName("删除往来单位-无关联时正常删除")
    void testDeleteByIdSuccess() {
        when(receiptOrderMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(merchantMapper.deleteById(1L)).thenReturn(1);

        merchantService.deleteById(1L);

        verify(merchantMapper).deleteById(1L);
    }

    @Test
    @DisplayName("批量删除往来单位")
    void testDeleteByIds() {
        var ids = java.util.List.of(1L, 2L);
        when(merchantMapper.deleteBatchIds(ids)).thenReturn(2);

        merchantService.deleteByIds(ids);

        verify(merchantMapper).deleteBatchIds(ids);
    }
}
