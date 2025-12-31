<template>
    <div class="gi-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">출고지시 관리</h1>
                <p class="page-description">
                    확정된 출고지시서를 조회합니다.
                </p>
            </div>
            <div class="header-actions">
                <div class="period-selector">
                    <label>기준월(납기일)</label>
                    <input type="month" v-model="selectedMonth" @change="onMonthChange" />
                </div>
                <button v-if="canCreate" class="create-btn" @click="openCreateModal">
                    + 출고지시 등록
                </button>
            </div>
        </div>

        <!-- 필터 및 검색 -->
        <div class="search-section">
            <h2 class="filter-title">필터 및 검색</h2>
            <div class="filter-row">
                <div class="filter-item">
                    <label>납기일</label>
                    <div>
                        <input type="date" v-model="startDate" />
                        <span>~</span>
                        <input type="date" v-model="endDate" />
                    </div>
                </div>

                <div class="filter-item">
                    <label>창고</label>
                    <select v-model="warehouseId" @change="fetchGIList">
                        <option value="">전체</option>
                        <option v-for="w in warehouseList" :key="w.id" :value="w.id">
                            {{ w.warehouseName }}
                        </option>
                    </select>
                </div>

                <div class="filter-item">
                    <label>상태</label>
                    <select v-model="selectedStatus" @change="fetchGIList">
                        <option value="">전체</option>
                        <option v-for="s in statusFilters" :key="s.value" :value="s.value">
                            {{ s.label }}
                        </option>
                    </select>
                </div>

                <div class="filter-item keyword">
                    <label>출고설정번호</label>
                    <input type="text" v-model="searchKeyword" placeholder="검색하세요" @keyup.enter="fetchGIList" />
                </div>

                <div class="button-group">
                    <button class="reset-btn" @click="resetFilters" title="필터 초기화">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
                        </svg>
                    </button>
                    <button class="search-btn" @click="fetchGIList">검색</button>
                </div>
            </div>
        </div>

        <!-- 출고지시 목록 -->
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
                <span class="total-count">총 {{ giList.length }}건</span>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align:center;">No</th>
                        <th style="width: 140px;">출고지시 번호</th>
                        <th style="width: 140px;">주문 번호</th>
                        <th style="width: 140px;">납품서 번호</th>
                        <th style="width: 200px;">품목명</th>
                        <th style="width: 100px;">창고</th>
                        <th style="width: 130px;">출고지시일시</th>
                        <th style="width: 130px;">납기일시</th>
                        <th style="width: 100px;">요청자</th>
                        <th style="width: 100px;">담당자</th>
                        <th style="width: 100px; text-align:center;">상태</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(gi, index) in giList" :key="gi.id">
                        <td class="text-center">{{ index + 1 }}</td>

                        <td class="link" @click="goDetail(gi.id)">
                            {{ gi.giCode }}
                        </td>

                        <td>{{ gi.soCode }}</td>
                        <td>{{ gi.doCode }}</td>

                        <td class="item-name" :title="gi.itemName">
                            {{ gi.itemName }}
                            <span v-if="gi.itemCount > 1">
                                외 {{ gi.itemCount - 1 }}건
                            </span>
                        </td>

                        <td>{{ gi.warehouseName }}</td>

                        <td>{{ formatDateTime(gi.createdAt) }}</td>
                        <td>{{ formatDateTime(gi.shippedAt) }}</td>

                        <td>{{ gi.requesterName || '-' }}</td>
                        <td>{{ gi.managerName || '-' }}</td>

                        <td class="text-center">
                            <span :class="getStatusClass(gi.status)">
                                {{ getStatusLabel(gi.status) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="!isLoading && giList.length === 0">
                        <td colspan="11" class="text-center empty-message">
                            조회된 출고지시가 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 납품서 선택 모달 -->
        <DeliveryOrderSelectModal
            :isOpen="isModalOpen"
            @close="closeModal"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { getGIList } from '@/api/shipping/goodsIssue.js'
import { getWarehouses } from '@/api/warehouse/warehouse.js'
import DeliveryOrderSelectModal from '@/components/shipping/DeliveryOrderSelectModal.vue'

const router = useRouter()
const userStore = useUserStore()

// 권한 체크
const canCreate = computed(() => {
    return userStore.hasAuthority('AC_SAL')
})

const canManage = computed(() => {
    return userStore.hasAuthority('AC_WHS')
})

// 현재 월 설정 (YYYY-MM 형식)
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// 필터 상태
const startDate = ref('')
const endDate = ref('')
const warehouseId = ref('')
const searchKeyword = ref('')
const selectedStatus = ref('')
const giList = ref([])
const warehouseList = ref([])
const isModalOpen = ref(false)
const isLoading = ref(true)

// 상태 필터 목록
const statusFilters = [
    { label: '지시검토', value: 'GI_RVW' },
    { label: '결재중', value: 'GI_APPR_PEND' },
    { label: '결재승인', value: 'GI_APPR_DONE' },
    { label: '결재반려', value: 'GI_APPR_RJCT' },
    { label: '출고완료', value: 'GI_ISSUED' },
    { label: '배송중', value: 'GI_SHIP_ING' },
    { label: '배송완료', value: 'GI_SHIP_DONE' },
    { label: '취소', value: 'GI_CANCEL' }
]

// 창고 목록 조회
const fetchWarehouses = async () => {
    try {
        warehouseList.value = await getWarehouses()
    } catch (error) {
        console.error('창고 목록 조회 실패:', error)
    }
}

// 출고지시 목록 조회
const fetchGIList = async () => {
    console.log('🔍 fetchGIList 함수 실행됨!')
    try {
        isLoading.value = true
        const params = {}

        if (searchKeyword.value) params.searchKeyword = searchKeyword.value
        if (selectedStatus.value) params.status = selectedStatus.value
        if (warehouseId.value) params.warehouseId = parseInt(warehouseId.value)

        // 날짜 필터는 둘 다 있어야 적용
        if (startDate.value && endDate.value) {
            params.startDate = startDate.value
            params.endDate = endDate.value
        }

        console.log('API 호출 파라미터:', params)
        const result = await getGIList(params)
        console.log('API 응답:', result)
        console.log('API 응답 타입:', typeof result, Array.isArray(result))
        console.log('API 응답 길이:', result?.length)

        // 배열인지 확인하고 할당
        if (Array.isArray(result)) {
            giList.value = [...result]
        } else {
            console.error('예상치 못한 응답 형식:', result)
            giList.value = []
        }
    } catch (error) {
        console.error('출고지시 목록 조회 실패:', error)
        console.error('에러 상세:', {
            message: error.message,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data
        })

        // 401 에러가 아닌 경우에만 alert 표시
        if (error.response?.status !== 401) {
            alert('출고지시 목록을 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
    }
}

// 기준월 변경 시
const onMonthChange = () => {
    if (!selectedMonth.value) return

    const [year, month] = selectedMonth.value.split('-')

    // 해당 월의 시작일과 마지막일 계산
    startDate.value = `${year}-${month}-01`

    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    endDate.value = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

    // 자동 검색
    fetchGIList()
}

// 필터 초기화
const resetFilters = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    selectedMonth.value = `${year}-${month}`
    startDate.value = `${year}-${month}-01`

    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    endDate.value = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

    warehouseId.value = ''
    selectedStatus.value = ''
    searchKeyword.value = ''

    // 초기화 후 목록 재조회
    fetchGIList()
}

// 출고지시 등록 모달
const openCreateModal = () => {
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

// 상세 페이지 이동
const goDetail = (id) => {
    router.push(`/warehouse/goods-issues/${id}`)
}

// 날짜 포맷팅 (YYYY-MM-DD HH:MM)
const formatDateTime = (value) => {
    if (!value) return '-'
    const dateStr = value.replace('T', ' ').substring(0, 16)
    return dateStr
}

// 상태 클래스 매핑
const getStatusClass = (status) => ({
    GI_RVW: 'status-badge status-review',
    GI_APPR_PEND: 'status-badge status-pending',
    GI_APPR_DONE: 'status-badge status-approved',
    GI_APPR_RJCT: 'status-badge status-reject',
    GI_ISSUED: 'status-badge status-issued',
    GI_SHIP_ING: 'status-badge status-progress',
    GI_SHIP_DONE: 'status-badge status-complete',
    GI_CANCEL: 'status-badge status-cancel'
}[status] || 'status-badge')

// 상태 라벨 매핑
const getStatusLabel = (status) => ({
    GI_RVW: '지시검토',
    GI_APPR_PEND: '결재중',
    GI_APPR_DONE: '결재승인',
    GI_APPR_RJCT: '결재반려',
    GI_ISSUED: '출고완료',
    GI_SHIP_ING: '배송중',
    GI_SHIP_DONE: '배송완료'
}[status] || status)

// 초기 로드
onMounted(() => {
    // 현재 월의 시작일과 종료일 설정
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    startDate.value = `${year}-${month}-01`

    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    endDate.value = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

    // 창고 목록과 출고지시 목록 동시 조회
    fetchWarehouses()
    fetchGIList()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.gi-page {
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

.header-actions {
    display: flex;
    gap: 12px;
    align-items: flex-end;
}

.period-selector {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.period-selector label {
    font-size: 13px;
    color: #374151;
    font-weight: 600;
}

.period-selector input[type="month"] {
    height: 38px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: #ffffff;
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

/* ===== 공통 정렬 ===== */
.text-center {
    text-align: center;
}

/* ===== 상태 뱃지 ===== */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-review {
    background: #fff7ed;
    color: #c2410c;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-approved {
    background: #e0f2fe;
    color: #0369a1;
}

.status-reject {
    background: #fee2e2;
    color: #991b1b;
}

.status-issued {
    background: #dcfce7;
    color: #166534;
}

.status-progress {
    background: #ede9fe;
    color: #5b21b6;
}

.status-complete {
    background: #e0e7ff;
    color: #3730a3;
}

.status-cancel {
    background: #f3f4f6;
    color: #374151;
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
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-name span {
    color: #6b7280;
    font-size: 12px;
    margin-left: 4px;
}

.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}

/* ===== 버튼 ===== */
.create-btn {
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}

.create-btn:hover {
    background: #3d3dbb;
}
</style>
