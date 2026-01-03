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
                    <button @click="openPopup"
                        class="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                        미리보기
                    </button>
                    <button @click="router.back()"
                        class="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                        목록으로
                    </button>

                    <button v-if="isMyTurn" @click="openApprovalModal" class="px-3 py-1.5 bg-[#4c4cdd] text-white rounded text-sm font-medium hover:bg-[#3b3bcf]
                        shadow-sm
                        flex items-center gap-1.5 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        결재 하기
                    </button>
                </div>
            </header>

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
                                <button @click="goToRefDocDetail"
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
                                </button>
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

        <ApprovalActionModal v-if="isApprovalModalOpen" :data="approvalData" @close="closeApprovalModal"
            @approve="handleApprove" @reject="handleReject" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { getApprovalDetail, approve, reject } from '@/api/approval.js';
import { useUserStore } from '@/stores/user';
import ApprovalActionModal from '@/components/approval/ApprovalActionModal.vue';
import { EMPLOYEE_RANK, EMPLOYEE_POSITION, APPROVAL_TYPE, DOC_TYPE_LABEL } from '@/constants/approval.js';
import { getSODetail } from '@/api/order/salesOrder.js';
import { getPRDetail } from '@/api/production/productionRequest.js';
import { getGIDetail } from '@/api/shipping/goodsIssue.js';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isApprovalModalOpen = ref(false);

const {
    user
} = storeToRefs(userStore)

const approvalId = route.params.approvalId;

const loading = ref(true);
const approvalData = ref(null);
const isMyTurn = ref(false);

const fetchApprovalData = async () => {
    loading.value = true;

    try {
        const response = await getApprovalDetail(approvalId);

        approvalData.value = response;

        checkMyTurn();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const checkMyTurn = () => {
    const currentApprover = approvalData.value.approvalLines.find(line => line.status === 'ALS_RVW');

    const loggedUserId = user.value.id;

    isMyTurn.value = currentApprover && currentApprover.approverId === loggedUserId;
};

onMounted(() => {
    fetchApprovalData();
});

const openApprovalModal = () => {
    isApprovalModalOpen.value = true;
};

const closeApprovalModal = () => {
    isApprovalModalOpen.value = false;
};

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

const goToRefDocDetail = () => {
    const refDocCode = approvalData.value.refDocCode;
    const refDocId = approvalData.value.refDocId;
    const refDocType = refDocCode.slice(0, 2);

    if (refDocType.toUpperCase() === 'SO') {
        router.push(`/order/management/${refDocId}`);
    } else if (refDocType.toUpperCase() === 'GI') {
        router.push(`/warehouse/goods-issues/${refDocId}`);
    } else if (refDocType.toUpperCase() === 'PR') {
        router.push(`/production/requests/${refDocId}`);
    } else {
        alert('지원하지 않는 문서 타입입니다.');
    }
};

const handleApprove = async (note) => {
    try {
        await approve(approvalData.value.approvalId, note);

        alert('결재가 승인되었습니다.');
        closeApprovalModal();

        fetchApprovalData();
    } catch (e) {
        console.error(e);
        alert('결재 승인에 실패했습니다.');
    }
};

const handleReject = async (note) => {
    try {
        await reject(approvalData.value.approvalId, note);

        alert('결재가 반려되었습니다.');
        closeApprovalModal();

        fetchApprovalData();
    } catch (e) {
        console.error(e);
        alert('결재 반려에 실패했습니다.');
    }
};

const order = ref(null);
const giData = ref(null);
const prData = ref(null);

const getOrderData = async (refDocId) => {
    try {
        order.value = await getSODetail(refDocId);
    } catch (error) {
        console.error("결재 미리보기 조회 실패:", error);

        alert("문서 정보를 불러오는데 실패했습니다.");
        return;
    }
};

const getPrData = async (refDocId) => {
    try {
        prData.value = await getPRDetail(refDocId);
    } catch (error) {
        console.error("결재 미리보기 조회 실패:", error);

        alert("문서 정보를 불러오는데 실패했습니다.");
        return;
    }
};

const getGiData = async (refDocId) => {
    try {
        giData.value = await getGIDetail(refDocId);
    } catch (error) {
        console.error("결재 미리보기 조회 실패:", error);

        alert("문서 정보를 불러오는데 실패했습니다.");
        return;
    }
};

const getLoadingHtml = () => {
    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>문서 로딩 중...</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: "Noto Sans KR", sans-serif; }
            </style>
        </head>
        <body>
            <div class="flex flex-col justify-center items-center h-screen bg-white">
                <div class="w-10 h-10 border-4 border-gray-200 border-t-[#4C4CDD] rounded-full animate-spin mb-4"></div>
                <span class="text-[20px] font-semibold text-slate-700">문서 정보를 불러오는 중...</span>
                <p class="text-slate-400 text-sm mt-2">잠시만 기다려주세요.</p>
            </div>
        </body>
        </html>
    `;
};

const openPopup = async () => {
    const refDocType = approvalData.value.refDocType;
    const refDocId = approvalData.value.refDocId;

    const popup = window.open('', '_blank', 'width=900,height=900,scrollbars=yes');

    if (!popup) {
        alert('팝업 차단을 해제해주세요.');
        return;
    }

    popup.document.write(getLoadingHtml());
    popup.document.close(); // 브라우저가 로딩 화면을 렌더링하도록 마감

    try {
        const drafter = approvalFlow.value.find(item => item.lineType === 'drafter') || {};
        const draftDate = approvalData.value.draftedAt ? formatDate(approvalData.value.draftedAt).slice(0, 10) : '-';
        const draftContent = approvalData.value.content || '';

        const approvalLineHtml = approvalFlow.value.map(line => {
            const position = getPositionName(line.approverPositionCode) || '담당';
            const name = line.approverName;
            const status = line.status;
            const date = line.processedAt ? formatDate(line.processedAt).slice(0, 10).replace(/-/g, '/') : '';

            let signContent = '';
            if (status === 'ALS_APPR' || (line.lineType === 'drafter' && status === 'ALS_APPR')) {
                signContent = `
                <div class="flex flex-col items-center justify-center w-full h-full">
                    <span class="text-blue-600 font-bold border-2 border-blue-600 rounded-full w-14 h-14 flex items-center justify-center text-sm opacity-80 transform rotate-[-5deg]" style="border-width:3px;">
                        ${name}<br>인
                    </span>
                </div>`;
            } else if (status === 'ALS_RJCT') {
                signContent = `<span class="text-red-500 font-bold text-lg">반려</span>`;
            } else {
                signContent = `<span class="text-gray-300"></span>`;
            }

            return `
            <td class="border-r border-black p-0 w-24">
                <div class="bg-gray-100 border-b border-black p-1 text-center text-xs font-bold h-7 flex items-center justify-center">
                    ${position}
                </div>
                <div class="h-20 border-b border-black flex items-center justify-center p-1">
                    ${signContent}
                </div>
                <div class="h-8 flex items-center justify-center text-[11px] text-gray-700 font-medium bg-white">
                    ${date}
                </div>
            </td>
        `;
        }).join('');

        const emptySlots = 2 - approvalFlow.value.length;
        let emptySlotsHtml = '';
        if (emptySlots > 0) {
            emptySlotsHtml = Array(emptySlots).fill(`
            <td class="border-r border-black p-0 w-24">
                <div class="bg-gray-100 border-b border-black h-7"></div>
                <div class="h-20 border-b border-black"></div>
                <div class="h-8"></div>
            </td>
        `).join('');
        }

        let finalHtml = '';

        if (refDocType === 'SO') {
            await getOrderData(refDocId);

            if (!order.value) {
                alert('데이터를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
                popup.close();
                return;
            }

            const getPopupContent = () => {
                const itemsHtml = order.value.items.map((item, idx) => `
                <tr>
                    <td class="border-r border-b border-black p-2">${idx + 1}</td>
                    <td class="border-r border-b border-black p-2">${item.itemCode || '-'}</td>
                    <td class="border-r border-b border-black p-2 text-left px-3">${item.itemName}</td>
                    <td class="border-r border-b border-black p-2">${item.spec || '-'}</td>
                    <td class="border-r border-b border-black p-2 text-center">${(item.quantity || 0).toLocaleString()}</td>
                    <td class="border-r border-b border-black p-2 text-center">${item.unit || 'EA'}</td>
                    <td class="border-r border-b border-black p-2 text-right">${(item.unitPrice || 0).toLocaleString()}</td>
                    <td class="border-r border-b border-black p-2 text-right">${(item.totalPrice || 0).toLocaleString()}</td>
                </tr>
            `).join('');

                const totalQuantity = order.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const orderDate = order.value.orderedAt ? order.value.orderedAt.slice(0, 10) : '-';
                const shipDate = order.value.shippedAt ? order.value.shippedAt.slice(0, 10) : '-';

                // HTML 반환
                return `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>결재 문서 미리보기</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: "Noto Sans KR", sans-serif; margin: 0; }
                        /* 인쇄 시 버튼 숨김 처리 */
                        @media print {
                            .no-print { display: none !important; }
                        }
                        .print-container { margin: 0 auto; padding: 10mm; background: white; box-sizing: border-box; }     
                        .writing-vertical {
                            writing-mode: vertical-lr;
                            text-orientation: upright;
                            letter-spacing: 5px;
                        }
                    </style>
                </head>
                <body class="bg-gray-100 flex justify-center print:bg-white">
                    <div class="print-container bg-white shadow-lg print:shadow-none relative w-[210mm] min-h-[297mm]">
                        
                        <div class="flex justify-end gap-3 mb-10 no-print border-b pb-4">
                            <button onclick="window.print()" class="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                인쇄하기
                            </button>
                            <button onclick="window.close()" class="px-6 py-2 bg-gray-500 text-white rounded font-bold shadow hover:bg-gray-600 transition-colors cursor-pointer">
                                닫기
                            </button>
                        </div>

                        <h1 class="text-xl font-bold text-center mb-3">${approvalData.value.title}</h1>
                        <div class="flex justify-between items-end mb-8">

                            <table class="border-collapse border border-black text-sm w-[45%]">
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold w-24">기안자</td>
                                    <td class="border border-black p-2 text-center">${drafter.approverName || '-'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">소 속</td>
                                    <td class="border border-black p-2 text-center">${drafter.approverDepartment || '-'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">기안일</td>
                                    <td class="border border-black p-2 text-center">${draftDate}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">문서번호</td>
                                    <td class="border border-black p-2 text-center">${approvalData.value.approvalCode}</td>
                                </tr>
                            </table>

                            <table class="border-collapse border-t border-b border-l border-black text-sm">
                                <tr>
                                    <td rowspan="2" class="bg-gray-100 border-r border-black w-4 text-center font-bold align-middle writing-vertical p-1">
                                        결재
                                    </td>
                                    ${approvalLineHtml}
                                    ${emptySlotsHtml}
                                </tr>
                            </table>
                        </div>

                        ${draftContent ? `
                        <div class="border border-black p-1 mb-8 text-sm">
                            <div class="font-bold mb-2 border-b border-black/20 pb-1">[기안 내용]</div>
                            ${draftContent}
                        </div>
                        ` : ''}

                        <h1 class="text-4xl font-medium text-center tracking-[15px] mb-12 border-b-[2px] border-black pb-4">주 문 서</h1>

                        <div class="grid grid-cols-2 gap-0 border-t border-l border-black mb-8">
                            <div class="border-r border-b border-black">
                                <div class="bg-gray-100 p-2 font-bold border-b border-black text-center">발주처</div>
                                <table class="w-full text-sm">
                                    <tr>
                                        <td class="w-24 bg-gray-50 p-2 border-r border-black font-bold text-center">회사명</td>
                                        <td class="p-2">${order.value.clientName}</td>
                                    </tr>
                                    <tr class="border-t border-black">
                                        <td class="bg-gray-50 p-2 border-r border-black font-bold text-center">담당자</td>
                                        <td class="p-2">${order.value.clientManagerName || '-'}</td>
                                    </tr>
                                    <tr class="border-t border-black">
                                        <td class="bg-gray-50 p-2 border-r border-black font-bold text-center">연락처</td>
                                        <td class="p-2">${order.value.clientManagerContact || '-'}</td>
                                    </tr>
                                    <tr class="border-t border-black">
                                        <td class="bg-gray-50 p-2 border-r border-black font-bold text-center">주소</td>
                                        <td class="p-2 leading-tight">${order.value.clientAddress || '-'}</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="border-r border-b border-black">
                                <div class="bg-gray-100 p-2 font-bold border-b border-black text-center">수주처</div>
                                <table class="w-full text-sm">
                                    <tr>
                                        <td class="w-24 bg-gray-50 p-2 border-r border-black font-bold text-center">회사명</td>
                                        <td class="p-2">새로</td>
                                    </tr>
                                    <tr class="border-t border-black">
                                        <td class="bg-gray-50 p-2 border-r border-black font-bold text-center">담당자</td>
                                        <td class="p-2">${order.value.managerName || '박지혜'}</td>
                                    </tr>
                                    <tr class="border-t border-black">
                                        <td class="bg-gray-50 p-2 border-r border-black font-bold text-center">연락처</td>
                                        <td class="p-2">010-4444-5555</td>
                                    </tr>
                                    <tr class="border-t border-black">
                                        <td class="bg-gray-50 p-2 border-r border-black font-bold text-center">주소</td>
                                        <td class="p-2 leading-tight">서울시 동작구 보라매로 87</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class="border-t border-l border-black mb-8 text-sm grid grid-cols-4">
                            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">주문 번호</div>
                            <div class="p-2 border-r border-b border-black">${order.value.orderCode}</div>
                            
                            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">주문 일자</div>
                            <div class="p-2 border-r border-b border-black">${orderDate}</div>
                            
                            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">납기 일자</div>
                            <div class="p-2 border-r border-b border-black col-span-3">${shipDate}</div>
                            
                            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">비고</div>
                            <div class="p-2 border-r border-b border-black col-span-3">${order.value.note || '-'}</div>
                        </div>

                        <h3 class="text-lg font-bold mb-2">주문 품목 정보</h3>
                        <table class="w-full border-t border-l border-black text-xs text-center mb-8">
                            <thead class="bg-gray-100 font-bold">
                                <tr>
                                    <th class="border-r border-b border-black p-2 w-10">No</th>
                                    <th class="border-r border-b border-black p-2 w-24">품목 코드</th>
                                    <th class="border-r border-b border-black p-2">품목명</th>
                                    <th class="border-r border-b border-black p-2 w-24">규격</th>
                                    <th class="border-r border-b border-black p-2 w-16">수량</th>
                                    <th class="border-r border-b border-black p-2 w-14">단위</th>
                                    <th class="border-r border-b border-black p-2 w-24">단가(원)</th>
                                    <th class="border-r border-b border-black p-2 w-28">금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                                <tr class="bg-gray-100 font-medium">
                                    <td colspan="4" class="border-r border-b border-black p-2 font-bold">합계</td>
                                    <td class="border-r border-b border-black p-2 font-bold">${totalQuantity.toLocaleString()}</td>
                                    <td colspan="2" class="border-r border-b border-black p-2"></td>
                                    <td class="border-r border-b border-black p-2 text-right font-bold">${(order.value.totalPrice || 0).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="border-t border-l border-black text-sm font-medium grid grid-cols-4">
                            <div class="bg-gray-100 p-3 border-r border-b border-black font-bold text-center">총 수량</div>
                            <div class="p-3 border-r border-b border-black text-center">${totalQuantity.toLocaleString()}</div>
                            
                            <div class="bg-gray-100 p-3 border-r border-b border-black font-bold text-center">공급가액</div>
                            <div class="p-3 border-r border-b border-black text-right">${(order.value.totalPrice || 0).toLocaleString()} 원</div>
                            
                            <div class="bg-gray-100 p-4 border-r border-b border-black text-center flex items-center justify-center font-bold text-base">총 합계 금액</div>
                            <div class="p-4 border-r border-b font-bold border-black text-right text-xl col-span-3">
                                ${(order.value.totalPrice || 0).toLocaleString()} 원
                            </div>
                        </div>

                    </div>
                </body>
                </html>`;
            };

            finalHtml = getPopupContent();
        } else if (refDocType === 'GI') {
            getGiData(refDocId);

            if (!giData.value) {
                alert('데이터를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
                popup.close();
                return;
            }

            const getPopupContent = () => {
                const gi = giData.value;
                const items = gi.items || [];

                // 1. 품목 리스트 HTML 생성
                const itemsHtml = items.map((item, idx) => `
                <tr>
                    <td class="center">${idx + 1}</td>
                    <td class="center">${item.itemCode || '-'}</td>
                    <td>${item.itemName}</td>
                    <td class="center">${item.spec || '-'}</td>
                    <td class="center">${item.unit || 'EA'}</td>
                    <td class="right bold">${(item.quantityAUn || 0).toLocaleString()}</td>
                </tr>
            `).join('');

                // 2. 빈 행 채우기 (최소 5줄 유지)
                const emptyRowsCount = Math.max(0, 5 - items.length);
                const emptyRowsHtml = Array(emptyRowsCount).fill(`
                <tr>
                    <td class="center">&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            `).join('');

                // 3. 총 수량 계산
                const totalQuantity = items.reduce((sum, item) => sum + (item.quantityAUn || 0), 0);

                // 날짜 포맷팅
                const scheduledDate = gi.scheduledAt ? formatDate(gi.scheduledAt).slice(0, 10) : '-';

                // HTML 반환
                return `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>결재 문서 미리보기</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: "Noto Sans KR", sans-serif; margin: 0; }
                        @media print { .no-print { display: none !important; } }
                        
                        /* 컨테이너 스타일 */
                        .print-container { margin: 0 auto; padding: 10mm; background: white; box-sizing: border-box; width: 210mm; min-height: 297mm; }     
                        .writing-vertical { writing-mode: vertical-lr; text-orientation: upright; letter-spacing: 5px; }

                        /* 출고지시서 전용 스타일 */
                        .gi-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                        .gi-header h1 { font-size: 32px; font-weight: bold; color: #111827; }
                        
                        /* 상단 우측 정보 테이블 */
                        .header-info-table { border-collapse: collapse; text-align: left; font-size: 13px; }
                        .header-info-table th { padding: 4px 12px; font-weight: 600; background: #f3f4f6; border: 1px solid #d1d5db; }
                        .header-info-table td { padding: 4px 12px; border: 1px solid #d1d5db; }

                        .divider { border: none; border-top: 2px solid #111827; margin: 20px 0; }
                        
                        /* 섹션 제목 */
                        h3 { font-size: 16px; font-weight: bold; color: #111827; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb; }

                        /* 상세 정보 테이블 (From/To) */
                        .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; }
                        .detail-table th { width: 100px; padding: 8px 12px; font-weight: 600; background: #f9fafb; border: 1px solid #e5e7eb; text-align: left; }
                        .detail-table td { padding: 8px 12px; border: 1px solid #e5e7eb; }

                        /* 품목 테이블 */
                        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #d1d5db; font-size: 13px; }
                        .items-table th { padding: 10px 8px; font-weight: 600; background: #f3f4f6; border: 1px solid #d1d5db; text-align: center; }
                        .items-table td { padding: 8px; border: 1px solid #e5e7eb; text-align: center; }
                        .items-table tfoot td { background: #f9fafb; font-weight: bold; border-top: 2px solid #d1d5db; padding: 10px 8px; }

                        .right { text-align: right !important; }
                        .center { text-align: center !important; }
                        
                        .note-box { padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; min-height: 80px; font-size: 14px; white-space: pre-wrap; }
                        
                        /* 수령인 정보 박스 */
                        .recipient-box { display: flex; align-items: center; gap: 20px; padding: 10px; background: #f9fafb; border: 1px solid #e5e7eb; margin-top: 5px; font-size: 13px; }
                        .recipient-box .label { font-weight: 600; color: #374151; }
                        .recipient-box .value { font-weight: bold; color: #111827; }
                    </style>
                </head>
                <body class="bg-gray-100 flex justify-center print:bg-white">
                    <div class="print-container bg-white shadow-lg print:shadow-none relative">
                        
                        <div class="flex justify-end gap-3 mb-10 no-print border-b pb-4">
                            <button onclick="window.print()" class="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                인쇄하기
                            </button>
                            <button onclick="window.close()" class="px-6 py-2 bg-gray-500 text-white rounded font-bold shadow hover:bg-gray-600 transition-colors cursor-pointer">
                                닫기
                            </button>
                        </div>

                        <h1 class="text-xl font-bold text-center mb-3">${approvalData.value.title}</h1>
                        
                        <div class="flex justify-between items-end mb-8">
                            <table class="border-collapse border border-black text-sm w-[45%]">
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold w-24">기안자</td>
                                    <td class="border border-black p-2 text-center">${drafter.approverName || '-'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">소 속</td>
                                    <td class="border border-black p-2 text-center">${drafter.approverDepartment || '-'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">기안일</td>
                                    <td class="border border-black p-2 text-center">${draftDate}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">문서번호</td>
                                    <td class="border border-black p-2 text-center">${approvalData.value.approvalCode}</td>
                                </tr>
                            </table>

                            <table class="border-collapse border-t border-b border-l border-black text-sm">
                                <tr>
                                    <td rowspan="2" class="bg-gray-100 border-r border-black w-4 text-center font-bold align-middle writing-vertical p-1">
                                        결재
                                    </td>
                                    ${approvalLineHtml}
                                    ${emptySlotsHtml}
                                </tr>
                            </table>
                        </div>

                        ${draftContent ? `
                        <div class="border border-black p-1 mb-8 text-sm">
                            <div class="font-bold mb-2 border-b border-black/20 pb-1">[기안 내용]</div>
                            ${draftContent}
                        </div>
                        ` : ''}

                        <div class="gi-header">
                            <h1>출고지시서</h1>
                            <table class="header-info-table">
                                <tbody>
                                    <tr>
                                        <th>문서번호</th>
                                        <td>${gi.giCode}</td>
                                    </tr>
                                    <tr>
                                        <th>출고예정일자</th>
                                        <td>${scheduledDate}</td>
                                    </tr>
                                    <tr>
                                        <th>참조문서</th>
                                        <td>${gi.doCode || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <hr class="divider" />

                        <div class="flex gap-8 mb-6">
                            <div class="flex-1">
                                <h3>출고 정보 (From)</h3>
                                <table class="detail-table">
                                    <tbody>
                                        <tr>
                                            <th>출고 창고</th>
                                            <td>${gi.warehouseName || '-'}</td>
                                        </tr>
                                        <tr>
                                            <th>담당자</th>
                                            <td>${gi.managerName || '미배정'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="flex-1">
                                <h3>배송 정보 (To)</h3>
                                <table class="detail-table">
                                    <tbody>
                                        <tr>
                                            <th>납품처</th>
                                            <td>${gi.companyName || '-'}</td>
                                        </tr>
                                        <tr>
                                            <th>도착지 주소</th>
                                            <td>${gi.address || '-'}</td>
                                        </tr>
                                        <tr>
                                            <th>연락처</th>
                                            <td>${gi.recipientContact || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="recipient-box">
                                    <span class="label">수령인 이름</span>
                                    <span class="value">${gi.recipientName || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <h3>출고 품목 상세</h3>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>품목코드</th>
                                    <th>품목명</th>
                                    <th>규격</th>
                                    <th>단위</th>
                                    <th>지시수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                                ${emptyRowsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="right font-bold">합계 (Total)</td>
                                    <td class="right font-bold">${totalQuantity.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <h3>특이사항 (Note)</h3>
                        <div class="note-box">
                            ${gi.note || '-'}
                        </div>

                    </div>
                </body>
                </html>`;
            };

            finalHtml = getPopupContent();
        } else if (refDocType === 'PR') {
            getPrData(refDocId);

            if (!prData.value || !prData.value.header) {
                alert('데이터를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
                popup.close();
                return;
            }

            const getPopupContent = () => {
                const header = prData.value.header; // 헤더 정보
                const items = prData.value.items;   // 품목 리스트

                // 1. 품목 리스트 HTML 생성
                const itemsHtml = items.map((item, idx) => `
                <tr>
                    <td class="center">${idx + 1}</td>
                    <td class="center">${item.itemCode || '-'}</td>
                    <td>${item.itemName}</td>
                    <td class="center">${item.spec || '-'}</td>
                    <td class="center">${item.unit || 'EA'}</td>
                    <td class="right bold">${(item.requestedQuantity || 0).toLocaleString()}</td>
                </tr>
            `).join('');

                // 2. 빈 행 채우기 (최소 10줄 유지)
                const emptyRowsCount = Math.max(0, 10 - items.length);
                const emptyRowsHtml = Array(emptyRowsCount).fill(`
                <tr>
                    <td class="center">&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            `).join('');

                // 3. 총 합계 계산
                const totalQuantity = items.reduce((acc, cur) => acc + (cur.requestedQuantity || 0), 0);

                // HTML 반환
                return `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>결재 문서 미리보기</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: "Noto Sans KR", sans-serif; margin: 0; }
                        
                        /* 인쇄 시 버튼 숨김 */
                        @media print {
                            .no-print { display: none !important; }
                        }
                        .print-container { margin: 0 auto; padding: 10mm; background: white; box-sizing: border-box; width: 210mm; min-height: 297mm; }     
                        .writing-vertical { writing-mode: vertical-lr; text-orientation: upright; letter-spacing: 5px; }
                        table.doc-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
                        table.doc-table th, table.doc-table td { border: 1px solid #000; padding: 8px; font-size: 13px; word-break: break-all; }
                        table.doc-table th { background: #f2f2f2; font-weight: bold; text-align: center; }
                        .doc-title { font-size: 32px; letter-spacing: 15px; text-decoration: underline; text-underline-offset: 8px; margin: 30px 0; text-align: center; font-weight: bold; }
                        .center { text-align: center; }
                        .right { text-align: right; }
                        .bold { font-weight: bold; }
                        .highlight-text { color: #d32f2f; font-weight: bold; }
                        .footer-note { margin-top: 20px; font-size: 12px; border: 1px solid #000; padding: 10px; min-height: 60px; }
                    </style>
                </head>
                <body class="bg-gray-100 flex justify-center print:bg-white">
                    <div class="print-container bg-white shadow-lg print:shadow-none relative">
                        
                        <div class="flex justify-end gap-3 mb-10 no-print border-b pb-4">
                            <button onclick="window.print()" class="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                인쇄하기
                            </button>
                            <button onclick="window.close()" class="px-6 py-2 bg-gray-500 text-white rounded font-bold shadow hover:bg-gray-600 transition-colors cursor-pointer">
                                닫기
                            </button>
                        </div>

                        <h1 class="text-xl font-bold text-center mb-3">${approvalData.value.title}</h1>
                        
                        <div class="flex justify-between items-end mb-8">
                            <table class="border-collapse border border-black text-sm w-[45%]">
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold w-24">기안자</td>
                                    <td class="border border-black p-2 text-center">${drafter.approverName || '-'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">소 속</td>
                                    <td class="border border-black p-2 text-center">${drafter.approverDepartment || '-'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">기안일</td>
                                    <td class="border border-black p-2 text-center">${draftDate}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray-100 border border-black p-2 text-center font-bold">문서번호</td>
                                    <td class="border border-black p-2 text-center">${approvalData.value.approvalCode}</td>
                                </tr>
                            </table>

                            <table class="border-collapse border-t border-b border-l border-black text-sm">
                                <tr>
                                    <td rowspan="2" class="bg-gray-100 border-r border-black w-4 text-center font-bold align-middle writing-vertical p-1">
                                        결재
                                    </td>
                                    ${approvalLineHtml}
                                    ${emptySlotsHtml}
                                </tr>
                            </table>
                        </div>

                        ${draftContent ? `
                        <div class="border border-black p-1 mb-8 text-sm">
                            <div class="font-bold mb-2 border-b border-black/20 pb-1">[기안 내용]</div>
                            ${draftContent}
                        </div>
                        ` : ''}

                        <div class="header-container flex justify-center">
                            <h1 class="doc-title">생 산 요 청 서</h1>
                        </div>

                        <table class="doc-table info-table">
                            <tbody>
                                <tr>
                                    <th>생산요청번호</th>
                                    <td>${header.prCode || '-'}</td>
                                    <th>요청일자</th>
                                    <td>${header.requestedAt || '-'}</td>
                                </tr>
                                <tr>
                                    <th>주문번호</th>
                                    <td>${header.soCode || '-'}</td>
                                    <th>납기일자</th>
                                    <td class="highlight-text">${header.dueAt || '-'}</td>
                                </tr>
                                <tr>
                                    <th>요청자</th>
                                    <td>${header.drafterName || '-'}</td>
                                    <th>담당자</th>
                                    <td>${header.managerName || '-'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="doc-table item-table">
                            <colgroup>
                                <col style="width: 5%">
                                <col style="width: 15%">
                                <col style="width: 30%">
                                <col style="width: 20%">
                                <col style="width: 10%">
                                <col style="width: 20%">
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>품목코드</th>
                                    <th>품목명</th>
                                    <th>규격</th>
                                    <th>단위</th>
                                    <th>수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                                ${emptyRowsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="5">합 계</th>
                                    <td class="right bold">${totalQuantity.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div class="footer-note">
                            <p>※ 특이사항: 위와 같이 생산을 요청하오니 기한 내 납품 바랍니다.</p>
                        </div>
                        
                        </div>
                </body>
                </html>`;
            };

            finalHtml = getPopupContent();
        } else {
            alert('지원하지 않는 문서 타입입니다.');
        }

        popup.document.open();
        popup.document.write(finalHtml);
        popup.document.close();

    } catch (error) {
        console.error("Popup Error:", error);
        popup.close();
        alert('문서 정보를 불러오는데 실패했습니다.');
    }
};
</script>