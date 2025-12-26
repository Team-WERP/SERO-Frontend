<template>
    <div class="approval-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <div class="breadcrumb">전자결재 > 결재문서함</div>
                <h1 class="page-title">전자결재 워크스페이스</h1>
                <p class="page-description">진행 중인 결재 문서와 처리 내역을 한곳에서 관리합니다.</p>
            </div>
            <button class="write-btn" @click="goToWritePage">
                <i class="fas fa-pen"></i> + 새 결재 작성
            </button>
        </div>

        <!-- 탭 네비게이션 (함 구분) -->
        <div class="tabs-container">
            <button 
                v-for="tab in tabs" 
                :key="tab.id"
                class="tab-btn"
                :class="{ active: currentTab === tab.id }"
                @click="changeTab(tab.id)"
            >
                {{ tab.label }}
                <span class="count-badge" v-if="tab.count > 0">{{ tab.count }}</span>
            </button>
        </div>

        <!-- 검색 영역 -->
        <div class="search-section">
            <div class="search-row">
                <!-- 날짜 검색 -->
                <div class="search-group">
                    <label>조회 기간</label>
                    <div class="date-picker-wrapper">
                        <input type="date" v-model="searchFilter.startDate" class="search-input date-input" />
                        <span>~</span>
                        <input type="date" v-model="searchFilter.endDate" class="search-input date-input" />
                    </div>
                </div>

                <!-- 상태 검색 -->
                <div class="search-group">
                    <label>결재 상태</label>
                    <select v-model="searchFilter.status" class="search-input select-input">
                        <option value="">전체</option>
                        <option value="AS_ING">진행중</option>
                        <option value="AS_APPR">승인</option>
                        <option value="AS_RJCT">반려</option>
                    </select>
                </div>

                <!-- 키워드 검색 -->
                <div class="search-group flex-grow">
                    <label>검색어</label>
                    <input
                        v-model="searchFilter.keyword"
                        type="text"
                        placeholder="제목, 기안자, 문서번호 검색"
                        class="search-input"
                        @keyup.enter="fetchApprovals"
                    />
                </div>

                <button class="search-btn" @click="fetchApprovals">검색</button>
                <button class="reset-btn" @click="resetSearch">초기화</button>
            </div>
        </div>

        <!-- 결재 목록 테이블 -->
        <div class="approval-section">
            <div class="section-header">
                <h2 class="section-title">{{ getCurrentTabLabel() }} 목록</h2>
                <span class="total-count">총 {{ totalElements }}건</span>
            </div>

            <table class="approval-table">
                <thead>
                    <tr>
                        <th style="width: 50px;" class="text-center">No</th>
                        <th style="width: 100px;" class="text-center">문서유형</th>
                        <th style="width: 140px;">문서번호</th>
                        <th style="width: auto;">제목</th>
                        <th style="width: 100px;">기안자</th>
                        <th style="width: 150px;" class="text-center">기안일</th>
                        <th style="width: 100px;" class="text-center">상태</th>
                        <th style="width: 150px;" class="text-center">진행상황</th> <!-- 우리가 만든 진행률 -->
                        <th style="width: 80px;" class="text-center">관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in approvalList" :key="item.approvalId">
                        <td class="text-center">{{ (pageInfo.number * pageInfo.size) + index + 1 }}</td>
                        <td class="text-center">
                            <span class="doc-type-badge" :class="item.refType.toLowerCase()">{{ item.refType }}</span>
                        </td>
                        <td class="text-font-mono">{{ item.approvalCode }}</td>
                        <td class="title-cell">
                            <span class="title-text" @click="openDetail(item.approvalId)">
                                {{ item.title }}
                            </span>
                            <i v-if="item.isApprovalAttachment" class="fas fa-paperclip clip-icon"></i>
                        </td>
                        <td>
                            <div class="drafter-info">
                                <span class="name">{{ item.drafterName }}</span>
                                <span class="dept">{{ item.drafterDepartment }}</span>
                            </div>
                        </td>
                        <td class="text-center date-text">{{ formatDate(item.draftedAt) }}</td>
                        <td class="text-center">
                            <span class="status-badge" :class="getStatusClass(item.approvalStatus)">
                                {{ getStatusName(item.approvalStatus) }}
                            </span>
                        </td>
                        <td class="text-center">
                            <!-- 백엔드에서 만든 currentApprovedCount / totalLine 활용 -->
                            <div class="progress-container">
                                <div class="progress-text">
                                    {{ item.currentApprovedCount }} / {{ item.totalLine }} 
                                    ({{ Math.round((item.currentApprovedCount / item.totalLine) * 100) }}%)
                                </div>
                                <div class="progress-bar-bg">
                                    <div 
                                        class="progress-bar-fill" 
                                        :style="{ width: (item.currentApprovedCount / item.totalLine) * 100 + '%' }"
                                    ></div>
                                </div>
                                <!-- 현재 결재자 표시 (hover 시 툴팁이나 아래에 작게) -->
                                <div class="current-approver" v-if="item.currentApproverName">
                                    현 결재: {{ item.currentApproverName }}
                                </div>
                            </div>
                        </td>
                        <td class="text-center">
                            <button class="action-btn view-btn" @click="openDetail(item.approvalId)">
                                조회
                            </button>
                        </td>
                    </tr>
                    <tr v-if="approvalList.length === 0">
                        <td colspan="9" class="text-center empty-message">
                            조회된 결재 문서가 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 페이지네이션 (간단 구현) -->
            <div class="pagination" v-if="totalPages > 0">
                <button :disabled="pageInfo.number === 0" @click="changePage(pageInfo.number - 1)">&lt;</button>
                <span class="page-info">{{ pageInfo.number + 1 }} / {{ totalPages }}</span>
                <button :disabled="pageInfo.number >= totalPages - 1" @click="changePage(pageInfo.number + 1)">&gt;</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
// import { getRequestedApprovals, getSubmittedApprovals, ... } from '@/api/approval'; // 실제 API

// 상태 변수
const currentTab = ref('requested'); // 기본값: 결재 요청함 (pending)
const approvalList = ref([]);
const totalElements = ref(0);
const totalPages = ref(0);
const pageInfo = reactive({
    number: 0,
    size: 10
});

// 탭 정의
const tabs = ref([
    { id: 'requested', label: '결재 요청함', count: 5 }, // pending
    { id: 'submitted', label: '기안함', count: 0 },
    { id: 'received', label: '수신함', count: 2 },
    { id: 'referenced', label: '참조함', count: 0 },
    { id: 'archived', label: '결재 보관함', count: 0 },
]);

// 검색 필터
const searchFilter = reactive({
    keyword: '',
    startDate: '',
    endDate: '',
    status: ''
});

// 탭 변경 시 호출
const changeTab = (tabId) => {
    currentTab.value = tabId;
    pageInfo.number = 0; // 페이지 초기화
    resetSearch(false);  // 검색 조건 초기화 (API 호출 포함)
};

// 페이지 변경
const changePage = (page) => {
    pageInfo.number = page;
    fetchApprovals();
};

// 검색 조건 초기화
const resetSearch = (triggerFetch = true) => {
    searchFilter.keyword = '';
    searchFilter.startDate = '';
    searchFilter.endDate = '';
    searchFilter.status = '';
    if (triggerFetch) fetchApprovals();
};

// --- [Mock API] 실제 백엔드 연동 시 교체할 부분 ---
const fetchApprovals = async () => {
    console.log(`API 호출: /approvals/${currentTab.value}`, { ...searchFilter, ...pageInfo });
    
    // 더미 데이터 생성 (백엔드 DTO 구조와 동일하게 맞춤)
    // 실제로는 axios.get(`/approvals/${currentTab.value}`, { params: ... }) 사용
    setTimeout(() => {
        const mockData = Array.from({ length: 5 }, (_, i) => ({
            approvalId: i + 1,
            approvalCode: `APP-2024-${String(i + 1).padStart(3, '0')}`,
            title: `${getCurrentTabLabel()} 테스트 결재 문서 제목입니다 ${i + 1}`,
            approvalStatus: i % 2 === 0 ? 'AS_ING' : 'AS_APPR',
            totalLine: 4,
            currentApprovedCount: i % 2 === 0 ? 2 : 4, // 진행률 데이터
            currentApproverName: i % 2 === 0 ? '김부장' : '',
            refType: i % 3 === 0 ? 'SO' : (i % 3 === 1 ? 'PR' : 'GI'),
            refCode: `SO-2024-${i}`,
            draftedAt: '2024-05-20 14:30:00',
            drafterName: '이대리',
            drafterDepartment: '영업1팀',
            isApprovalAttachment: i % 2 !== 0
        }));

        approvalList.value = mockData;
        totalElements.value = 12;
        totalPages.value = 3;
    }, 300);
};

// --- 유틸리티 함수 ---

const getCurrentTabLabel = () => {
    return tabs.value.find(t => t.id === currentTab.value)?.label || '';
};

const goToWritePage = () => {
    alert('결재 작성 페이지로 이동');
    // router.push('/approval/write');
};

const openDetail = (id) => {
    console.log('상세 페이지 이동:', id);
    // router.push(`/approval/detail/${id}`);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.substring(0, 10); // YYYY-MM-DD 만 표시
};

// 상태 코드 -> 텍스트 변환
const getStatusName = (code) => {
    const map = {
        'AS_ING': '진행중',
        'AS_APPR': '승인',
        'AS_RJCT': '반려',
        'AS_SAVE': '임시저장'
    };
    return map[code] || code;
};

// 상태 코드 -> CSS 클래스 매핑
const getStatusClass = (code) => {
    if (code === 'AS_APPR') return 'status-approved';
    if (code === 'AS_RJCT') return 'status-rejected';
    if (code === 'AS_ING') return 'status-pending';
    return 'status-default';
};

// 초기화
onMounted(() => {
    // 오늘 날짜 세팅 등 필요하면 수행
    fetchApprovals();
});
</script>

<style scoped>
.approval-page {
    padding: 5px;
    width: 100%;
}

/* 헤더 & 작성 버튼 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
}
.breadcrumb { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
.page-title { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px; }
.page-description { font-size: 14px; color: #6b7280; }

.write-btn {
    padding: 10px 20px;
    background-color: #4C4CDD;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}
.write-btn:hover { background-color: #3d3dbb; }

/* 탭 네비게이션 */
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
    position: relative;
}
.tab-btn:hover { color: #4C4CDD; }
.tab-btn.active {
    color: #4C4CDD;
    border-bottom-color: #4C4CDD;
    font-weight: 700;
}
.count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ef4444;
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 6px;
    vertical-align: middle;
}

/* 검색 영역 */
.search-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
}

.search-row {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.search-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.search-group label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.search-input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    height: 38px;
}
.search-input:focus { outline: none; border-color: #4C4CDD; }

.date-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}
.date-input { width: 140px; }
.select-input { width: 120px; }
.flex-grow { flex: 1; min-width: 200px; }

.search-btn, .reset-btn {
    padding: 0 20px;
    height: 38px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
}
.search-btn { background: #111827; color: white; }
.search-btn:hover { background: #000; }
.reset-btn { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
.reset-btn:hover { background: #e5e7eb; }


/* 테이블 영역 */
.approval-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    min-height: 400px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.section-title { font-size: 18px; font-weight: 700; color: #111827; }
.total-count { font-size: 14px; color: #6b7280; }

.approval-table { width: 100%; border-collapse: collapse; table-layout: fixed;}
.approval-table thead { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.approval-table th { padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280; }
.approval-table td { 
    padding: 14px 12px; 
    border-bottom: 1px solid #e5e7eb; 
    font-size: 14px; 
    color: #111827; 
    vertical-align: middle; 
}
.approval-table tbody tr:hover { background: #f9fafb; }

/* 테이블 셀 스타일 */
.text-center { text-align: center; }
.text-font-mono { font-family: monospace; color: #6b7280; font-size: 13px; text-align: center; }

.doc-type-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
}
.doc-type-badge.so { background: #e0e7ff; color: #4338ca; } /* 주문 */
.doc-type-badge.pr { background: #dcfce7; color: #15803d; } /* 생산 */
.doc-type-badge.gi { background: #ffedd5; color: #c2410c; } /* 출고 */

.title-cell { display: flex; align-items: center; gap: 6px; overflow: hidden; }
.title-text { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.title-text:hover { text-decoration: underline; color: #4C4CDD; }
.clip-icon { font-size: 12px; color: #9ca3af; }

.drafter-info { display: flex; flex-direction: column; font-size: 13px; }
.drafter-info .dept { font-size: 11px; color: #9ca3af; }
.date-text { font-size: 13px; color: #6b7280; }

/* 상태 뱃지 */
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-approved { background: #dcfce7; color: #166534; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-default { background: #f3f4f6; color: #374151; }

/* 진행률 바 */
.progress-container { width: 100%; max-width: 120px; margin: 0 auto; }
.progress-text { font-size: 11px; color: #6b7280; margin-bottom: 2px; text-align: center; }
.progress-bar-bg { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #4C4CDD; border-radius: 3px; transition: width 0.3s; }
.current-approver { font-size: 10px; color: #ef4444; margin-top: 2px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 버튼 */
.view-btn {
    padding: 6px 12px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}
.view-btn:hover { background: #f9fafb; border-color: #9ca3af; }

.empty-message { padding: 60px 0; color: #9ca3af; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; gap: 8px; margin-top: 20px; align-items: center;}
.pagination button { 
    padding: 6px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; 
}
.pagination button:disabled { background: #f3f4f6; cursor: not-allowed; color: #9ca3af; }
.page-info { font-size: 14px; color: #374151; }
</style>