<template>
    <div class="pr-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">생산요청 목록</h1>
                <p class="page-description">
                    확정된 생산요청 내역을 조회하고 담당자를 확인할 수 있습니다.
                </p>
            </div>
        </div>

        <!-- 필터 및 검색 -->
        <div class="search-section">
            <div class="filter-row">
                <div class="filter-item">
                    <label>생산 요청일</label>
                    <input type="date" v-model="requestedDate" />
                </div>

                <div class="filter-item">
                    <label>생산 마감일</label>
                    <input type="date" v-model="dueDate" />
                </div>

                <div class="filter-item">
                    <label>담당자</label>
                    <select v-model="managerId">
                        <option value="">전체</option>
                        <option v-for="m in managers" :key="m.id" :value="m.id">
                            {{ m.name }}
                        </option>
                    </select>
                </div>

                <div class="filter-item">
                    <label>상태</label>
                    <select v-model="selectedStatus">
                        <option v-for="s in statusFilters" :key="s.value" :value="s.value">
                            {{ s.label }}
                        </option>
                    </select>
                </div>

                <div class="filter-item keyword">
                    <label>검색</label>
                    <input type="text" v-model="searchKeyword" placeholder="요청번호 / 주문번호 / 품목명" />
                </div>

                <button class="search-btn" @click="fetchPRList">검색</button>
            </div>
        </div>

        <!-- PR 목록 -->
        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align:center;">No</th>
                        <th style="width: 160px;">생산요청번호</th>
                        <th style="width: 160px;">주문번호</th>
                        <th style="width: 240px;">품목명</th>
                        <th style="width: 80px;">총 수량</th>
                        <th style="width: 140px;">생산요청일</th>
                        <th style="width: 140px;">생산마감일</th>
                        <th style="width: 110px;">요청자</th>
                        <th style="width: 110px;">담당자</th>
                        <th style="width: 110px; text-align:center;">상태</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(pr, index) in prList" :key="pr.prId">
                        <td class="text-center">{{ index + 1 }}</td>

                        <td class="link" @click="goDetail(pr.prId)">
                            {{ pr.prCode }}
                        </td>

                        <td>{{ pr.soCode }}</td>

                        <td class="item-name" :title="pr.mainItemName">
                            {{ pr.mainItemName }}
                            <span v-if="pr.itemTypeCount > 1">
                                외 {{ pr.itemTypeCount - 1 }}건
                            </span>
                        </td>

                        <td class="text-center">
                            {{ formatQuantity(pr.totalQuantity) }}
                        </td>

                        <td>{{ formatDate(pr.requestedAt) }}</td>
                        <td>{{ formatDate(pr.dueAt) }}</td>

                        <td>{{ pr.drafterName }}</td>
                        <td>{{ pr.managerName || '-' }}</td>

                        <td class="text-center">
                            <span :class="getStatusClass(pr.status)">
                                {{ getStatusLabel(pr.status) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="prList.length === 0">
                        <td colspan="10" class="text-center empty-message">
                            조회된 생산요청이 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPRList } from '@/api/production/productionRequest.js'

const router = useRouter()

const requestedDate = ref('')
const dueDate = ref('')
const managerId = ref('')
const searchKeyword = ref('')
const selectedStatus = ref('')
const prList = ref([])

const managers = ref([
    { id: 1, name: '김생산' },
    { id: 2, name: '이관리' }
])

const statusFilters = [
    { label: '전체', value: '' },
    { label: '주문검토', value: 'PR_RVW' },
    { label: '결재중', value: 'PR_APPR' },
    { label: '결재승인', value: 'PR_APPR_DONE' },
    { label: '결재반려', value: 'PR_RJCT' },
    { label: '계획수립', value: 'PR_PLANNED' },
    { label: '생산중', value: 'PR_PRODUCING' },
    { label: '생산완료', value: 'PR_DONE' },
    { label: '취소', value: 'PR_CANCEL' }
]

const fetchPRList = async () => {
    const params = {}

    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (selectedStatus.value) params.status = selectedStatus.value
    if (managerId.value) params.managerId = managerId.value
    if (requestedDate.value) params.requestedDate = requestedDate.value
    if (dueDate.value) params.dueDate = dueDate.value

    prList.value = await getPRList(params)
}

const goDetail = (prId) => {
    router.push(`/production/requests/${prId}`)
}

const formatDate = (value) => {
    if (!value) return '-'
    return value.slice(0, 10)
}

const formatQuantity = (qty) => {
    return qty != null ? qty.toLocaleString() : '-'
}

const getStatusClass = (status) => ({
    PR_RVW: 'status-badge status-review',
    PR_APPR: 'status-badge status-review',
    PR_APPR_DONE: 'status-badge status-approved',
    PR_RJCT: 'status-badge status-reject',
    PR_PLANNED: 'status-badge status-plan',
    PR_PRODUCING: 'status-badge status-progress',
    PR_DONE: 'status-badge status-complete',
    PR_CANCEL: 'status-badge status-cancel'
}[status] || 'status-badge')

const getStatusLabel = (status) => ({
    PR_RVW: '주문검토',
    PR_APPR: '결재중',
    PR_APPR_DONE: '결재승인',
    PR_RJCT: '결재반려',
    PR_PLANNED: '계획수립',
    PR_PRODUCING: '생산중',
    PR_DONE: '생산완료',
    PR_CANCEL: '취소'
}[status] || status)

onMounted(fetchPRList)
</script>


<style scoped>
/* ===== 페이지 전체 ===== */
.pr-page {
    padding: 5px;
    width: 100%;
}

/* ===== 헤더 ===== */
.page-header {
    margin-bottom: 32px;
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
.search-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.search-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.search-input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.search-input:focus {
    outline: none;
    border-color: #4C4CDD;
}

.search-btn {
    padding: 10px 24px;
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

.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.filter-btn {
    padding: 6px 14px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
}

.filter-btn.active {
    background: #4C4CDD;
    color: #ffffff;
    border-color: #4C4CDD;
}

/* ===== 리스트 카드 ===== */
.items-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
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

.text-right {
    text-align: right;
}

/* ===== 상태 ===== */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-active {
    background: #dcfce7;
    color: #166534;
}

.status-inactive {
    background: #fef3c7;
    color: #92400e;
}

.status-complete {
    background: #e0e7ff;
    color: #3730a3;
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

.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}

/* ===== 필터 행 ===== */
.filter-row {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
}

/* 개별 필터 블록 */
.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: #374151;
}

/* 날짜 range용 */
.filter-item span {
    align-self: center;
    padding: 0 4px;
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

/* 날짜 2개 들어가는 필터 */
.filter-item>div,
.filter-item {
    white-space: nowrap;
}

/* 검색 키워드 필드 넓게 */
.filter-item.keyword {
    flex: 1;
    min-width: 260px;
}

/* 검색 버튼 위치 */
.filter-row .search-btn {
    height: 36px;
    align-self: flex-end;
    margin-top: 18px;
}

.status-review {
    background: #fff7ed;
    color: #c2410c;
}

.status-approved {
    background: #e0f2fe;
    color: #0369a1;
}

.status-reject {
    background: #fee2e2;
    color: #991b1b;
}

.status-plan {
    background: #fef3c7;
    color: #92400e;
}

.status-progress {
    background: #ede9fe;
    color: #5b21b6;
}

.status-cancel {
    background: #f3f4f6;
    color: #374151;
}
</style>
