<template>
  <div class="app-container home">
    <!-- Row 1: 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="item in statCards" :key="item.label">
        <div class="stat-card" :style="{ background: item.bg }">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- Row 2: 地图 -->
    <el-row :gutter="20" class="map-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header><span>门店位置</span></template>
          <div id="bmap-container" style="height: 400px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Row 3: 库存分布 + 进出货分类对比 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>库存分布</span></template>
          <StationPie :pieData="pieData" height="350px" unit="件" />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header><span>各分类进出货金额对比（元）</span></template>
          <div ref="categoryChartRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Row 4: 近14天每日进出货金额对比 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header><span>近14天每日进出货金额对比（元）</span></template>
          <div ref="dailyChartRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import moment from 'moment'
import StationPie from './dashboard/components/StationPie.vue'
import { listItemPage } from '@/api/wms/item'
import { listItemSkuPage } from '@/api/wms/itemSku'
import { listWarehouse } from '@/api/wms/warehouse'
import { listReceiptOrder } from '@/api/wms/receiptOrder'
import { listShipmentOrder } from '@/api/wms/shipmentOrder'
import { listInventoryBoard } from '@/api/wms/inventory'
import { listReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'
import { listShipmentOrderDetail } from '@/api/wms/shipmentOrderDetail'
import { useWmsStore } from '@/store/modules/wms'

const wmsStore = useWmsStore()

const statCards = ref([
  { label: '物料总数', value: 0, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '仓库数量', value: 0, bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { label: '入库单', value: 0, bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { label: '出库单', value: 0, bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
])

const pieData = ref([])

// 图表 DOM 引用
const categoryChartRef = ref(null)
const dailyChartRef = ref(null)
let categoryChart = null
let dailyChart = null

onMounted(() => {
  fetchStats()
  fetchPieData()
  fetchCategoryChart()
  fetchDailyChart()
  initMap()
})

onBeforeUnmount(() => {
  categoryChart?.dispose()
  dailyChart?.dispose()
})

async function fetchStats() {
  const fetchers = [
    () => listItemPage({ pageNum: 1, pageSize: 1 }),
    () => listWarehouse({ pageNum: 1, pageSize: 1 }),
    () => listReceiptOrder({ pageNum: 1, pageSize: 1 }),
    () => listShipmentOrder({ pageNum: 1, pageSize: 1 }),
  ]
  for (let i = 0; i < fetchers.length; i++) {
    try {
      const res = await fetchers[i]()
      statCards.value[i].value = res.total || 0
    } catch {
      statCards.value[i].value = 0
    }
  }
}

async function fetchPieData() {
  try {
    const res = await listInventoryBoard({ pageNum: 1, pageSize: 500 }, 'warehouse')
    if (res.rows && res.rows.length) {
      const warehouseAgg = {}
      res.rows.forEach(row => {
        const name = wmsStore.warehouseMap.get(row.warehouseId)?.warehouseName || '未知仓库'
        if (!warehouseAgg[name]) warehouseAgg[name] = 0
        warehouseAgg[name] += Number(row.quantity) || 0
      })
      pieData.value = Object.entries(warehouseAgg).map(([name, value]) => ({ name, value }))
    }
  } catch {
    pieData.value = []
  }
}

/** 建立 skuId → categoryName 映射 */
async function buildSkuCategoryMap() {
  const skuRes = await listItemSkuPage({ pageNum: 1, pageSize: 500 })
  const lookup = {}
  ;(skuRes.rows || []).forEach(row => {
    const skuId = row.skuId || row.id
    const categoryId = row.item?.itemCategory
    if (skuId && categoryId) {
      const name = wmsStore.itemCategoryMap.get(categoryId)?.categoryName
      if (name) lookup[skuId] = name
    }
  })
  return lookup
}

/** 各分类进出货金额对比柱状图 */
async function fetchCategoryChart() {
  try {
    const skuCategoryMap = await buildSkuCategoryMap()

    // 并行获取进货和出货明细
    const [receiptRes, shipmentRes] = await Promise.all([
      listReceiptOrderDetail({ pageNum: 1, pageSize: 2000 }),
      listShipmentOrderDetail({ pageNum: 1, pageSize: 2000 }),
    ])
    const receiptDetails = receiptRes.rows || receiptRes.data || []
    const shipmentDetails = shipmentRes.rows || shipmentRes.data || []

    // 汇总进货
    const receiptAgg = {}
    receiptDetails.forEach(row => {
      const skuId = row.skuId || row.itemSku?.id
      const name = skuId ? skuCategoryMap[skuId] : null
      if (!name) return
      if (!receiptAgg[name]) receiptAgg[name] = 0
      receiptAgg[name] += Number(row.amount) || 0
    })

    // 汇总出货
    const shipmentAgg = {}
    shipmentDetails.forEach(row => {
      const skuId = row.skuId || row.itemSku?.id
      const name = skuId ? skuCategoryMap[skuId] : null
      if (!name) return
      if (!shipmentAgg[name]) shipmentAgg[name] = 0
      shipmentAgg[name] += Number(row.amount) || 0
    })

    // 合并所有分类
    const categories = [...new Set([...Object.keys(receiptAgg), ...Object.keys(shipmentAgg)])]
    categories.sort((a, b) => (receiptAgg[b] || 0) - (receiptAgg[a] || 0))

    renderCategoryChart(
      categories,
      categories.map(c => Math.round((receiptAgg[c] || 0) * 100) / 100),
      categories.map(c => Math.round((shipmentAgg[c] || 0) * 100) / 100)
    )
  } catch {
    renderCategoryChart([], [], [])
  }
}

function renderCategoryChart(xData, receiptData, shipmentData) {
  if (!categoryChartRef.value) return
  categoryChart = echarts.init(categoryChartRef.value, 'lightTheme')
  categoryChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: { data: ['进货金额', '出货金额'], bottom: 0 },
    grid: { top: '10%', left: '2%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value', name: '元' },
    series: [
      {
        name: '进货金额',
        type: 'bar',
        data: receiptData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#93c5fd' },
          ]),
        },
      },
      {
        name: '出货金额',
        type: 'bar',
        data: shipmentData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: '#fcd34d' },
          ]),
        },
      },
    ],
  })
}

/** 近14天每日进出货金额对比 */
async function fetchDailyChart() {
  try {
    const [receiptRes, shipmentRes] = await Promise.all([
      listReceiptOrder({ pageNum: 1, pageSize: 1000 }),
      listShipmentOrder({ pageNum: 1, pageSize: 1000 }),
    ])
    const receiptRows = receiptRes.rows || []
    const shipmentRows = shipmentRes.rows || []

    const days = []
    for (let i = 13; i >= 0; i--) {
      days.push(moment().subtract(i, 'days').format('MM-DD'))
    }

    const receiptMap = {}
    const shipmentMap = {}
    days.forEach(d => { receiptMap[d] = 0; shipmentMap[d] = 0 })

    receiptRows.forEach(row => {
      if (row.createTime && row.totalAmount) {
        const day = moment(row.createTime).format('MM-DD')
        if (receiptMap[day] !== undefined) {
          receiptMap[day] += Number(row.totalAmount) || 0
        }
      }
    })

    shipmentRows.forEach(row => {
      if (row.createTime && row.totalAmount) {
        const day = moment(row.createTime).format('MM-DD')
        if (shipmentMap[day] !== undefined) {
          shipmentMap[day] += Number(row.totalAmount) || 0
        }
      }
    })

    renderDailyChart(
      days,
      days.map(d => Math.round(receiptMap[d] * 100) / 100),
      days.map(d => Math.round(shipmentMap[d] * 100) / 100)
    )
  } catch {
    renderDailyChart([], [], [])
  }
}

function renderDailyChart(xData, receiptData, shipmentData) {
  if (!dailyChartRef.value) return
  dailyChart = echarts.init(dailyChartRef.value, 'lightTheme')
  dailyChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: { data: ['进货金额', '出货金额'], bottom: 0 },
    grid: { top: '10%', left: '2%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: xData, boundaryGap: false },
    yAxis: { type: 'value', name: '元' },
    series: [
      {
        name: '进货金额',
        type: 'line',
        smooth: true,
        data: receiptData,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 3 },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: 'rgba(59,130,246,0.05)' },
          ]),
        },
      },
      {
        name: '出货金额',
        type: 'line',
        smooth: true,
        data: shipmentData,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3 },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: 'rgba(245,158,11,0.05)' },
          ]),
        },
      },
    ],
  })
}

function initMap() {
  if (typeof BMapGL === 'undefined') return
  const map = new BMapGL.Map('bmap-container')
  const point = new BMapGL.Point(114.475, 22.785)
  map.centerAndZoom(point, 16)
  map.enableScrollWheelZoom(true)

  const marker = new BMapGL.Marker(point)
  map.addOverlay(marker)

  const infoWindow = new BMapGL.InfoWindow(
    '<div style="font-size:14px;line-height:1.8;">' +
      '<strong>无限咖啡馆 The Infinite Cafe</strong><br/>' +
      '地址：广东省惠州市惠阳区淡水街道棕榈岛度假屋M2栋<br/>' +
      '电话：18026679860' +
    '</div>',
    { width: 320, height: 120, title: '' }
  )
  map.openInfoWindow(infoWindow, point)
  marker.addEventListener('click', () => {
    map.openInfoWindow(infoWindow, point)
  })
}
</script>

<style scoped lang="scss">
.home {
  padding: 20px;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  padding: 24px 20px;
  color: #fff;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  margin-top: 8px;
  opacity: 0.9;
}

.map-row {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}
</style>
