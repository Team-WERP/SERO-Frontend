<template>
    <div class="p-[5px] min-h-screen">
        <div v-if="loading" class="flex flex-col justify-center items-center h-screen">
            <div class="w-8 h-8 border-2 border-gray-200 border-t-[#4C4CDD] rounded-full animate-spin mb-2">
            </div>
            <span class="text-[20px] font-semibold">문서 정보를 불러오는 중...</span>
        </div>

        <div v-else class="max-w-7xl mx-auto pt-5">

            <header class="flex justify-between items-center mb-5">
                <div class="flex items-center gap-3">
                    <h1 class="text-[28px] font-bold text-slate-800">결재 문서 상세</h1>
                    <span class="px-2 py-0.5 rounded text-[12px] font-bold border"
                        :class="getStatusBadgeClass(approvalData.status)">
                        {{ getDocStatusName(approvalData.status) }}
                    </span>
                </div>

                <div class="flex gap-2">
                    <button @click="isPreviewOpen = true"
                        class="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                        미리보기
                    </button>
                    <button @click="router.back()"
                        class="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                        목록으로
                    </button>

                    <button v-if="isMyTurn"
                        class="px-3 py-1.5 bg-[#4c4cdd] text-white rounded text-sm font-medium hover:bg-[#3b3bcf] shadow-sm flex items-center gap-1.5 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        결재 하기
                    </button>
                </div>
            </header>

            <ApprovalPreviewModal v-if="isPreviewOpen" :data="approvalData" @close="isPreviewOpen = false" />

            <div class="flex gap-6 items-start relative">

                <div class="flex-1 min-w-0 flex flex-col gap-5">

                    <section class="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div class="bg-slate-50 px-5 py-3 border-b border-slate-200">
                            <h2 class="text-sm font-bold text-[#4C4CDD] flex items-center gap-2">
                                결재 진행 현황
                            </h2>
                        </div>

                        <div class="p-5 overflow-x-auto">
                            <div class="flex w-full px-2 py-3 min-w-[600px] items-start justify-center">

                                <template v-for="(item, idx) in approvalFlow" :key="idx">
                                    <div class="flex flex-col items-center gap-2 shrink-0 relative group">
                                        <div class="w-12 h-12 rounded-full border-4 shadow-sm flex items-center justify-center text-sm font-bold z-10 relative transition-all"
                                            :class="getLineCircleClass(item.status)">
                                            <span v-if="item.lineType === 'drafter'">기안</span>
                                            <span v-else>{{ getApprovalType(item.lineType) }}</span>

                                            <div v-if="item.processedAt"
                                                class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                {{ formatDate(item.processedAt) }}
                                            </div>
                                        </div>

                                        <div class="text-center w-max">
                                            <p class="text-xs text-slate-500 mb-0.5">{{ item.approverDepartment ||
                                                item.drafterDepartment }}</p>
                                            <p class="text-sm font-bold text-slate-800">
                                                {{ item.approverName || item.drafterName }}
                                                <span class="text-xs font-normal text-slate-500">
                                                    {{ getPositionName(item.approverPositionCode) ||
                                                        getPositionName(item.drafterPositionCode) }}
                                                    <span
                                                        v-if="getRankName(item.approverRankCode) || getRankName(item.drafterRankCode)">
                                                        ·
                                                    </span>{{
                                                        getRankName(item.approverRankCode) ||
                                                        getRankName(item.drafterRankCode) }}
                                                </span>
                                            </p>
                                            <!-- <p v-if="item.draftedAt" class="text-xs text-slate-500 mb-0.5">
                                                {{ item.draftedAt }}
                                            </p>
                                            <p v-else class="text-xs text-slate-500 mb-0.5">
                                                {{ item.processedAt }}
                                            </p> -->
                                        </div>
                                    </div>

                                    <div v-if="idx < approvalFlow.length - 1"
                                        class="flex-1 h-[2px] mx-2 rounded min-w-[20px] mt-[23px]"
                                        :class="(item.status === 'APPROVED' || item.status === 'COMPLETED') ? 'bg-blue-300' : 'bg-slate-200'">
                                    </div>
                                </template>

                            </div>
                        </div>

                        <div class="bg-slate-50 border-t border-slate-100 px-5 py-4 flex flex-col gap-3">
                            <div class="flex items-start gap-4">
                                <span class="text-xs font-bold text-slate-800 w-10 shrink-0 mt-1.5">수신</span>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="(rcv, idx) in approvalData.recipientLines" :key="idx"
                                        class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs shadow-sm flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#4C4CDD]"></span>
                                        {{ rcv.approverDepartment }} {{ rcv.approverName }} {{
                                            getPositionName(rcv.approverPositionCode)
                                        }}
                                    </span>
                                    <span v-if="!approvalData.recipientLines?.length"
                                        class="text-xs text-slate-400 mt-1">-</span>
                                </div>
                            </div>

                            <div class="border-t border-slate-200 border-dashed w-full"></div>

                            <div class="flex items-start gap-4">
                                <span class="text-xs font-bold text-slate-500 w-10 shrink-0 mt-1.5">참조</span>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="(ref, idx) in approvalData.referenceLines" :key="idx"
                                        class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs shadow-sm flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#64dd4c]"></span>
                                        {{ ref.approverDepartment }} {{ ref.approverName }} {{
                                            getPositionName(ref.approverPositionCode)
                                        }}
                                    </span>
                                    <span v-if="!approvalData.referenceLines?.length"
                                        class="text-xs text-slate-400 mt-1">-</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div class="bg-slate-50 px-5 py-3 border-b border-slate-200">
                            <h2 class="text-sm font-bold text-[#4C4CDD] flex items-center gap-2">기본 정보</h2>
                        </div>
                        <div class="p-6 grid grid-cols-2 gap-6">
                            <div class="col-span-2">
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">문서 제목</label>
                                <div class="text-sm font-bold text-slate-800">{{ approvalData.title }}</div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">문서 번호</label>
                                <div class="text-sm text-slate-600">{{ approvalData.approvalCode }}</div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">기안일</label>
                                <div class="text-sm text-slate-600">{{ formatDate(approvalData.draftedAt) }}</div>
                            </div>

                            <div class="col-span-2" v-if="approvalData.refDocCode">
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">관련 문서</label>
                                <div
                                    class="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors">
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded border border-blue-200">
                                            {{ getDocType(approvalData.refDocType) }}
                                        </span>
                                        <span class="text-sm font-bold text-blue-800">{{ approvalData.refDocCode
                                        }}</span>
                                    </div>
                                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white rounded border border-slate-200 shadow-sm p-6">
                        <div class="mb-8">
                            <label class="block text-xs font-semibold text-slate-500 mb-2 uppercase">내용</label>
                            <div
                                class="w-full min-h-[200px] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-slate-50 rounded border border-slate-100">
                                {{ approvalData.content }}
                            </div>
                        </div>

                        <div v-if="approvalData.approvalAttachments && approvalData.approvalAttachments.length > 0">
                            <label class="block text-xs font-semibold text-slate-500 mb-2 uppercase">첨부 파일</label>
                            <div class="space-y-2">
                                <div v-for="(file, idx) in approvalData.approvalAttachments"
                                    :key="file.approvalAttachmentId"
                                    class="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                    @click="downloadFile(file.approvalAttachmentUrl)">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span class="text-sm text-slate-700">{{ file.approvalAttachmentName }}</span>
                                    </div>
                                    <svg class="w-4 h-4 text-slate-400 hover:text-[#4C4CDD]" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside class="w-80 shrink-0 sticky top-5 h-fit">
                    <div class="bg-white rounded border border-slate-200 shadow-sm p-5">
                        <h3 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            결재 히스토리
                        </h3>

                        <div class="flex flex-col">
                            <div v-for="(log, idx) in historyLogs" :key="idx" class="flex gap-4">

                                <div class="flex flex-col items-center w-4 shrink-0 relative">
                                    <div class="w-3 h-3 rounded-full z-10 shrink-0 border-[2px]"
                                        :class="getHistoryDotClass(log.status)">
                                    </div>

                                    <div v-if="idx !== historyLogs.length - 1" class="w-[2px] bg-slate-200 flex-1 my-1">
                                    </div>
                                </div>

                                <div class="flex flex-col flex-1" :class="idx !== historyLogs.length - 1 ? 'pb-8' : ''">

                                    <div class="flex justify-between items-start">
                                        <span class="text-sm font-bold leading-none"
                                            :class="getHistoryTextClass(log.status)">
                                            {{ getHistoryActionName(log.status, log.lineType) }}
                                        </span>
                                        <span class="text-[11px]"
                                            :class="!log.processedAt && !log.viewedAt ? 'text-slate-300' : 'text-slate-400'">
                                            {{ getLogTimeText(log) }}
                                        </span>
                                    </div>

                                    <p class="text-sm font-bold text-slate-700 mb-1">
                                        {{ log.approverName }}
                                        <span class="text-xs font-normal text-slate-500 ml-1">{{ log.approverDepartment
                                            }}</span>
                                    </p>

                                    <div v-if="log.note" class="bg-slate-50 border border-slate-200 rounded p-2.5 mt-1">
                                        <p class="text-xs text-slate-600 leading-relaxed break-all">
                                            "{{ log.note }}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="historyLogs.length === 0" class="text-center text-xs text-slate-400 py-4">
                            히스토리가 없습니다.
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getApprovalDetail } from '@/api/approval.js';
import ApprovalPreviewModal from '@/components/approval/ApprovalPreviewModal.vue';
import { EMPLOYEE_RANK, EMPLOYEE_POSITION, APPROVAL_TYPE, DOC_TYPE_LABEL } from '@/constants/approval.js';

const route = useRoute();
const router = useRouter();

const approvalId = route.params.approvalId;

const loading = ref(true);
const isPreviewOpen = ref(false);
const approvalData = ref(null);
const isMyTurn = ref(false); // 내가 결재할 차례인지 여부 (추후 로직 구현)

const fetchApprovalData = async () => {
    loading.value = true;

    try {
        const response = await getApprovalDetail(approvalId);

        approvalData.value = response;

        // [TODO] 로그인한 사용자 ID와 비교하여 isMyTurn 설정
        checkMyTurn();
        // const myId = userStore.id;
        // const currentApprover = mockResponse.approvalLines.find(line => line.status === 'PENDING');
        // isMyTurn.value = currentApprover && currentApprover.approverId === myId;

    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const checkMyTurn = () => {

};

onMounted(() => {
    fetchApprovalData();
});

// 시각화용 결재 흐름 (기안자 + 결재자 + 협조자)
const approvalFlow = computed(() => {
    if (!approvalData.value.drafterId) return [];

    // 1. 기안자 객체 생성
    const drafter = {
        approverId: approvalData.value.drafterId,
        approverName: approvalData.value.drafterName,
        approverDepartment: approvalData.value.drafterDepartment,
        approverPositionCode: approvalData.value.drafterPositionCode,
        approverRankCode: approvalData.value.drafterRankCode,
        status: 'ALS_APPR', // 기안은 항상 승인 상태로 간주
        lineType: 'drafter',
        processedAt: approvalData.value.draftedAt
    };

    console.log(approvalData.value.approvalLines);

    // 2. 결재 라인 (순서대로 정렬)
    const lines = [...(approvalData.value.approvalLines || [])].sort((a, b) => a.sequence - b.sequence);

    return [drafter, ...lines];
});

// 히스토리 로그 생성 (기안 + 처리된 결재들)
const historyLogs = computed(() => {
    const logs = [];

    // 1. 기안 기록 (맨 처음에 추가)
    if (approvalData.value.draftedAt) {
        logs.push({
            status: 'ALS_DRAFT', // 기안 상태 코드 (임의 지정)
            approverName: approvalData.value.drafterName,
            approverDepartment: approvalData.value.drafterDepartment,
            processedAt: approvalData.value.draftedAt, // 기안은 기안일시를 처리일시로 간주
            note: null,
            lineType: 'drafter'
        });
    }

    // 2. 결재 라인 필터링
    if (approvalData.value.approvalLines) {
        const validLines = approvalData.value.approvalLines.filter(line =>
            // 조건: 이미 처리되었거나(processedAt 존재) OR 현재 검토중(ALS_RVW)인 경우
            line.processedAt || line.status === 'ALS_RVW' // (혹은 PENDING)
        );
        logs.push(...validLines);
    }

    // 3. 시간순 정렬 (과거 -> 현재)
    return logs.sort((a, b) => {
        // 비교할 날짜 가져오기 (처리일시 > 열람일시 > 기안일시 > 없으면 미래로 취급)
        const dateA = a.processedAt || a.viewedAt || a.draftedAt || '9999-12-31';
        const dateB = b.processedAt || b.viewedAt || b.draftedAt || '9999-12-31';
        return new Date(dateA) - new Date(dateB);
    });
});

// 히스토리 날짜 텍스트 표시 로직
const getLogTimeText = (log) => {
    // 1. 처리가 완료된 경우 (승인/반려/기안)
    if (log.processedAt || log.lineType === 'drafter') {
        return formatDate(log.processedAt || log.draftedAt);
    }

    // 2. 처리는 안 됐는데, 열람은 한 경우 (검토중 - 열람)
    if (log.viewedAt) {
        return `열람: ${formatDate(log.viewedAt)}`;
    }

    // 3. 처리도 안 됐고, 열람도 안 한 경우 (검토중 - 미열람)
    return '미열람';
};

// --- 스타일 및 텍스트 변환 헬퍼 ---

const getDocStatusName = (status) => {
    const map = { 'AS_ING': '결재 중', 'AS_APPR': '승인', 'AS_RJCT': '반려' };

    return map[status] || status;
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'AS_ING': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'AS_RJCT': return 'bg-red-100 text-red-700 border-red-200';
        case 'AS_APPR': return 'bg-green-100 text-green-700 border-green-200';
    }
};

const getLineCircleClass = (status) => {
    if (status === 'ALS_APPR') return 'bg-green-100 text-green-600 border-green-100 ring-2 ring-green-50';
    if (status === 'ALS_RJCT') return 'bg-red-100 text-red-600 border-red-100 ring-2 ring-red-50';
    if (status === 'ALS_RVW') return 'bg-blue-100 text-blue-600 border-blue-100 ring-2 ring-blue-200 animate-pulse'; // 현재 차례
    if (status === 'ALS_PEND') return 'bg-slate-100 text-slate-400 border-white ring-2 ring-slate-50'; // 대기중
};

const getHistoryActionName = (status, lineType) => {
    if (lineType === 'drafter') return '기안 상신';

    switch (status) {
        case 'ALS_APPR':
            return '결재 승인';
        case 'ALS_RJCT':
            return '반려';
        case 'ALS_RVW':
            return '검토 중';
        default:
            return '대기';
    }
};

// 상태별 점 색상 (검토중은 주황색 등으로 강조)
const getHistoryDotClass = (status) => {
    if (status === 'ALS_DRAFT') return 'border-blue-500 bg-blue-500';
    if (status === 'ALS_APPR') return 'border-[#4C4CDD] bg-[#4C4CDD]';
    if (status === 'ALS_RJCT') return 'border-red-500 bg-red-500';
    if (status === 'ALS_RVW') return 'border-orange-400 bg-orange-400 animate-pulse'; // 검토중 (깜빡임 효과 추천)
    return 'border-slate-300 bg-slate-300';
};

// 상태별 텍스트 색상
const getHistoryTextClass = (status) => {
    if (status === 'ALS_RJCT') return 'text-red-600';
    if (status === 'ALS_APPR') return 'text-[#4C4CDD]';
    if (status === 'ALS_RVW') return 'text-orange-500'; // 검토중
    return 'text-slate-600';
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';

    return dateStr.replace('T', ' ').slice(0, 16);
};

const downloadFile = (url) => {
    if (!url) return;
    window.open(url, '_blank');
};

const getRankName = (rank) => {
    if (rank && EMPLOYEE_RANK.CODE[rank]) {
        return EMPLOYEE_RANK.CODE[rank];
    }

    return '';
};

const getPositionName = (position) => {
    if (position && EMPLOYEE_POSITION.CODE[position]) {
        return EMPLOYEE_POSITION.CODE[position];
    }

    return '';
};

const getApprovalType = (lineType) => {
    if (lineType && APPROVAL_TYPE.CODE[lineType])
        return APPROVAL_TYPE.CODE[lineType]

    return '';
};

const getDocType = (docType) => {
    if (docType && DOC_TYPE_LABEL[docType])
        return DOC_TYPE_LABEL[docType];

    return '';
}
</script>