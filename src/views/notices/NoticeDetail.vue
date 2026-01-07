<template>
    <div class="min-h-screen text-sm">
        <div v-if="loading" class="flex justify-center items-center h-[50vh]">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
        </div>

        <div v-else-if="notice" class="mx-auto">
            <header class="flex justify-between items-center mb-4">
                <h1 class="text-[28px] font-bold flex items-center gap-2">
                    <span class="w-1.5 h-8 bg-[#4C4CDD] rounded inline-block"></span>
                    공지사항 상세
                </h1>
                <div class="flex gap-2 font-medium">
                    <button @click="goBack"
                        class="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer">
                        목록
                    </button>
                    <!-- <button v-if="canEdit" @click="goEdit"
                        class="px-3 py-1.5 bg-[#4C4CDD] text-white border border-[#4C4CDD] rounded hover:bg-[#4346a8] transition-colors cursor-pointer">
                        수정
                    </button> -->
                    <button v-if="canEdit" @click="deleteNotice"
                        class="px-3 py-1.5 bg-[#4C4CDD] text-white border border-[#4C4CDD] rounded hover:bg-[#4346a8] transition-colors cursor-pointer">
                        삭제
                    </button>
                </div>
            </header>

            <section class="bg-white border border-[#e5e7eb] rounded">
                <div class="grid grid-cols-12 border-b border-[#e5e7eb]">
                    <div
                        class="col-span-12 md:col-span-2 bg-slate-50 px-3 py-2.5 flex items-center border-r border-[#e5e7eb]">
                        <label class="font-semibold">제목</label>
                    </div>

                    <div class="col-span-12 md:col-span-10 px-3 py-2.5 flex items-center gap-2 flex-wrap">
                        <span v-if="noticeStatus.type === 'EMERGENCY'"
                            class="px-2 py-0.5 rounded text-xs font-semibold border bg-red-100 text-red-600 border-red-200 whitespace-nowrap">
                            긴급
                        </span>
                        <span
                            v-else-if="noticeStatus.type === 'PINNED_PERMANENT' || noticeStatus.type === 'PINNED_PERIOD'"
                            class="px-2 py-0.5 rounded text-xs font-semibold border bg-indigo-100 text-indigo-600 border-indigo-200 whitespace-nowrap">
                            고정
                        </span>

                        <span :class="getCategoryBadgeClass(notice.category)"
                            class="px-2 py-0.5 rounded text-xs font-semibold border whitespace-nowrap">
                            {{ getCategoryLabel(notice.category) }}
                        </span>
                        <h2 class="font-semibold break-all">{{ notice.title }}</h2>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-[#e5e7eb]">
                    <div
                        class="col-span-6 md:col-span-2 bg-slate-50 px-3 py-2.5 flex items-center border-r border-[#e5e7eb]">
                        <label class="font-semibold">작성자</label>
                    </div>
                    <div class="col-span-6 md:col-span-4 px-3 py-2.5 border-r-0 md:border-r border-[#e5e7eb]">
                        {{ notice.creatorName }}
                        <span v-if="notice.creatorDepartmentName" class="text-slate-400 text-xs ml-1">
                            {{ notice.creatorDepartmentName }} / {{ getPositionName(notice.creatorPositionCode) }}
                        </span>
                        <span v-else class="text-slate-400 text-xs ml-1">
                            {{ getPositionName(notice.creatorPositionCode) }}
                        </span>
                    </div>

                    <div
                        class="col-span-6 md:col-span-2 bg-slate-50 px-3 py-2.5 flex items-center border-t md:border-t-0 border-r border-[#e5e7eb]">
                        <label class="font-semibold">등록일</label>
                    </div>
                    <div class="col-span-6 md:col-span-4 px-3 py-2.5 border-t md:border-t-0">
                        {{ formatDate(notice.createdAt) }}
                    </div>
                </div>

                <div v-if="noticeStatus.type !== 'NORMAL'" class="grid grid-cols-12 border-b border-[#e5e7eb]">
                    <div
                        class="col-span-6 md:col-span-2 bg-slate-50 px-3 py-2.5 flex items-center border-r border-[#e5e7eb]">
                        <label class="font-semibold">게시 상태</label>
                    </div>
                    <div class="col-span-18 md:col-span-10 px-3 py-2.5 flex items-center gap-4 align-center">
                        <div class="flex items-center gap-2">
                            <span :class="noticeStatus.badgeClass"
                                class="flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded bg-opacity-10 border">
                                {{ noticeStatus.label }}
                            </span>
                        </div>

                        <!-- <div v-if="noticeStatus.endDate" class="flex items-center gap-2 text-slate-600">
                            <span class="text-xs text-slate-400">|</span>
                            <span class="font-medium">{{ noticeStatus.endLabel }} :</span>
                            <span>{{ formatDateOnly(noticeStatus.endDate) }}</span>
                            <span v-if="isExpired(noticeStatus.endDate)"
                                class="text-red-500 text-xs font-bold">(만료됨)</span>
                        </div> -->

                        <div v-if="noticeStatus.endDate" class="flex items-center gap-2 text-slate-400">
                            <span class="text-slate-400">|</span>

                            <span class="font-meduim">{{ noticeStatus.endLabel }} :</span>
                            <span>{{ formatDateOnly(noticeStatus.endDate) }}</span>

                            <span v-if="getExpireLabel(noticeStatus.endDate)"
                                :class="getExpireLabel(noticeStatus.endDate).class" class="text-xs">
                                ({{ getExpireLabel(noticeStatus.endDate).text }})
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 고정 만료 안내 -->
                <div v-if="noticeStatus.type === 'NORMAL'
                    && notice.pinnedEndAt
                    && isExpired(notice.pinnedEndAt)
                    && !notice.emergency" class="grid grid-cols-12 border-b border-[#e5e7eb] bg-slate-50">

                    <div class="col-span-12 md:col-span-2 px-3 py-2.5 flex items-center border-r border-[#e5e7eb]">
                        <label class="font-semibold text-slate-500">안내</label>
                    </div>

                    <div class="col-span-12 md:col-span-10 px-3 py-2.5 text-xs text-slate-500">
                        상단 고정 기간이
                        <span class="font-medium text-slate-700">
                            {{ formatDateOnly(notice.pinnedEndAt) }}
                        </span>
                        기준으로 만료되어 공지가 자동 해제되었습니다.
                    </div>
                </div>

                <!-- 긴급 만료 안내 -->
                <div v-if="noticeStatus.type === 'NORMAL'
                    && notice.pinnedEndAt
                    && isExpired(notice.pinnedEndAt)
                    && notice.emergency" class="grid grid-cols-12 border-b border-[#e5e7eb] bg-red-50/40">

                    <div class="col-span-12 md:col-span-2 px-3 py-2.5 flex items-center border-r border-[#e5e7eb]">
                        <label class="font-semibold text-red-600">안내</label>
                    </div>

                    <div class="col-span-12 md:col-span-10 px-3 py-2.5 text-xs text-red-600">
                        긴급 공지 효력이
                        <span class="font-medium">
                            {{ formatDateOnly(notice.pinnedEndAt) }}
                        </span>
                        기준으로 종료되어 일반 공지로 전환되었습니다.
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-[#e5e7eb]">
                    <div
                        class="col-span-12 md:col-span-2 bg-slate-50 px-3 py-2.5 flex items-center border-r border-[#e5e7eb]">
                        <label class="font-semibold">첨부 파일</label>
                    </div>
                    <div class="col-span-12 md:col-span-10 px-3 py-2.5">
                        <div v-if="notice.attachments && notice.attachments.length > 0" class="flex flex-wrap gap-2">
                            <a v-for="file in notice.attachments" :key="file.attachmentId" :href="file.attachmentUrl"
                                download
                                class="flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:border-[#4C4CDD] hover:text-[#4C4CDD] transition-colors cursor-pointer group">
                                <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4C4CDD]" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                                    </path>
                                </svg>
                                <span class="group-hover:text-[#4C4CDD]">{{ file.attachmentName }}</span>
                            </a>
                        </div>
                        <span v-else class="text-slate-400">첨부된 파일이 없습니다.</span>
                    </div>
                </div>

                <div class="p-4 min-h-100">
                    <div class="view-content" v-html="notice.content"></div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getNoticeDetail, getNoticeDetailByClientEmployee, deleteNotice as deleteNoticeAPI } from '@/api/notice/notice.js';
import { EMPLOYEE_POSITION } from '@/constants/approval.js';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const notice = ref(null);
const loading = ref(true);

const canEdit = computed(() => {
    if (!notice.value) return false;

    // 예: 작성자 본인이거나 시스템 관리자일 때
    return userStore.user?.id === notice.value.creatorId || userStore.hasAuthority('AC_SYS');
});

onMounted(async () => {
    const noticeId = route.params.noticeId;

    if (!noticeId) {
        alert('잘못된 접근입니다.');
        router.back();
        return;
    }

    try {
        loading.value = true;
        let response;

        if (userStore.hasAuthority('AC_CLI')) {
            response = await getNoticeDetailByClientEmployee(noticeId);
        } else {
            response = await getNoticeDetail(noticeId);
        }

        notice.value = response;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            alert('삭제되거나 존재하지 않는 공지사항입니다.');
        } else {
            alert('공지사항 목록 조회 중 오류가 발생했습니다.');
        }

        console.error('공지사항 상세 조회 실패:', error);
        router.back();
    } finally {
        loading.value = false;
    }
});

const goBack = () => {
    const isClient = userStore.hasAuthority('AC_CLI');

    if (isClient) {
        router.push('/client-portal/notices');
    } else {
        router.push('/notices');
    }
};

const goEdit = () => router.push(`/notice/edit/${notice.value.noticeId}`);

const formatDateOnly = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const getDDay = (dateStr) => {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diff = Math.floor((target - today) / (1000 * 60 * 60 * 24));

    return diff; // 0, 1, -1, 2 ...
};

const getExpireLabel = (dateStr) => {
    const dDay = getDDay(dateStr);

    if (dDay === null) return null;
    if (dDay < 0) return { text: '만료됨', class: 'text-red-500 font-semibold' };
    if (dDay === 0) return { text: '오늘 만료', class: 'text-red-600 font-semibold' };
    if (dDay === 1) return { text: 'D-1', class: 'text-orange-500 font-semibold' };

    return { text: `D-${dDay}`, class: 'text-slate-500' };
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // YYYY-MM-DD HH:mm 형태로 변환
    const date = new Date(dateStr);

    return date.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
};

const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
};

const noticeStatus = computed(() => {
    if (!notice.value) return {};

    const { emergency, pinnedStartAt, pinnedEndAt } = notice.value;
    console.log(notice.value);

    // 만료 여부 체크 (종료일이 존재하고, 현재 시간보다 이전이면 True)
    const isEnded = pinnedEndAt ? isExpired(pinnedEndAt) : false;

    if (emergency) {
        if (isEnded) {
            return { type: 'NORMAL' };
        }

        return {
            type: 'EMERGENCY',
            label: '긴급 공지',
            endLabel: '긴급 종료일',
            endDate: pinnedEndAt,
            badgeClass: 'bg-red-50 text-red-600 border-red-200',
            dotClass: 'bg-red-500'
        };
    }

    if (pinnedStartAt) {
        if (!pinnedEndAt) {
            return {
                type: 'PINNED_PERMANENT',
                label: '상단 고정 (무기한)',
                endLabel: null,
                endDate: null,
                badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
                dotClass: 'bg-indigo-500'
            };
        }

        if (isEnded) {
            return { type: 'NORMAL' };
        }

        return {
            type: 'PINNED_PERIOD',
            label: '상단 고정',
            endLabel: '고정 종료일',
            endDate: pinnedEndAt,
            badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            dotClass: 'bg-indigo-500'
        };
    }

    return { type: 'NORMAL' };
});

const getCategoryLabel = (code) => {
    const map = {
        'NOTICE_INTERNAL': '사내 공지',
        'NOTICE_CUSTOMER': '고객 공지',
        'NOTICE_SYSTEM': '시스템 공지'
    };
    return map[code] || '공지';
};

const deleteNotice = async () => {
    if (!notice.value) return;

    const confirmed = confirm('공지사항을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        await deleteNoticeAPI(notice.value.noticeId);
        alert('공지사항이 삭제되었습니다.');
    } catch (e) {
        console.error(e);
        alert('공지사항 삭제에 실패했습니다.');
    }
}

const getCategoryBadgeClass = (code) => {
    // 시스템
    if (code === 'NOTICE_SYSTEM') return 'bg-gray-800 text-white';

    // 고객
    if (code === 'NOTICE_CUSTOMER') return 'bg-white text-[#4C4CDD]';

    // 사내
    return 'bg-[#4C4CDD] text-white';
};

const getPositionName = (code) => {
    if (!code) return '';

    return EMPLOYEE_POSITION.CODE[code];
};
</script>

<style scoped>
.view-content :deep(p) {
    margin-bottom: 0.75em;
    line-height: 1.6;
}

.view-content :deep(h1),
.view-content :deep(h2),
.view-content :deep(h3) {
    font-weight: 700;
    margin: 1.5em 0 0.5em;
    color: #1e293b;
}

.view-content :deep(h1) {
    font-size: 1.5rem;
}

.view-content :deep(h2) {
    font-size: 1.25rem;
}

.view-content :deep(h3) {
    font-size: 1.125rem;
}

/* list */
.view-content :deep(ul),
.view-content :deep(ol) {
    padding-left: 1.5rem;
    margin: 0.75rem 0;
}

.view-content :deep(li) {
    margin-bottom: 0.25rem;
}

/* table */
.view-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin: 1rem 0;
}

.view-content :deep(tr:nth-child(even)) {
    background-color: #f8fafc;
}

.view-content :deep(td) {
    border: 1px solid #94a3b8;
    padding: 0.5rem 0.75rem;
    vertical-align: top;
}

.view-content :deep(td p) {
    margin: 0;
}

/* inline */
.view-content :deep(strong) {
    font-weight: 600;
}

.view-content :deep(u) {
    text-decoration: underline;
}

.view-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

.view-content {
    overflow-x: auto;
}
</style>