# WMS warehouse_id 兜底修复

## Bug
`POST /wms/receiptOrder/warehousing` 和 `PUT /wms/shipmentOrder/shipment`
的请求 body 顶层带了 `warehouseId`，但 detail 列表里没带 → WMS 内部
`InventoryService.add/subtract` 按 `detail.warehouseId` 查 inventory 行：
- receipt: 新行被写成 `(sku_id, warehouse_id=NULL)`
- shipment: 按 `(sku_id, NULL)` 查不到库存 → 报"库存不足"

## Fix
在 `ReceiptOrderService.receive` 和 `ShipmentOrderService.shipment` 里，
保存单据后、调用 inventory 前，用顶层 `bo.warehouseId` 给 detail 兜底。

## 文件
- `wms/admin-wms/src/main/java/com/ruoyi/wms/service/ReceiptOrderService.java`
- `wms/admin-wms/src/main/java/com/ruoyi/wms/service/ShipmentOrderService.java`

## 改动 (插在 `if (Objects.isNull(bo.getId())) { ... }` 之后, `inventoryService.{add|subtract}` 之前)

```java
// 兜底: detail 没显式带 warehouseId 时, 用顶层 bo.warehouseId 填充,
// 否则 inventoryService.{add|subtract} 会按 (sku_id, NULL) 处理 inventory 行,
// 后续库存查询/扣减找不到 → 误报"库存不足".
if (bo.getWarehouseId() != null && CollUtil.isNotEmpty(bo.getDetails())) {
    bo.getDetails().forEach(d -> {
        if (d.getWarehouseId() == null) {
            d.setWarehouseId(bo.getWarehouseId());
        }
    });
}
```

## 验证
```bash
# 1. 重建 jar + 重启容器
cd /Users/wurui/Desktop/wms
mvn -pl wms/admin-wms -am clean package -DskipTests
docker compose up -d --build backend

# 2. 直接 PUT receipt, detail 故意不带 warehouseId
TOKEN=$(curl -s -X POST http://localhost:8081/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
curl -s -X POST http://localhost:8081/wms/receiptOrder/warehousing \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
    "orderNo":"VERIFY-001",
    "warehouseId":<your_wh_id>,
    "optType":1,
    "details":[{"itemId":"<itemId>","skuId":"<skuId>","quantity":"100"}]
  }'

# 3. 验 wms_inventory.warehouse_id 不再是 NULL
docker exec wms-mysql mysql -uroot -pwms123456 ry-vue \
  -e "SELECT sku_id, warehouse_id, quantity FROM wms_inventory;"
```

## 建议 commit message
```
fix(wms): receipt/shipment 用顶层 warehouseId 给 detail 兜底

调用方在 body 顶层指定了 warehouseId 但 detail 没带时, InventoryService
会把库存行写成 (sku_id, warehouse_id=NULL), 后续按 (sku_id, warehouse_id)
查找的扣减/查询找不到这行, 误报库存不足.
```
