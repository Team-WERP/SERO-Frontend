<template>
    <div class="stock-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">창고별 재고 관리</h1>
                <p class="page-description">
                    창고별 재고 현황을 조회하고 관리합니다.
                </p>
            </div>
        </div>

        <!-- 필터 및 검색 -->
        <div class="bg-white p-6 rounded-xl border border-gray-200 mb-8">
            <h2 class="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
                필터 및 검색
            </h2>

            <div class="flex flex-wrap items-end gap-4">
                
                <div class="filter-item flex flex-col gap-2">
                    <label class="text-gray-600 text-sm font-semibold uppercase">창고</label>
                    <select v-model="warehouseId" @change="fetchStockList" 
                        class="min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none bg-white cursor-pointer">
                        <option value="">전체</option>
                        <option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.warehouseName }}</option>
                    </select>
                </div>

                <div class="filter-item flex flex-col gap-2">
                    <label class="text-gray-600 text-sm font-semibold uppercase">자재 유형</label>
                    <select v-model="materialType" @change="fetchStockList"
                        class="min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none bg-white cursor-pointer">
                        <option value="">전체</option>
                        <option value="MAT_FG">완제품</option>
                        <option value="MAT_RM">원자재</option>
                    </select>
                </div>

                <div class="filter-item flex flex-col gap-2">
                    <label class="text-gray-600 text-sm font-semibold uppercase">재고 상태</label>
                    <select v-model="stockStatus" @change="fetchStockList"
                        class="min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none bg-white cursor-pointer">
                        <option value="">전체</option>
                        <option value="NORMAL">정상</option>
                        <option value="LOW">부족</option>
                        <option value="OUT_OF_STOCK">품절</option>
                    </select>
                </div>

                <div class="flex items-end gap-2">
                    <div class="flex flex-col gap-2">
                        <label class="text-gray-600 text-sm font-semibold uppercase">검색어</label>
                        <input 
                            type="text"
                            v-model="searchKeyword"
                            placeholder="검색어 입력"
                            @keyup.enter="fetchStockList"
                            class="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all"
                        />
                    </div>
                    
                    <div class="flex-1 gap-3"> <button @click="fetchStockList" class="bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold hover:bg-indigo-800 transition-all text-sm whitespace-nowrap">
                            검색
                        </button>
                        <button @click="resetFilters" class="flex-1 bg-gray-100 ml-2 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 border border-gray-300 transition-all text-sm whitespace-nowrap">
                            초기화
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- 재고 목록 -->
        <div class="items-section">
            <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
            </div>
            <div class="section-header text-sm">
                총 <span class="text-indigo-600 font-bold mx-1">{{ stockList.length}}</span>건
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">No</th>
                        <th style="width: 120px;">자재코드</th>
                        <th style="width: 180px;">자재명</th>
                        <th style="width: 180px;">창고명</th>
                        <th style="width: 160px;">규격</th>
                        <th style="width: 100px;">자재유형</th>
                        <th style="width: 60px;">단위</th>
                        <th style="width: 100px;">안전재고</th>
                        <th style="width: 100px;">현재재고</th>
                        <th style="width: 100px;">가용재고</th>
                        <th style="width: 100px;">재고상태</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(stock, index) in stockList" :key="stock.id" @click="openStockDetail(stock.id)" class="clickable-row text-center">
                        <td >{{ index + 1 }}</td>
                        <td class="link">{{ stock.materialCode }}</td>
                        <td class="material-name" :title="stock.materialName">
                            {{ stock.materialName }}
                        </td>
                        <td>{{ stock.warehouseName }}</td>
                        <td>{{ stock.materialSpec || '-' }}</td>
                        <td>{{ getMaterialTypeLabel(stock.materialType) }}</td>
                        <td>{{ stock.baseUnit }}</td>
                        <td>{{ formatNumber(stock.safetyStock) }}</td>
                        <td>{{ formatNumber(stock.currentStock) }}</td>
                        <td>{{ formatNumber(stock.availableStock) }}</td>
                        <td >
                            <span :class="getStockStatusClass(stock.stockStatus)">
                                {{ getStockStatusLabel(stock.stockStatus) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="!isLoading && stockList.length === 0">
                        <td colspan="11" class="text-center empty-message">
                            조회된 재고가 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 재고 상세 모달 -->
        <StockHistoryModal
            :isOpen="isStockModalOpen"
            :stockDetail="selectedStockDetail"
            @close="closeStockModal"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWarehouses, getWarehouseStocks, getStockDetail } from '@/api/warehouse/warehouse.js'
import StockHistoryModal from '@/components/modals/StockHistoryModal.vue'

// 필터 상태
const warehouseId = ref('')
const materialType = ref('')
const stockStatus = ref('')
const searchKeyword = ref('')
const stockList = ref([])
const warehouseList = ref([])
const isLoading = ref(true)
const isStockModalOpen = ref(false)
const selectedStockDetail = ref(null)

// 창고 목록 조회
const fetchWarehouses = async () => {
    try {
        warehouseList.value = await getWarehouses()
    } catch (error) {
        console.error('창고 목록 조회 실패:', error)
    }
}

// 재고 목록 조회
const fetchStockList = async () => {
    try {
        isLoading.value = true
        const params = {}

        if (warehouseId.value) params.warehouseId = parseInt(warehouseId.value)
        if (materialType.value) params.materialType = materialType.value
        if (stockStatus.value) params.stockStatus = stockStatus.value
        if (searchKeyword.value) params.keyword = searchKeyword.value

        const result = await getWarehouseStocks(params)

        if (Array.isArray(result)) {
            stockList.value = [...result]
        } else {
            console.error('예상치 못한 응답 형식:', result)
            stockList.value = []
        }
    } catch (error) {
        console.error('재고 목록 조회 실패:', error)

        if (error.response?.status !== 401) {
            alert('재고 목록을 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
    }
}

// 필터 초기화
const resetFilters = () => {
    warehouseId.value = ''
    materialType.value = ''
    stockStatus.value = ''
    searchKeyword.value = ''

    // 초기화 후 목록 재조회
    fetchStockList()
}

// 재고 상세 조회 및 모달 열기
const openStockDetail = async (stockId) => {
    try {
        isLoading.value = true
        const detail = await getStockDetail(stockId)
        selectedStockDetail.value = detail
        isStockModalOpen.value = true
    } catch (error) {
        console.error('재고 상세 조회 실패:', error)
        alert('재고 상세 정보를 불러오는데 실패했습니다.')
    } finally {
        isLoading.value = false
    }
}

// 모달 닫기
const closeStockModal = () => {
    isStockModalOpen.value = false
    selectedStockDetail.value = null
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    return value.toLocaleString()
}

// 자재 유형 라벨 매핑
const getMaterialTypeLabel = (type) => ({
    MAT_FG: '완제품',
    MAT_RM: '원자재'
}[type] || type)

// 재고 상태 클래스 매핑
const getStockStatusClass = (status) => ({
    NORMAL: 'status-badge status-normal',
    LOW: 'status-badge status-low',
    OUT_OF_STOCK: 'status-badge status-out'
}[status] || 'status-badge')

// 재고 상태 라벨 매핑
const getStockStatusLabel = (status) => ({
    NORMAL: '정상',
    LOW: '부족',
    OUT_OF_STOCK: '품절'
}[status] || status)

// 초기 로드
onMounted(() => {
    fetchWarehouses()
    fetchStockList()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.stock-page {
    padding: 8px;
    width: 100%;
}

/* ===== 헤더 ===== */
.page-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.page-title {
    font-size: 30px;
    font-weight: bold;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}

/* ===== 검색 / 필터 ===== */
.filter-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
}

.search-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.filter-row {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: #374151;
}

.filter-item label {
    font-weight: 600;
}

.filter-item input[type="text" ],
.filter-item select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    background: #ffffff;
    min-width: 140px;
}

.filter-item input[type="text"]:focus,
.filter-item select:focus {
    outline: none;
    border-color: #4C4CDD;
}

.filter-item.keyword {
    flex: 1;
    min-width: 250px;
}

/* ===== 버튼 그룹 ===== */
.button-group {
    display: flex;
    gap: 8px;
    align-self: flex-end;
    margin-top: 18px;
}

.reset-btn {
    height: 36px;
    width: 36px;
    padding: 0;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.reset-btn svg {
    width: 20px;
    height: 20px;
    color: #374151;
}

.reset-btn:hover {
    background: #e5e7eb;
}

.reset-btn:hover svg {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
}

.search-btn {
    height: 36px;
    padding: 0 24px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.search-btn:hover {
    background: #3d3dbb;
}

/* ===== 리스트 섹션 ===== */
.items-section {
    position: relative;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.section-header {
    margin-bottom: 12px;
}

/* ===== 테이블 ===== */
.items-table {
    width: 100%;
    border-collapse: collapse;
}

.items-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.items-table th {
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-align: center;
}

.items-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 13px;
    color: #111827
}

.items-table tbody tr.clickable-row {
    cursor: pointer;
}

.items-table tbody tr.clickable-row:hover {
    background: #f9fafb;
}

/* ===== 공통 정렬 ===== */
.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

/* ===== 상태 뱃지 ===== */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-normal {
    background: #dcfce7;
    color: #166534;
}

.status-low {
    background: #fef3c7;
    color: #92400e;
}

.status-out {
    background: #fee2e2;
    color: #991b1b;
}

/* ===== 링크 ===== */
.link {
    cursor: pointer;
    font-weight: 600;
}

.link:hover {
    text-decoration: underline;
}

/* ===== 자재명 ===== */
.material-name {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}
</style>
