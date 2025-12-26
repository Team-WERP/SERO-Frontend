<template>
    <div class="received-approval-page">
        <div class="breadcrumb">전자결재 > 수신 문서함</div>
        <div class="page-header">
            <div>
                <h1 class="page-title">수신 문서함</h1>
                <p class="page-description">
                    최종 승인 후 수신자로 지정되어 접수된 결재 문서를 조회합니다.
                </p>
            </div>
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

                <div class="filter-item">
                    <label>열람 여부</label>
                    <select v-model="searchFilter.isRead">
                        <option :value="null">전체</option>
                        <option :value="true">열람</option>
                        <option :value="false">미열람</option>
                    </select>
                </div>

                <div class="filter-item keyword">
                    <label>검색</label>
                    <input 
                        type="text" 
                        v-model="searchFilter.keyword" 
                        placeholder="제목, 기안자, 결재코드 검색"
                        @keyup.enter="fetchData"
                    >
                </div>

                <button class="search-btn" @click="fetchData">검색</button>
            </div>
        </div>

        <div class="items-section">
            <div class="section-header">
                <p class="mb-4">
                    총 <strong class="text-[#4C4CDD]">{{ pageInfo.totalElements }}</strong>건
                    <span v-if="unreadCount > 0" style="margin-left: 10px; font-size: 13px; color: #ef4444;">
                        (미열람 {{ unreadCount }}건)
                    </span>
                </p>
            </div>

            <div class="table-responsive">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 50px; min-width: 50px;">No</th>
                            <th class="text-center" style="width: 130px; min-width: 130px;">결재 번호</th>
                            <th class="text-center" style="width: 100px; min-width: 100px;">문서 구분</th>
                            <th style="min-width: 300px;">제목</th>
                            <th class="text-center" style="width: 60px; min-width: 60px;">첨부</th>
                            <th class="text-center" style="width: 100px; min-width: 100px;">결재 상태</th>
                            <th class="text-center" style="width: 100px; min-width: 100px;">기안자</th>
                            <th class="text-center" style="width: 120px; min-width: 120px;">기안 부서</th>
                            <th class="text-center" style="width: 120px; min-width: 120px;">기안일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="approvals.length === 0">
                            <td colspan="9" class="text-center empty-message">수신된 결재 문서가 없습니다.</td>
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
                                <div class="title-wrapper">
                                    <span v-if="!item.viewedAt" class="badge-new">N</span>
                                    
                                    <span 
                                        class="link" 
                                        :class="{ 'font-bold': !item.viewedAt }" 
                                        @click="goToDetail(item.approvalId)"
                                    >
                                        {{ item.title }}
                                    </span>
                                </div>
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
                            
                            <td class="text-center">{{ item.drafterName }}</td>
                            <td class="text-center text-gray">{{ item.drafterDepartment }}</td>
                            
                            <td class="text-center">{{ formatDate(item.draftedAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination" v-if="pageInfo.totalPages > 0">
                <button 
                    class="page-btn prev-btn" 
                    :disabled="pageInfo.number === 0"
                    @click="changePage(pageInfo.number - 1)"
                >
                    &lt;
                </button>
                <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    class="page-btn"
                    :class="{ active: pageInfo.number === (page - 1) }"
                    @click="changePage(page - 1)"
                >
                    {{ page }}
                </button>
                <button 
                    class="page-btn next-btn" 
                    :disabled="pageInfo.number >= pageInfo.totalPages - 1"
                    @click="changePage(pageInfo.number + 1)"
                >
                    &gt;
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getReceivedApprovals } from '@/api/approval.js'; 

const searchFilter = ref({
    keyword: '',
    startDate: '',
    endDate: '',
    refDocType: '',
    isRead: null // null: 전체, true: 열람, false: 미열람
});

const pageInfo = ref({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
});

const approvals = ref([]);
const unreadCount = ref(0);

// === 매핑 함수 ===
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
    return 'status-active'; // 수신함은 기본적으로 승인된 문서라 active 처리
};
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.substring(0, 10);
};

// 페이징 계산
const visiblePages = computed(() => {
    const currentPage = pageInfo.value.number + 1;
    const total = pageInfo.value.totalPages;
    const pageCount = 5; 
    let start = Math.floor((currentPage - 1) / pageCount) * pageCount + 1;
    let end = start + pageCount - 1;
    if (end > total) end = total;
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
});

const changePage = (page) => {
    if (page < 0 || page >= pageInfo.value.totalPages) return;
    pageInfo.value.number = page;
    fetchData();
};

const goToDetail = (id) => {
    console.log('상세 페이지 이동:', id);
    // 상세 이동 로직
};

// === API 호출 ===
const fetchData = async () => {
    const params = {
        keyword: searchFilter.value.keyword || null,
        startDate: searchFilter.value.startDate,
        endDate: searchFilter.value.endDate,
        refDocType: searchFilter.value.refDocType || null,
        isRead: searchFilter.value.isRead,
        page: pageInfo.value.number,
        size: pageInfo.value.size
    };

    console.log('수신 문서함 조회 params:', params);

    try {
        const response = await getReceivedApprovals(params);
        if (response) {
            approvals.value = response.approvals || [];
            pageInfo.value.totalElements = response.totalElements || 0;
            pageInfo.value.totalPages = response.totalPages || 0;
            
            // 안 읽은 건수 (화면상 계산)
            unreadCount.value = approvals.value.filter(item => !item.viewedAt).length;
        }
    } catch (error) {
        console.error('수신 문서함 조회 실패:', error);
        approvals.value = [];
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
/* ===== 레이아웃 ===== */
.received-approval-page { padding: 5px; width: 100%; }
.page-header { margin-bottom: 24px; }
.breadcrumb { font-size: 14px; color: #6b7280; margin: 0 0 4px 0; }
.page-title { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px; }
.page-description { font-size: 14px; color: #6b7280; }

/* ===== 검색 / 필터 ===== */
.filter-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 10px; }
.search-section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
.filter-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }

.filter-item { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #374151; }
.filter-item label { font-size: 14px; font-weight: 600; color: #374151; }

.date-range-box { display: flex; align-items: center; gap: 4px; }
.date-range-box .tilde { font-size: 14px; color: #6b7280; }

.filter-item input[type="date"],
.filter-item input[type="text"],
.filter-item select {
    height: 36px; padding: 0 10px; border: 1px solid #d1d5db; border-radius: 6px; 
    font-size: 13px; background: #ffffff; min-width: 140px;
}
.filter-item.keyword { flex: 1; min-width: 260px; } 
.filter-item input:focus, .filter-item select:focus { outline: none; border-color: #4C4CDD; }

.search-btn {
    height: 36px; padding: 0 24px; background: #4C4CDD; color: #ffffff; 
    border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.search-btn:hover { background: #3d3dbb; }

/* ===== 리스트 & 테이블 ===== */
.items-section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; }
.table-responsive { width: 100%; overflow-x: auto; scrollbar-width: thin; }
.table-responsive::-webkit-scrollbar { height: 8px; }
.table-responsive::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 4px; }

.items-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.items-table thead { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
.items-table th { padding: 12px 12px; font-size: 14px; font-weight: 600; color: #374151; text-align: left; }
/* 헤더 가운데 정렬 */
.items-table th.text-center { text-align: center; }

.items-table td { padding: 12px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; vertical-align: middle; }
.items-table tbody tr:hover { background: #f9fafb; }

.text-center { text-align: center; }
.text-gray { color: #6b7280; font-size: 13px; }
.link { color: #4C4CDD; cursor: pointer; font-weight: 500; }
.link:hover { text-decoration: underline; }
.font-bold { font-weight: 700; color: #111827; } 
.code-text { font-family: monospace; color: #6b7280; font-weight: 600; }

/* 뱃지 */
.title-wrapper { display: flex; align-items: center; gap: 6px; }
.badge-new {
    background-color: #ef4444; color: white; font-size: 10px; font-weight: 700;
    padding: 1px 5px; border-radius: 4px; line-height: 1.2;
}

.doc-type-badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
.badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
.badge-purple { background: #f3e8ff; color: #7e22ce; border: 1px solid #f3e8ff; }

.status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-active { background: #dcfce7; color: #166534; }

.empty-message { padding: 60px 0; color: #9ca3af; font-size: 14px; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px; margin-bottom: 24px; }
.page-btn {
    min-width: 32px; height: 32px; padding: 0 6px; border: 1px solid #e5e7eb;
    background-color: #ffffff; color: #374151; font-size: 13px; font-weight: 500;
    border-radius: 4px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
}
.page-btn:hover:not(:disabled) { border-color: #4C4CDD; color: #4C4CDD; background-color: #eff6ff; }
.page-btn.active { background-color: #4C4CDD; color: #ffffff; border-color: #4C4CDD; }
.page-btn:disabled { background-color: #f9fafb; color: #9ca3af; cursor: not-allowed; border-color: #e5e7eb; }
.prev-btn, .next-btn { font-family: monospace; font-weight: 700; }
</style>