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
                    <input type="month" v-model="selectedMonth" />
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
                    <select v-model="warehouseId">
                        <option value="">전체</option>
                        <option value="1">창고 A</option>
                        <option value="2">창고 B</option>
                    </select>
                </div>

                <div class="filter-item">
                    <label>상태</label>
                    <select v-model="selectedStatus">
                        <option value="">전체</option>
                        <option v-for="s in statusFilters" :key="s.value" :value="s.value">
                            {{ s.label }}
                        </option>
                    </select>
                </div>

                <div class="filter-item keyword">
                    <label>출고설정번호</label>
                    <input type="text" v-model="searchKeyword" placeholder="검색하세요" />
                </div>

                <button class="search-btn" @click="fetchGIList">검색</button>
            </div>
        </div>

        <!-- 출고지시 목록 -->
        <div class="items-section">
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

                        <td class="link" @click="goDetail(gi.giCode)">
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

                    <tr v-if="giList.length === 0">
                        <td colspan="11" class="text-center empty-message">
                            조회된 출고지시가 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { getGIList } from '@/api/shipping/goodsIssue.js'

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

// 상태 필터 목록
const statusFilters = [
    { label: '유효성검토', value: 'GI_RVW' },
    { label: '결재대기', value: 'GI_APPR_PEND' },
    { label: '결재승인', value: 'GI_APPR_DONE' },
    { label: '결재반려', value: 'GI_APPR_RJCT' },
    { label: '출고완료', value: 'GI_ISSUED' },
    { label: '배송중', value: 'GI_SHIP_ING' },
    { label: '배송완료', value: 'GI_SHIP_DONE' },
    { label: '취소', value: 'GI_CANCEL' }
]

// 출고지시 목록 조회
const fetchGIList = async () => {
    try {
        const params = {}

        if (searchKeyword.value) params.searchKeyword = searchKeyword.value
        if (selectedStatus.value) params.status = selectedStatus.value
        if (warehouseId.value) params.warehouseId = parseInt(warehouseId.value)
        if (startDate.value) params.startDate = startDate.value
        if (endDate.value) params.endDate = endDate.value

        console.log('API 호출 파라미터:', params)
        const result = await getGIList(params)
        console.log('API 응답:', result)
        giList.value = result
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
    }
}

// 출고지시 등록 모달
const openCreateModal = () => {
    router.push('/warehouse/goods-issues/create')
}

// 상세 페이지 이동
const goDetail = (giCode) => {
    router.push(`/warehouse/goods-issues/${giCode}`)
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
    GI_RVW: '유효성검토',
    GI_APPR_PEND: '결재대기',
    GI_APPR_DONE: '결재승인',
    GI_APPR_RJCT: '결재반려',
    GI_ISSUED: '출고완료',
    GI_SHIP_ING: '배송중',
    GI_SHIP_DONE: '배송완료',
    GI_CANCEL: '취소'
}[status] || status)

// 초기 로드
onMounted(() => {
    // 현재 월의 시작일과 종료일 설정
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    startDate.value = `${year}-${month}-01`

    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    endDate.value = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

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
    align-self: flex-end;
    margin-top: 18px;
}

.search-btn:hover {
    background: #3d3dbb;
}

/* ===== 리스트 섹션 ===== */
.items-section {
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
