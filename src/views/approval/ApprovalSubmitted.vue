<template>
    <div class="submitted-approval-page">
        <div class="breadcrumb">전자결재 > 기안 문서함</div>
        <div class="page-header">
            <div>
                <h1 class="page-title">기안 문서함</h1>
                <p class="page-description">
                    기안한 결재 문서를 조회하고 진행 상태를 확인할 수 있습니다.
                </p>
            </div>
            <div>
                <button class="create-btn" @click="openDraftModal">
                    + 결재 상신
                </button>
            </div>
        </div>

        <div class="tabs-container">
            <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: currentTab === tab.id }"
                @click="changeTab(tab.id)">
                {{ tab.label }}
            </button>
        </div>

        <div class="search-section">
            <h2 class="filter-title">필터 및 검색</h2>
            <div class="filter-row">
                <div class="filter-item">
                    <label>기안일</label>
                    <div class="date-range-box">
                        <input type="date" v-model="searchFilter.startDate">
                        <span class="tilde">~</span>
                        <input type="date" v-model="searchFilter.endDate">
                    </div>
                </div>
                <div class="filter-item">
                    <label>문서 구분</label>
                    <select v-model="searchFilter.refDocType">
                        <option value="">전체</option>
                        <option value="SO">주문 요청서</option>
                        <option value="PR">생산 요청서</option>
                        <option value="GI">출고 지시서</option>
                    </select>
                </div>
                <div class="filter-item keyword">
                    <label>검색</label>
                    <input type="text" v-model="searchFilter.keyword" placeholder="제목, 기안자, 결재코드 검색"
                        @keyup.enter="fetchData">
                </div>
                <button class="search-btn" @click="fetchData">검색</button>
            </div>
        </div>

        <div class="items-section">
            <p class="mb-4">
                총 <strong class="text-[#4C4CDD]">{{ pageInfo.totalElements }}</strong>건
            </p>

            <div class="table-responsive">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 20px; min-width: 20px;">No</th>
                            <th class="text-center" style="width: 130px; min-width: 130px;">결재 번호</th>
                            <th class="text-center" style="width: 110px; min-width: 110px;">문서 구분</th>
                            <th style="min-width: 250px;">제목</th>
                            <th class="text-center" style="width: 60px; min-width: 60px;">첨부</th>
                            <th class="text-center" style="width: 100px; min-width: 100px;">결재 상태</th>
                            <th class="text-center" style="width: 180px; min-width: 180px;">진행 상황</th>
                            <th class="text-center" style="width: 110px; min-width: 110px;">기안일</th>
                            <th class="text-center" style="width: 120px; min-width: 120px;">완료일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="approvals.length === 0">
                            <td colspan="9" class="text-center empty-message">검색된 결과가 없습니다.</td>
                        </tr>
                        <tr v-for="(item, index) in approvals" :key="item.approvalId">
                            <td class="text-center">
                                {{ pageInfo.totalElements - (pageInfo.number * pageInfo.size) - index }}
                            </td>

                            <td class="text-center code-text">{{ item.approvalCode }}</td>

                            <td class="text-center">
                                <span class="doc-type-badge" :class="getRefDocTypeClass(item.refDocType)">
                                    {{ getRefDocTypeName(item.refDocType) }}
                                </span>
                            </td>

                            <td>
                                <span class="link" @click="goToDetail(item.approvalId)">{{ item.title }}</span>
                            </td>

                            <td class="text-center">
                                <span v-if="item.isApprovalAttachment" style="color:#6b7280">📎</span>
                                <span v-else>-</span>
                            </td>

                            <td class="text-center">
                                <span class="status-badge" :class="getStatusBadgeClass(item.approvalStatus)">
                                    {{ getStatusName(item.approvalStatus) }}
                                </span>
                            </td>

                            <td class="text-center align-middle">
                                <div class="progress-cell">
                                    <div class="progress-info">
                                        <span class="step-text">
                                            <template v-if="item.approvalStatus === 'AS_APPR'">
                                                최종 승인
                                            </template>

                                            <template v-else-if="item.approvalStatus === 'AS_RJCT'">
                                                반려 <b>{{ item.currentApprovedCount }}</b> / {{ item.totalLine }}
                                            </template>

                                            <template v-else>
                                                승인 <b>{{ item.currentApprovedCount }}</b> / {{ item.totalLine }}
                                            </template>
                                        </span>

                                        <span class="percent-text">
                                            <template v-if="item.approvalStatus === 'AS_APPR'">100%</template>
                                            <template v-else>
                                                {{ Math.round((item.currentApprovedCount / item.totalLine) * 100) }}%
                                            </template>
                                        </span>
                                    </div>

                                    <div class="progress-track">
                                        <div class="progress-fill" :class="getProgressBarClass(item.approvalStatus)"
                                            :style="{ width: getProgressWidth(item) + '%' }"></div>
                                    </div>

                                    <div class="current-approver"
                                        v-if="(item.approvalStatus === 'AS_ING' || item.approvalStatus === 'AS_RJCT') && (item.currentApproverName || item.rejecterName)">
                                        <span class="dot"
                                            :class="{ 'dot-red': item.approvalStatus === 'AS_RJCT' }"></span>
                                        <span v-if="item.approvalStatus === 'AS_RJCT'">반려자: {{ item.rejecterName
                                            }}</span>
                                        <span v-else>현 결재: {{ item.currentApproverName }}</span>
                                    </div>
                                    <div class="current-approver" v-else style="visibility: hidden;">&nbsp;</div>
                                </div>
                            </td>

                            <td class="text-center">{{ formatDate(item.draftedAt) }}</td>
                            <td class="text-center">{{ formatDate(item.completedAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSubmittedApprovals } from '@/api/approval';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const currentTab = ref('all');
const tabs = ref([
    { id: 'all', label: '전체' },
    { id: 'ing', label: '진행중' },
    { id: 'appr', label: '승인' },
    { id: 'rjct', label: '반려' }
]);

const searchFilter = ref({
    keyword: '',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    refDocType: '',
});

const pageInfo = ref({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
});

const approvals = ref([]);

// === 로직 함수 ===
const getRefDocTypeName = (code) => {
    const map = { 'SO': '주문 요청서', 'PR': '생산 요청서', 'GI': '출고 지시서' };
    return map[code] || code;
};
const getRefDocTypeClass = (code) => {
    const map = { 'SO': 'badge-blue', 'PR': 'badge-green', 'GI': 'badge-purple' };
    return map[code] || '';
};
const getStatusName = (code) => {
    const map = { 'AS_ING': '진행중', 'AS_APPR': '승인', 'AS_RJCT': '반려' };
    return map[code] || code;
};
const getStatusBadgeClass = (code) => {
    if (code === 'AS_APPR') return 'status-active';
    if (code === 'AS_RJCT') return 'status-reject';
    return 'status-progress';
};
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.substring(0, 10);
};

// ★★★ [수정됨] Bar 너비 계산 ★★★
const getProgressWidth = (item) => {
    // 승인(AS_APPR)만 100% 채움
    if (item.approvalStatus === 'AS_APPR') return 100;

    // 반려(AS_RJCT)도 이제 멈춘 지점만큼만 너비를 가짐 (ex: 50% 지점에서 빨간색)
    if (item.totalLine === 0) return 0;
    return (item.currentApprovedCount / item.totalLine) * 100;
};

// Bar 색상 클래스
const getProgressBarClass = (status) => {
    if (status === 'AS_APPR') return 'bar-success';
    if (status === 'AS_RJCT') return 'bar-danger';
    return 'bar-active';
};

const changeTab = (tabId) => {
    currentTab.value = tabId;
    pageInfo.value.number = 0;
    fetchData();
};

const openDraftModal = () => {
    router.push('/approval/create');
}

const goToDetail = (id) => console.log('Go to detail', id);

const fetchData = async () => {
    let statusParam = null;
    if (currentTab.value === 'ing') statusParam = 'AS_ING';
    else if (currentTab.value === 'appr') statusParam = 'AS_APPR';
    else if (currentTab.value === 'rjct') statusParam = 'AS_RJCT';

    const params = {
        keyword: searchFilter.value.keyword || null,
        startDate: searchFilter.value.startDate,
        endDate: searchFilter.value.endDate,
        refDocType: searchFilter.value.refDocType || null,
        status: statusParam
    };

    try {
        const response = await getSubmittedApprovals(params);
        if (response) {
            approvals.value = response.approvals || [];
            pageInfo.value.totalElements = response.totalElements || 0;
            pageInfo.value.totalPages = response.totalPages || 0;
            pageInfo.value.size = response.size || 10;
            pageInfo.value.number = response.number || 0;
        }
    } catch (error) {
        console.error(error);
        approvals.value = [];
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
/* ===== 페이지 전체 레이아웃 ===== */
.submitted-approval-page {
    padding: 5px;
    width: 100%;
}

.page-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.breadcrumb {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 4px 0;
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

/* ===== 탭 스타일 ===== */
.tabs-container {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 24px;
}

.tab-btn {
    padding: 12px 24px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 15px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
}

.tab-btn:hover {
    color: #4C4CDD;
}

.tab-btn.active {
    color: #4C4CDD;
    border-bottom-color: #4C4CDD;
    font-weight: 700;
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

.filter-item label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.date-range-box {
    display: flex;
    align-items: center;
    gap: 4px;
}

.date-range-box .tilde {
    font-size: 14px;
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

.filter-item.keyword {
    flex: 1;
    min-width: 260px;
}

.filter-item input:focus,
.filter-item select:focus {
    outline: none;
    border-color: #4C4CDD;
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

/* ===== 리스트 & 테이블 ===== */
.items-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.table-responsive {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: thin;
}

.table-responsive::-webkit-scrollbar {
    height: 8px;
}

.table-responsive::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 4px;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
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
    vertical-align: middle;
}

.items-table tbody tr:hover {
    background: #f9fafb;
}

.text-center {
    text-align: center;
}

.link {
    color: #4C4CDD;
    cursor: pointer;
    font-weight: 600;
}

.link:hover {
    text-decoration: underline;
}

.code-text {
    font-family: monospace;
    color: #6b7280;
    font-weight: 600;
}

.doc-type-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

.badge-blue {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #dbeafe;
}

.badge-green {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #dcfce7;
}

.badge-purple {
    background: #f3e8ff;
    color: #7e22ce;
    border: 1px solid #f3e8ff;
}

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

.status-reject {
    background: #fee2e2;
    color: #991b1b;
}

.status-progress {
    background: #ede9fe;
    color: #5b21b6;
}

/* ===== 진행 상황 Bar (수정됨) ===== */
.progress-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding: 0 4px;
    width: 100%;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 2px;
}

.step-text b {
    color: #4C4CDD;
    font-weight: 700;
}

.percent-text {
    font-weight: 600;
    color: #374151;
}

.progress-track {
    width: 100%;
    height: 6px;
    background-color: #f3f4f6;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
}

.bar-active {
    background-color: #4C4CDD;
}

.bar-success {
    background-color: #10b981;
}

.bar-danger {
    background-color: #ef4444;
}

.current-approver {
    font-size: 11px;
    color: #4b5563;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    min-height: 17px;
}

.current-approver .dot {
    width: 6px;
    height: 6px;
    background-color: #4C4CDD;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
}

.current-approver .dot-red {
    background-color: #ef4444;
}

/* 반려 시 빨간점 */

.create-btn {
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.create-btn:hover {
    background: #3d3dbb;
}

.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}
</style>