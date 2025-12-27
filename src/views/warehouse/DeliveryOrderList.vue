<template>
    <div class="do-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">납품서 관리</h1>
                <p class="page-description">
                    확정된 납품서를 조회합니다.
                </p>
            </div>
            <div class="header-actions">
                <div class="period-selector">
                    <label>기준월(납품일)</label>
                    <input type="month" v-model="selectedMonth" @change="onMonthChange" />
                </div>
            </div>
        </div>

        <!-- 필터 및 검색 -->
        <div class="search-section">
            <h2 class="filter-title">필터 및 검색</h2>
            <div class="filter-row">
                <div class="filter-item">
                    <label>납품일</label>
                    <div>
                        <input type="date" v-model="startDate" />
                        <span>~</span>
                        <input type="date" v-model="endDate" />
                    </div>
                </div>

                <div class="filter-item">
                    <label>상태</label>
                    <select v-model="selectedStatus" @change="fetchDOList">
                        <option value="">전체</option>
                        <option v-for="s in statusFilters" :key="s.value" :value="s.value">
                            {{ s.label }}
                        </option>
                    </select>
                </div>

                <div class="filter-item keyword">
                    <label>납품서번호</label>
                    <input type="text" v-model="searchKeyword" placeholder="검색하세요" @keyup.enter="fetchDOList" />
                </div>

                <div class="button-group">
                    <button class="reset-btn" @click="resetFilters" title="필터 초기화">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
                        </svg>
                    </button>
                    <button class="search-btn" @click="fetchDOList">검색</button>
                </div>
            </div>
        </div>

        <!-- 납품서 목록 -->
        <div class="items-section">
            <div class="section-header">
                <span class="total-count">총 {{ doList.length }}건</span>
            </div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align:center;">No</th>
                        <th style="width: 140px;">납품서 번호</th>
                        <th style="width: 140px;">수주 번호</th>
                        <th style="width: 200px;">고객사</th>
                        <th style="width: 250px;">품목명</th>
                        <th style="width: 120px;">담당자</th>
                        <th style="width: 130px;">생성일시</th>
                        <th style="width: 130px;">납품일시</th>
                        <th style="width: 100px; text-align:center;">상태</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(dorder, index) in doList" :key="dorder.doId" class="clickable-row" @click="viewDetail(dorder.doCode)">
                        <td class="text-center">{{ index + 1 }}</td>

                        <td class="link">
                            {{ dorder.doCode }}
                        </td>

                        <td>{{ dorder.soCode }}</td>
                        <td>{{ dorder.companyName }}</td>
                        <td class="item-name">
                            {{ dorder.itemName }}
                            <span v-if="dorder.itemCount > 1" class="item-count">외 {{ dorder.itemCount - 1 }}건</span>
                        </td>
                        <td>{{ dorder.managerName || '-' }}</td>
                        <td>{{ formatDateTime(dorder.createdAt) }}</td>
                        <td>{{ formatDateTime(dorder.shippedAt) }}</td>
                        <td class="text-center">
                            <span :class="['status-badge', getStatusClass(dorder.status)]">
                                {{ getStatusLabel(dorder.status) }}
                            </span>
                        </td>
                    </tr>

                    <!-- 데이터 없을 때 -->
                    <tr v-if="doList.length === 0">
                        <td colspan="9" class="no-data">조회된 납품서가 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 납품서 미리보기 모달 -->
        <DeliveryOrderPreviewModal
            :is-open="isPreviewModalOpen"
            :delivery-order="selectedDO"
            @close="closePreviewModal"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDODetail } from '@/api/shipping/deliveryOrder'
import DeliveryOrderPreviewModal from '@/components/modals/DeliveryOrderPreviewModal.vue'
import axios from '@/api/axios'

// 날짜 필터
const selectedMonth = ref('')
const startDate = ref('')
const endDate = ref('')

// 상태 필터
const selectedStatus = ref('')
const statusFilters = [
    { value: 'DO_BEFORE_GI', label: '출고 전' },
    { value: 'DO_SHIPPED', label: '출고 완료' },
    { value: 'DO_DELIVERED', label: '배송 완료' }
]

// 검색
const searchKeyword = ref('')

// 납품서 목록
const doList = ref([])

// 미리보기 모달
const isPreviewModalOpen = ref(false)
const selectedDO = ref({
    doCode: '',
    createdAt: '',
    recipient: '',
    companyName: '',
    ceoName: '',
    businessNo: '',
    companyContact: '',
    address: '',
    businessType: '',
    businessItem: '',
    totalAmount: 0,
    shippedAt: '',
    deliveryLocation: '',
    note: '',
    items: []
})

// 기준월 변경
const onMonthChange = () => {
    if (selectedMonth.value) {
        const [year, month] = selectedMonth.value.split('-')
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)

        startDate.value = firstDay.toISOString().split('T')[0]
        endDate.value = lastDay.toISOString().split('T')[0]

        fetchDOList()
    }
}

// 필터 초기화
const resetFilters = () => {
    selectedMonth.value = ''
    startDate.value = ''
    endDate.value = ''
    selectedStatus.value = ''
    searchKeyword.value = ''
    fetchDOList()
}

// 납품서 목록 조회
const fetchDOList = async () => {
    try {
        const params = {}

        if (startDate.value) params.startDate = startDate.value
        if (endDate.value) params.endDate = endDate.value
        if (selectedStatus.value) params.status = selectedStatus.value
        if (searchKeyword.value) params.doCode = searchKeyword.value

        const response = await axios.get('/delivery-orders', { params })
        doList.value = response.data || []
    } catch (error) {
        console.error('납품서 목록 조회 실패:', error)
        alert('납품서 목록을 불러오는데 실패했습니다.')
    }
}

// 납품서 상세보기 (미리보기 모달)
const viewDetail = async (doCode) => {
    try {
        const response = await getDODetail(doCode)
        selectedDO.value = response
        isPreviewModalOpen.value = true
    } catch (error) {
        console.error('납품서 상세 조회 실패:', error)
        alert('납품서 정보를 불러오는데 실패했습니다.')
    }
}

// 미리보기 모달 닫기
const closePreviewModal = () => {
    isPreviewModalOpen.value = false
}

// 상태 라벨
const getStatusLabel = (status) => {
    const statusMap = {
        'DO_BEFORE_GI': '출고 전',
        'DO_SHIPPED': '출고 완료',
        'DO_DELIVERED': '배송 완료'
    }
    return statusMap[status] || status
}

// 상태 클래스
const getStatusClass = (status) => {
    const classMap = {
        'DO_BEFORE_GI': 'pending',
        'DO_SHIPPED': 'in-progress',
        'DO_DELIVERED': '완료'
    }
    return classMap[status] || 'pending'
}

// 날짜 시간 포맷팅
const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    if (typeof dateTime === 'string') {
        if (dateTime.includes('T')) {
            return dateTime.replace('T', ' ').substring(0, 16)
        }
        return dateTime
    }
    return '-'
}

// 초기화
onMounted(() => {
    // 현재 월로 초기화
    const now = new Date()
    selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    onMonthChange()
})
</script>

<style scoped>
/* ===== 페이지 컨테이너 ===== */
.do-page {
    padding: 30px;
    background: #f9fafb;
    min-height: calc(100vh - 60px);
}

/* ===== 페이지 헤더 ===== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
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
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.period-selector {
    display: flex;
    align-items: center;
    gap: 8px;
}

.period-selector label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.period-selector input[type="month"] {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
}

/* ===== 검색 섹션 ===== */
.search-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 16px;
}

.filter-row {
    display: flex;
    gap: 16px;
    align-items: flex-end;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-item.keyword {
    flex: 1;
}

.filter-item label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.filter-item input[type="date"],
.filter-item input[type="text"],
.filter-item select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
}

.filter-item input[type="text"] {
    width: 100%;
}

.filter-item div {
    display: flex;
    align-items: center;
    gap: 8px;
}

.button-group {
    display: flex;
    gap: 8px;
}

.reset-btn {
    padding: 8px;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
}

.reset-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.search-btn {
    padding: 8px 20px;
    background: #4C4CDD;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.search-btn:hover {
    background: #3d3dbb;
}

/* ===== 아이템 섹션 ===== */
.items-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.total-count {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

/* ===== 테이블 ===== */
.items-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e5e7eb;
}

.items-table thead {
    background: #f9fafb;
}

.items-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
}

.items-table td {
    padding: 14px 16px;
    font-size: 14px;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.clickable-row:hover {
    background-color: #f9fafb;
}

.text-center {
    text-align: center;
}

.link {
    color: #4C4CDD;
    font-weight: 600;
    cursor: pointer;
}

.link:hover {
    text-decoration: underline;
}

.item-name {
    display: flex;
    align-items: center;
    gap: 8px;
}

.item-count {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 12px;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.in-progress {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.completed {
    background: #d1fae5;
    color: #065f46;
}

.no-data {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
    font-size: 14px;
}
</style>
