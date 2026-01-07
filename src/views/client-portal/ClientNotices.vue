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
            </header>

            <div class="max-w-7xl mx-auto">
                <div class="py-3 flex flex-wrap justify-between items-center gap-4 bg-slate-50">
                    <div class="text-gray-600">
                        총 <span class="font-bold text-[#4C4CDD]">{{ pageInfo.totalElements }}</span>건
                    </div>

                    <div class="flex items-center gap-3">
                        <!-- 키워드 검색 -->
                        <input type="text" v-model="searchFilter.keyword" @keyup.enter="updateUrl"
                            placeholder="공지 제목 또는 내용을 입력하세요"
                            class="border border-gray-300 rounded px-3 py-2 w-72 focus:outline-none focus:border-[#4C4CDD] bg-white" />

                        <button @click="updateUrl"
                            class="bg-[#4C4CDD] hover:bg-[#4C4CDD]/90 text-white px-4 py-2 rounded font-medium transition-colors cursor-pointer duration-200">
                            검색
                        </button>

                        <button @click="resetSearch"
                            class="bg-white border border-[#e5e7eb] hover:bg-gray-50 cursor-pointer text-gray-600 px-3 py-2 rounded text-sm transition-colors duration-200"
                            title="검색 조건 초기화">
                            초기화
                        </button>
                    </div>
                </div>

                <div class="w-full border border-[#e5e7eb] bg-white">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white border-b border-[#e5e7eb] text-gray-500 uppercase">
                                <th class="px-6 py-4 font-medium w-16 text-center">NO</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">카테고리</th>
                                <th class="px-6 py-4 font-medium">제목</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">작성자</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">부서</th>
                                <th class="px-6 py-4 font-medium w-20 text-center">첨부</th>
                                <th class="px-6 py-4 font-medium w-32 text-center">작성일</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="(notice, index) in notices" :key="notice.noticeId"
                                class="hover:bg-slate-50 transition-colors group"
                                :class="{ 'bg-slate-50/50 font-semibold': getNoticeBadgeType(notice) !== 'NORMAL' }">

                                <td class="px-6 py-4 text-center text-gray-500">
                                    <span v-if="getNoticeBadgeType(notice) !== 'NORMAL'"
                                        class="relative inline-flex items-center group">
                                        <!-- 아이콘 -->
                                        <svg fill="#4C4CDD" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" class="cursor-pointer">
                                            <path
                                                d="M2.655 15.423c-.835.892-1.542 1.158-2.655.86l2.647 4.585c.257-1.094.815-1.708 2.005-1.985l15.348-3.732-6.335-10.972-11.01 11.244zm11.32 2.707l-.467 2.118c-.094.378-.391.674-.769.771l-2.952.774c-.365.095-.753-.012-1.018-.28l-1.574-1.712 1.605-.395.646.77c.176.177.432.248.674.186l1.598-.425c.252-.064.449-.261.511-.512l.162-.906 1.584-.389zm8.719-11.267l-2.684 1.613-.756-1.262 2.686-1.612.754 1.261zm-4.396-1.161l-1.335-.616 1.342-2.914 1.335.617-1.342 2.913zm5.619 6.157l-3.202-.174.081-1.469 3.204.175-.083 1.468z" />
                                        </svg>
                                        <!-- 툴팁 -->
                                        <span
                                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 delay-100 ease-out whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg pointer-events-none z-20">
                                            {{ getNoticeBadgeType(notice) === 'URGENT'
                                                ? '긴급 공지입니다'
                                                : '고정 공지입니다' }}
                                        </span>
                                    </span>

                                    <span v-else>{{ getRowNumber(index) }}</span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-2 py-1 text-xs font-bold rounded border"
                                        :class="getCategoryBadgeStyle(notice.category)">
                                        {{ getCategoryName(notice.category) }}
                                    </span>
                                </td>

                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2 cursor-pointer"
                                        @click="goDetail(notice.noticeId)">
                                        <span v-if="getNoticeBadgeType(notice) === 'URGENT'"
                                            class="text-red-600 bg-red-50 border border-red-100 text-xs font-bold px-1.5 py-0.5 rounded">
                                            긴급
                                        </span>
                                        <!-- <span v-else-if="getNoticeBadgeType(notice) === 'PINNED'"
                                            class="text-blue-600 bg-blue-50 border border-blue-100 text-xs font-bold px-1.5 py-0.5 rounded">
                                            고정
                                        </span> -->
                                        <span
                                            class="group-hover:text-[#4C4CDD] group-hover:underline transition-colors">
                                            {{ notice.title }}
                                        </span>
                                    </div>
                                </td>

                                <td class="px-6 py-4 text-center text-sm text-gray-500 font-normal">
                                    {{ notice.employeeName }}
                                    <span class="text-xs text-gray-400 block sm:inline">{{
                                        getPositionName(notice.employeePositionCode) }}</span>
                                </td>

                                <td class="px-6 py-4 text-center text-sm text-gray-500 font-normal">
                                    <span v-if="notice.employeeDepartmentName">
                                        {{ notice.employeeDepartmentName }}
                                    </span>
                                    <span v-else>
                                        -
                                    </span>

                                </td>

                                <td class="px-6 py-4 text-center">
                                    <span v-if="notice.isNoticeAttachment"
                                        class="text-gray-400 group-hover:text-gray-600">📎</span>

                                    <span v-else>
                                        -
                                    </span>
                                </td>

                                <td class="px-6 py-4 text-center text-sm text-gray-500 font-normal">
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

                <div class="p-6 flex justify-center" v-if="pageInfo.totalPages > 0">
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
import { getNoticesByClientEmployee } from '@/api/notice/notice.js';
import { EMPLOYEE_POSITION } from '@/constants/approval.js';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const notices = ref([]);

const currentPage = ref(Number(route.query.page) || 1);

const pageInfo = ref({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
});

const searchFilter = ref({
    keyword: route.query.keyword || ''
});

const updateUrl = () => {
    router.push({
        query: {
            page: currentPage.value,
            keyword: searchFilter.value.keyword || undefined, // 빈 값이면 URL에서 제거
        }
    });
};

const fetchData = async () => {
    loading.value = true;

    // 2. 페이지 보정 (프론트 1 -> 백엔드 0)
    const pageToSend = Math.max(0, currentPage.value - 1);

    const params = {
        keyword: searchFilter.value.keyword || null,
        page: pageToSend,
        size: pageInfo.value.size
    };

    try {
        const response = await getNoticesByClientEmployee(params);
        notices.value = response.notices;

        // 3. 응답 매핑 (백엔드 0 -> 프론트 1)
        pageInfo.value = {
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            size: response.size,
            number: response.number + 1
        };

        // 데이터가 없어서 페이지가 줄어든 경우 등을 대비해 현재 페이지 동기화
        if (currentPage.value > response.totalPages && response.totalPages > 0) {
            currentPage.value = response.totalPages;
            updateUrl();
        }

    } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        notices.value = [];
    } finally {
        loading.value = false;
    }
};

// --- 이벤트 핸들러 (fetchData 호출 금지 -> updateUrl 호출) ---

// 페이지 변경
const changePage = (page) => {
    if (page < 1 || page > pageInfo.value.totalPages) return;
    currentPage.value = page;
    updateUrl(); // URL을 변경 -> watch 실행 -> fetchData 실행
};

// 검색 초기화
const resetSearch = () => {
    searchFilter.value = {
        keyword: ''
    };
    currentPage.value = 1;
    updateUrl();
};

// --- Watcher (URL 감지 및 데이터 로드) ---
// immediate: true 덕분에 처음 페이지 로드될 때도 실행됨
watch(() => route.query, (newQuery) => {
    // URL 변경 사항을 변수에 동기화
    currentPage.value = Number(newQuery.page) || 1;
    searchFilter.value.keyword = newQuery.keyword || '';

    // 데이터 요청
    fetchData();
}, { immediate: true });

const getPositionName = (code) => {
    EMPLOYEE_POSITION

    if (!code) return '';

    return EMPLOYEE_POSITION.CODE[code];
};

const goDetail = (id) => router.push(`/clients/notices/${id}`);

const isPinnedActive = (start, end) => {
    if (!start) return false;
    if (!end) return new Date() >= start; // 무한 고정
    return new Date() >= start && new Date() <= end;
};

const getNoticeBadgeType = (notice) => {
    const start = notice.pinnedStartAt ? new Date(notice.pinnedStartAt) : null;
    const end = notice.pinnedEndAt ? new Date(notice.pinnedEndAt) : null;

    const active = isPinnedActive(start, end);

    if (notice.emergency && active) return 'URGENT';
    if (!notice.emergency && active) return 'PINNED';
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

const getCategoryBadgeStyle = (code) => {
    if (code === 'NOTICE_SYSTEM') return 'bg-gray-800 text-white';
    if (code === 'NOTICE_CUSTOMER') return 'bg-[#4C4CDD] text-white';
    return 'bg-white text-[#4C4CDD]';
};

const getRowNumber = (index) => {
    // 전체 개수 - (현재 페이지 이전까지의 개수) - 현재 인덱스
    const { totalElements, size } = pageInfo.value;
    const current = currentPage.value; // 현재 페이지 (1부터 시작)

    // 공식: 전체 - ((페이지-1) * 사이즈) - 인덱스
    return totalElements - ((current - 1) * size) - index;
};

const getCategoryName = (code) => {
    if (code && code === 'NOTICE_CUSTOMER') {
        return '대외 공지';
    }

    return '공지';
};
</script>