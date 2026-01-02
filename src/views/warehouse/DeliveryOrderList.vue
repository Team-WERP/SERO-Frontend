<template>
    <div class="do-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">납품서 관리</h1>
                <p class="page-description">
                    확정된 납품서를 조회합니다.
                </p>
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

                <div class="filter-item">
                    <label>작성자</label>
                    <button
                        class="my-do-btn"
                        :class="{ active: showOnlyMyDO }"
                        @click="toggleMyDO">
                        {{ showOnlyMyDO ? '전체 납품서' : '내 납품서 목록' }}
                    </button>
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
            <div
                v-if="isLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm"
            >
                <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                    </path>
                </svg>
            </div>
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
                        <td>
                            <div class="item-name">
                                <span>{{ dorder.itemName }}</span>
                                <span v-if="dorder.itemCount > 1" class="item-count">외 {{ dorder.itemCount - 1 }}건</span>
                            </div>
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
                    <tr v-if="!isLoading && doList.length === 0">
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
import { useUserStore } from '@/stores/user.js'
import { getDODetail } from '@/api/shipping/deliveryOrder'
import DeliveryOrderPreviewModal from '@/components/modals/DeliveryOrderPreviewModal.vue'
import axios from '@/api/axios'

const userStore = useUserStore()

// 날짜 필터
const startDate = ref('')
const endDate = ref('')

// 상태 필터
const selectedStatus = ref('')
const statusFilters = [
    { value: 'DO_BEFORE_GI', label: '출고지시 전' },
    { value: 'DO_AFTER_GI', label: '출고지시 완료' }
]

// 검색
const searchKeyword = ref('')
const showOnlyMyDO = ref(false) // 내가 작성한 납품서만 조회

// 납품서 목록
const doList = ref([])

// 로딩 상태
const isLoading = ref(true)

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

// 필터 초기화
const resetFilters = () => {
    startDate.value = ''
    endDate.value = ''
    selectedStatus.value = ''
    searchKeyword.value = ''
    showOnlyMyDO.value = false
    fetchDOList()
}

// 내가 작성한 납품서 토글
const toggleMyDO = async () => {
    // 이미 활성화된 상태면 비활성화
    if (showOnlyMyDO.value) {
        showOnlyMyDO.value = false
        await fetchDOList()
        return
    }

    // 비활성화 상태에서 활성화 시도
    const previousValue = showOnlyMyDO.value
    showOnlyMyDO.value = true

    // fetchDOList를 호출하여 필터링
    await fetchDOList()

    // 내가 작성한 납품서가 없으면 버튼 상태 되돌리기
    if (!doList.value || doList.value.length === 0) {
        alert('작성한 납품서가 없습니다.')
        showOnlyMyDO.value = previousValue
        // 전체 목록 다시 조회
        await fetchDOList()
    }
}

// 납품서 목록 조회
const fetchDOList = async () => {
    try {
        isLoading.value = true
        const params = {}

        // 날짜 필터는 둘 다 있어야 적용
        if (startDate.value && endDate.value) {
            params.startDate = startDate.value
            params.endDate = endDate.value
        }

        if (selectedStatus.value) params.status = selectedStatus.value
        if (searchKeyword.value) params.doCode = searchKeyword.value

        // 내가 작성한 납품서만 조회
        if (showOnlyMyDO.value) {
            params.drafterId = userStore.user?.id
        }

        const response = await axios.get('/delivery-orders', { params })
        doList.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.error('납품서 목록 조회 실패:', error)
        // 401 에러가 아닌 경우에만 alert 표시
        if (error.response?.status !== 401) {
            alert('납품서 목록을 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
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
        'DO_BEFORE_GI': '출고지시 전',
        'DO_AFTER_GI': '출고지시 완료'
    }
    return statusMap[status] || status
}

// 상태 클래스
const getStatusClass = (status) => {
    const classMap = {
        'DO_BEFORE_GI': 'pending',
        'DO_AFTER_GI': 'completed'
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
    // 날짜 필터 없이 전체 납품서 조회
    fetchDOList()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.do-page {
    padding: 5px;
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
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}

/* ===== 검색 / 필터 ===== */
.filter-title {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
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

.filter-item > div {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-item span {
    color: #6b7280;
}

.filter-item input[type="date"],
.filter-item input[type="text"],
.filter-item select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    background: #ffffff;
    min-width: 140px;
}

.filter-item input[type="date"]:focus,
.filter-item input[type="text"]:focus,
.filter-item select:focus {
    outline: none;
    border-color: #4C4CDD;
}

.filter-item.keyword {
    flex: 1;
    min-width: 200px;
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

.total-count {
    font-size: 14px;
    color: #6b7280;
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
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: left;
}

.items-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
}

.items-table tbody tr:hover {
    background: #f9fafb;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

/* ===== 공통 정렬 ===== */
.text-center {
    text-align: center;
}

/* ===== 링크 ===== */
.link {
    color: #4C4CDD;
    cursor: pointer;
    font-weight: 600;
}

.link:hover {
    text-decoration: underline;
}

/* ===== 품목명 ===== */
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

/* ===== 상태 뱃지 ===== */
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

/* ===== 작성자 필터 버튼 ===== */
.filter-item .my-do-btn {
    height: 36px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    min-width: 140px;
    background: #ffffff;
    color: #374151;
}

.filter-item .my-do-btn:hover {
    border-color: #9ca3af;
    background: #f9fafb;
}

.filter-item .my-do-btn.active {
    background: #4C4CDD;
    color: #ffffff;
    border-color: #4C4CDD;
}

.filter-item .my-do-btn.active:hover {
    background: #3d3dbb;
    border-color: #3d3dbb;
}
</style>
