<template>
    <div class="min-h-screen text-sm">
        <div v-if="loading" class="flex justify-center items-center h-[50vh]">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
        </div>


        <div v-else>
            <header class="flex justify-between items-center mb-4">
                <h1 class="text-[28px] font-bold flex items-center gap-2">
                    <span class="w-1.5 h-8 bg-[#4C4CDD] rounded inline-block"></span>
                    공지사항
                </h1>
                <div class="flex gap-2 font-medium">
                    <button @click="goWrite"
                        class="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer">
                        + 글 작성하기
                    </button>
                </div>
            </header>

            <div class="max-w-7xl mx-auto bg-white rounded shadow-sm border border-gray-200">
                <div class="flex border-b border-gray-200">
                    <button v-for="tab in tabs" :key="tab.id"
                        class="px-6 py-4 text-sm font-medium transition-colors duration-200 relative"
                        :class="currentTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'"
                        @click="changeTab(tab.id)">
                        <span class="flex items-center gap-1">{{ tab.name }}</span>
                        <div v-if="currentTab === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600">
                        </div>
                    </button>
                </div>

                <div class="p-5 flex flex-wrap justify-between items-center gap-4 bg-slate-50 border-b border-gray-100">
                    <div class="text-sm text-gray-600">
                        총 <span class="font-bold text-black">{{ pageInfo.totalElements }}</span>건
                    </div>

                    <div class="flex items-center gap-3">
                        <label
                            class="flex items-center gap-1.5 cursor-pointer select-none text-gray-700 hover:text-black">
                            <input type="checkbox" v-model="searchFilter.onlyMine" @change="updateUrl"
                                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span>내가 쓴 글만 보기</span>
                        </label>

                        <div class="h-4 w-px bg-gray-300 mx-1"></div>

                        <select v-model="searchFilter.searchType"
                            class="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white">
                            <option value="ALL">전체 (제목+내용)</option>
                            <option value="TITLE">제목</option>
                            <option value="CONTENT">내용</option>
                            <option value="WRITER">작성자</option>
                        </select>

                        <div class="relative">
                            <input type="text" v-model="searchFilter.keyword" @keyup.enter="updateUrl"
                                placeholder="검색어를 입력하세요"
                                class="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-blue-500 pl-3" />
                        </div>

                        <button @click="updateUrl"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm">
                            검색
                        </button>

                        <button @click="resetSearch"
                            class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded text-sm transition-colors"
                            title="검색 조건 초기화">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="w-full">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase">
                                <th class="px-6 py-4 font-medium w-16 text-center">NO</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">카테고리</th>
                                <th class="px-6 py-4 font-medium">제목</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">작성자</th>
                                <th class="px-6 py-4 font-medium w-16 text-center">첨부</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">작성일</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="(notice, index) in notices" :key="notice.noticeId"
                                class="hover:bg-slate-50 transition-colors group"
                                :class="{ 'bg-slate-50/50': getNoticeBadgeType(notice) !== 'NORMAL' }">

                                <td class="px-6 py-4 text-center text-sm text-gray-500">
                                    <span v-if="getNoticeBadgeType(notice) !== 'NORMAL'">-</span>
                                    <span v-else>{{ getRowNumber(index) }}</span>
                                </td>

                                <td class="px-6 py-4 text-center">
                                    <span class="px-2 py-1 text-xs font-bold rounded border"
                                        :class="getCategoryBadgeStyle(notice.category)">
                                        {{ getCategoryName(notice.category) }}
                                    </span>
                                </td>

                                <td class="px-6 py-4 text-sm text-gray-900">
                                    <div class="flex items-center gap-2 cursor-pointer"
                                        @click="goDetail(notice.noticeId)">
                                        <span v-if="getNoticeBadgeType(notice) === 'URGENT'"
                                            class="text-red-600 bg-red-50 border border-red-100 text-xs font-bold px-1.5 py-0.5 rounded">
                                            긴급
                                        </span>
                                        <span v-else-if="getNoticeBadgeType(notice) === 'PINNED'"
                                            class="text-blue-600 bg-blue-50 border border-blue-100 text-xs font-bold px-1.5 py-0.5 rounded">
                                            고정
                                        </span>
                                        <span class="group-hover:text-blue-700 group-hover:underline transition-colors">
                                            {{ notice.title }}
                                        </span>
                                    </div>
                                </td>

                                <td class="px-6 py-4 text-center text-sm text-gray-500">
                                    {{ notice.employeeName }}
                                    <span class="text-xs text-gray-400 block sm:inline">({{
                                        notice.employeePositionCode }})</span>
                                </td>

                                <td class="px-6 py-4 text-center">
                                    <span v-if="notice.isNoticeAttachment"
                                        class="text-gray-400 group-hover:text-gray-600">📎</span>
                                </td>

                                <td class="px-6 py-4 text-center text-sm text-gray-500">
                                    {{ formatDate(notice.createdAt) }}
                                </td>
                            </tr>

                            <tr v-if="!loading && notices.length === 0">
                                <td colspan="6" class="py-16 text-center text-gray-400 bg-white">
                                    <div class="flex flex-col items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="w-8 h-8 opacity-50">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                        </svg>
                                        <span>검색 결과가 없습니다.</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="p-6 flex justify-center border-t border-gray-200" v-if="pageInfo.totalPages > 0">
                    <div class="flex items-center gap-1">
                        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                            class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-white">
                            &lt;
                        </button>

                        <button v-for="page in pageRange" :key="page" @click="changePage(page)"
                            class="w-8 h-8 flex items-center justify-center rounded font-medium border transition-colors"
                            :class="currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'">
                            {{ page }}
                        </button>

                        <button @click="changePage(currentPage + 1)" :disabled="currentPage === pageInfo.totalPages"
                            class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-white">
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getNotices as getNoticesAPI } from '@/api/notice/notice.js';

const router = useRouter();
const route = useRoute();

// --- 상태 관리 ---
const loading = ref(false);
const notices = ref([]);

// 초기값: URL에서 없으면 기본값
const currentTab = ref(route.query.tab || 'all');
const currentPage = ref(Number(route.query.page) || 1);

const pageInfo = ref({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
});

const searchFilter = ref({
    keyword: route.query.keyword || '',
    searchType: route.query.searchType || 'ALL',
    onlyMine: route.query.onlyMine === 'true' // 문자열 비교 필요
});

const tabs = [
    { id: 'all', code: null, name: '전체 공지' },
    { id: 'internal', code: 'NOTICE_INTERNAL', name: '사내 공지' },
    { id: 'customer', code: 'NOTICE_CUSTOMER', name: '대외 공지' },
    { id: 'system', code: 'NOTICE_SYSTEM', name: '시스템 공지' },
];

// --- [핵심] URL 업데이트 함수 ---
// 모든 검색, 페이징, 탭 변경은 이 함수를 통해 URL을 변경합니다.
const updateUrl = () => {
    router.push({
        query: {
            page: currentPage.value,
            tab: currentTab.value,
            keyword: searchFilter.value.keyword || undefined, // 빈 값이면 URL에서 제거
            searchType: searchFilter.value.searchType,
            onlyMine: searchFilter.value.onlyMine ? 'true' : undefined // true일 때만 표시
        }
    });
};

// --- API 호출 ---
const fetchData = async () => {
    loading.value = true;

    // 1. 탭 카테고리 설정
    const selectedTab = tabs.find(t => t.id === currentTab.value);
    const categoryCode = selectedTab ? selectedTab.code : null;

    // 2. 검색 타입 변환
    let searchTypesToSend = null;
    if (searchFilter.value.searchType === 'ALL') {
        searchTypesToSend = ['TITLE', 'CONTENT', 'WRITER'].join(',');
    } else {
        searchTypesToSend = searchFilter.value.searchType;
    }

    // 3. 페이지 보정 (프론트 1 -> 백엔드 0)
    const pageToSend = Math.max(0, currentPage.value - 1);

    console.log('pageToSend', pageToSend);

    const params = {
        category: categoryCode,
        keyword: searchFilter.value.keyword || null,
        searchType: searchTypesToSend,
        onlyMine: searchFilter.value.onlyMine,
        page: pageToSend,
        size: pageInfo.value.size
    };

    try {
        const response = await getNoticesAPI(params);
        notices.value = response.notices;

        // 4. 응답 매핑 (백엔드 0 -> 프론트 1)
        pageInfo.value = {
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            size: response.size,
            number: response.number + 1
        };

        // 데이터가 없어서 페이지가 줄어든 경우 등을 대비해 현재 페이지 동기화
        if (currentPage.value > response.totalPages && response.totalPages > 0) {
            currentPage.value = response.totalPages;
            updateUrl(); // 다시 로드
        }

    } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        notices.value = [];
    } finally {
        loading.value = false;
    }
};

// --- 이벤트 핸들러 (fetchData 호출 금지 -> updateUrl 호출) ---

// 탭 변경
const changeTab = (tabId) => {
    currentTab.value = tabId;
    currentPage.value = 1; // 탭 바뀌면 1페이지로
    searchFilter.value.keyword = ''; // 탭 바뀌면 검색어 초기화 (선택사항)
    updateUrl();
};

// 페이지 변경
const changePage = (page) => {
    if (page < 1 || page > pageInfo.value.totalPages) return;
    currentPage.value = page;
    updateUrl(); // URL을 변경 -> watch 실행 -> fetchData 실행
};

// 검색 초기화
const resetSearch = () => {
    searchFilter.value = {
        keyword: '',
        searchType: 'ALL',
        onlyMine: false
    };
    currentPage.value = 1;
    updateUrl();
};

// --- Watcher (URL 감지 및 데이터 로드) ---
// immediate: true 덕분에 처음 페이지 로드될 때도 실행됨
watch(() => route.query, (newQuery) => {
    // URL 변경 사항을 변수에 동기화
    currentPage.value = Number(newQuery.page) || 1;
    currentTab.value = newQuery.tab || 'all';
    searchFilter.value.keyword = newQuery.keyword || '';
    searchFilter.value.searchType = newQuery.searchType || 'ALL';
    searchFilter.value.onlyMine = newQuery.onlyMine === 'true'; // 문자열 체크

    // 데이터 요청
    fetchData();
}, { immediate: true });


const goWrite = () => router.push(`/notices/create`);
const goDetail = (id) => router.push(`/notices/${id}`);

// --- 유틸리티 ---

const getNoticeBadgeType = (notice) => {
    const now = new Date();
    const pinnedStart = notice.pinnedStartAt ? new Date(notice.pinnedStartAt) : null;
    const pinnedEnd = notice.pinnedEndAt ? new Date(notice.pinnedEndAt) : null;

    const isDateActive = () => {
        if (!pinnedStart) return false;
        if (!pinnedEnd) return now >= pinnedStart;
        return now >= pinnedStart && now <= pinnedEnd;
    };

    if (notice.isEmergency && isDateActive()) return 'URGENT';
    if (!notice.isEmergency && notice.pinnedStartAt && isDateActive()) return 'PINNED';
    return 'NORMAL';
};

// 5개 단위로 보여주는 페이지네이션
const pageRange = computed(() => {
    const total = pageInfo.value.totalPages;
    const current = currentPage.value;
    const limit = 5;

    let start = current - Math.floor(limit / 2);
    start = Math.max(1, start);

    let end = start + limit - 1;
    if (end > total) {
        end = total;
        start = Math.max(1, end - limit + 1);
    }

    const range = [];
    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
});

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.substring(0, 10).replace(/-/g, '.');
};

const getCategoryName = (code) => {
    const target = tabs.find(t => t.code === code);
    return target ? target.name : '공지';
};

const getCategoryBadgeStyle = (code) => {
    if (code === 'NOTICE_SYSTEM') return 'bg-gray-800 text-white border-gray-700';
    if (code === 'NOTICE_CUSTOMER') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
};

const getRowNumber = (index) => {
    // 전체 개수 - (현재 페이지 이전까지의 개수) - 현재 인덱스
    const { totalElements, size } = pageInfo.value;
    const current = currentPage.value; // 현재 페이지 (1부터 시작)

    // 공식: 전체 - ((페이지-1) * 사이즈) - 인덱스
    return totalElements - ((current - 1) * size) - index;
};
</script>