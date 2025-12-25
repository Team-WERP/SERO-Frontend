<template>
  <div class="stock-management">
    <h1 class="page-title">재고 관리 (창고별)</h1>
    <p class="page-description">창고별 재고를 조회합니다.</p>

    <!-- 필터 섹션 (상단에 배치) -->
    <div class="filter-section">
      <h3 class="filter-title">필터 및 검색</h3>

      <div class="filter-row">
        <!-- 창고 선택 -->
        <div class="filter-group">
          <label class="filter-label">창고</label>
          <select v-model="filters.warehouseId" class="filter-select">
            <option value="">전체</option>
            <option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :value="warehouse.id"
            >
              {{ warehouse.warehouseName }}
            </option>
          </select>
        </div>

        <!-- 품목명/품목코드 검색 -->
        <div class="filter-group">
          <label class="filter-label">품목명 / 품목코드</label>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="검색하세요."
            class="filter-input"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- 검색 버튼 -->
        <button @click="applyFilters" class="search-button">검색</button>
      </div>
    </div>

    <!-- 테이블 섹션 (필터 아래에 배치) -->
    <div class="table-section">
      <div class="result-count">총 {{ stockList.length }}건</div>

      <div class="table-container">
        <table class="stock-table">
          <thead>
            <tr>
              <th>No</th>
              <th>창고</th>
              <th>품목코드</th>
              <th>품목명</th>
              <th>규격</th>
              <th>운영단위(AUn)</th>
              <th>기본단위(BUn)</th>
              <th>안전재고</th>
              <th>현재고</th>
              <th>출고대기</th>
              <th>안전재고상태</th>
              <th>수량 변경이력</th>
            </tr>
          </thead>
          <tbody v-if="!loading && stockList.length > 0">
            <tr v-for="(item, index) in stockList" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.warehouseName }}</td>
              <td>{{ item.materialCode }}</td>
              <td>{{ item.materialName }}</td>
              <td>{{ item.materialSpec }}</td>
              <td>{{ item.baseUnit }}</td>
              <td>{{ item.baseUnit }}</td>
              <td>{{ item.safetyStock }}</td>
              <td>{{ formatNumber(item.currentStock) }}</td>
              <td>{{ formatNumber(item.availableStock) }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="getStatusClass(item.stockStatus)"
                >
                  {{ getStatusLabel(item.stockStatus) }}
                </span>
              </td>
              <td>
                <button
                  class="history-button"
                  @click="viewHistory(item.id)"
                >
                  📋
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="loading">
            <tr>
              <td colspan="12" class="loading-cell">데이터를 불러오는 중...</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="12" class="empty-cell">조회된 데이터가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 이력 모달 -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>수량 변경 이력</h3>
          <button class="modal-close" @click="closeHistoryModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingHistory" class="loading-text">
            이력을 불러오는 중...
          </div>
          <div v-else-if="selectedStockDetail">
            <div class="detail-info">
              <div class="detail-row">
                <span class="detail-label">창고:</span>
                <span>{{ selectedStockDetail.warehouse.name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">품목:</span>
                <span>{{ selectedStockDetail.material.name }} ({{ selectedStockDetail.material.materialCode }})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">현재 재고:</span>
                <span>{{ formatNumber(selectedStockDetail.currentStock) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">안전 재고:</span>
                <span>{{ formatNumber(selectedStockDetail.safetyStock) }}</span>
              </div>
            </div>

            <h4 class="history-title">변경 이력</h4>
            <div v-if="selectedStockDetail.stockHistory && selectedStockDetail.stockHistory.length > 0" class="history-list">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>변경 유형</th>
                    <th>변경 수량</th>
                    <th>변경 후 재고</th>
                    <th>사유</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="history in selectedStockDetail.stockHistory" :key="history.id">
                    <td>{{ formatDateTime(history.createdAt) }}</td>
                    <td>
                      <span class="history-type" :class="history.changedQuantity > 0 ? 'type-in' : 'type-out'">
                        {{ history.changedQuantity > 0 ? '입고' : '출고' }}
                      </span>
                    </td>
                    <td :class="history.changedQuantity > 0 ? 'text-positive' : 'text-negative'">
                      {{ history.changedQuantity > 0 ? '+' : '' }}{{ formatNumber(history.changedQuantity) }}
                    </td>
                    <td>{{ formatNumber(history.currentStock) }}</td>
                    <td>{{ history.reason || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="no-history">
              변경 이력이 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient, API_ENDPOINTS } from '@/config/api.js'

// 상태 관리
const filters = ref({
  warehouseId: '',
  keyword: ''
})

const warehouseList = ref([])
const stockList = ref([])
const loading = ref(false)
const showHistoryModal = ref(false)
const selectedStockDetail = ref(null)
const loadingHistory = ref(false)

// 창고 목록 조회
const fetchWarehouses = async () => {
  try {
    const data = await apiClient.get(API_ENDPOINTS.warehouse.list)
    warehouseList.value = data || []
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    warehouseList.value = []
  }
}

// 재고 목록 조회
const fetchStockList = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.warehouseId) {
      params.warehouseId = filters.value.warehouseId
    }
    if (filters.value.keyword) {
      params.keyword = filters.value.keyword
    }

    const data = await apiClient.get(API_ENDPOINTS.warehouse.stocks, params)
    stockList.value = data || []
  } catch (error) {
    console.error('Error fetching stock list:', error)
    stockList.value = []
    alert(`재고 목록을 불러오는데 실패했습니다.\n\n에러: ${error.message}\n\n백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:8080)`)
  } finally {
    loading.value = false
  }
}

// 필터 적용
const applyFilters = () => {
  fetchStockList()
}

// 이력 보기
const viewHistory = async (stockId) => {
  showHistoryModal.value = true
  loadingHistory.value = true

  try {
    const data = await apiClient.get(API_ENDPOINTS.warehouse.stockDetail(stockId))
    selectedStockDetail.value = data
  } catch (error) {
    console.error('Error fetching stock detail:', error)
    alert(`이력 정보를 불러오는데 실패했습니다.\n\n에러: ${error.message}`)
    closeHistoryModal()
  } finally {
    loadingHistory.value = false
  }
}

// 모달 닫기
const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedStockDetail.value = null
}

// 상태 클래스 반환
const getStatusClass = (status) => {
  const statusMap = {
    'NORMAL': 'status-normal',
    'LOW': 'status-warning',
    'OUT_OF_STOCK': 'status-danger'
  }
  return statusMap[status] || ''
}

// 상태 라벨 반환
const getStatusLabel = (status) => {
  const labelMap = {
    'NORMAL': '정상',
    'LOW': '주의',
    'OUT_OF_STOCK': '추의'
  }
  return labelMap[status] || status
}

// 숫자 포맷팅
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0'
  return Number(value).toLocaleString()
}

// 날짜 시간 포맷팅
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchWarehouses()
  fetchStockList()
})
</script>

<style scoped>
.stock-management {
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

/* 필터 섹션 - 상단 가로 배치 */
.filter-section {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  color: #111827;
  transition: border-color 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #4C4CDD;
}

.filter-input::placeholder {
  color: #9ca3af;
}

.search-button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background-color: #4C4CDD;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 42px;
  white-space: nowrap;
}

.search-button:hover {
  background-color: #3d3db8;
}

/* 테이블 섹션 */
.table-section {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.result-count {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.stock-table thead {
  background-color: #f9fafb;
}

.stock-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.stock-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.stock-table tbody tr:hover {
  background-color: #f9fafb;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px 16px !important;
  color: #6b7280;
}

/* 상태 배지 */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 12px;
}

.status-normal {
  background-color: #d1fae5;
  color: #065f46;
}

.status-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 이력 버튼 */
.history-button {
  padding: 6px 12px;
  font-size: 16px;
  background-color: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-button:hover {
  background-color: #f3f4f6;
  border-color: #4C4CDD;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  font-size: 28px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.loading-text {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.detail-info {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.history-list {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.history-table thead {
  background-color: #f9fafb;
}

.history-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.history-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.history-type {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

.type-in {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-out {
  background-color: #fee2e2;
  color: #991b1b;
}

.text-positive {
  color: #059669;
  font-weight: 500;
}

.text-negative {
  color: #dc2626;
  font-weight: 500;
}

.no-history {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}
</style>
