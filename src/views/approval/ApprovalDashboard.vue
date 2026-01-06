<template>
    <div class="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div v-for="(card, index) in summaryCards" :key="index"
                class="rounded-xl p-6 flex items-center justify-between border border-transparent transition-all "
                :class="card.bgColor">
                <div>
                    <p class="text-sm text-gray-500 mb-1 font-medium">{{ card.title }}</p>
                    <div class="flex items-end gap-1">
                        <span class="text-3xl font-bold" :class="card.textColor">{{ card.count }}</span>
                        <span class="text-sm text-gray-500 mb-1">건</span>
                    </div>
                </div>
                <div class="w-12 h-12 rounded-full flex items-center justify-center bg-white bg-opacity-60 text-2xl">
                    <span v-html="card.icon"></span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-5 bg-white rounded-xl  border border-gray-100 flex flex-col h-full">
                <div class="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <span class="text-blue-600">📥</span> 결재 할 문서
                    </h2>
                    <a href="/approval/requested" class="text-xs text-blue-500 hover:underline">더보기</a>
                </div>
                <div class="p-2 flex-grow">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-xs text-gray-400 border-b border-gray-50">
                                <th class="p-3 font-medium">기안일</th>
                                <th class="p-3 font-medium">제목</th>
                                <th class="p-3 font-medium text-center">기안자</th>
                                <th class="p-3 font-medium text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="doc in todoList" :key="doc.id" class="hover:bg-gray-50 group">
                                <td class="p-3 text-gray-500">{{ doc.date }}</td>
                                <td
                                    class="p-3 font-medium text-gray-700 group-hover:text-blue-600 cursor-pointer truncate max-w-[180px]">
                                    {{ doc.title }}
                                </td>
                                <td class="p-3 text-center text-gray-600">{{ doc.author }}
                                    <span class="text-xs text-gray-400 block">{{ doc.department }}∙{{ doc.position
                                        }}</span>
                                </td>
                                <td class="p-3 text-center">
                                    <span class="px-2 py-1 rounded text-xs font-bold"
                                        :class="getStatusColor(doc.status)">
                                        {{ doc.statusText }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="todoList.length === 0" class="text-center py-10 text-gray-400 text-sm">
                        결재할 문서가 없습니다.
                    </div>
                </div>
            </div>

            <div class="lg:col-span-7 bg-white rounded-xl  border border-gray-100 flex flex-col h-full">
                <div class="p-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
                    <h2 class="text-lg font-bold text-gray-800">최근 결재 내역</h2>
                    <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button v-for="tab in tabs" :key="tab.value" @click="handleTabChange(tab.value)"
                            class="px-3 py-1 text-xs rounded-md transition-all font-medium"
                            :class="currentTab === tab.value ? 'bg-white  text-blue-600' : 'text-gray-500 hover:text-gray-700'">
                            {{ tab.label }}
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-xs text-gray-400 border-b border-gray-50">
                                <th class="p-3 font-medium">구분</th>
                                <th class="p-3 font-medium ">제목</th>
                                <th class="p-3 font-medium text-center whitespace-nowrap">기안자</th>
                                <th class="p-3 font-medium text-center whitespace-nowrap">기안일</th>
                                <th class="p-3 font-medium text-center whitespace-nowrap">상태</th>
                            </tr>
                        </thead>

                        <tbody class="text-sm">
                            <tr v-for="item in recentHistory" :key="item.id"
                                class="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">

                                <td class="p-4">
                                    <div class="items-start">
                                        <span class="px-2 py-1 rounded text-xs font-bold"
                                            :class="getTypeColor(item.type)">
                                            {{ item.typeText }}
                                        </span>
                                    </div>
                                </td>

                                <td class="p-4">
                                    <div class="flex items-start">
                                        <div class="flex flex-col">
                                            <span @click="goToDetail(item)"
                                                class="text-sm font-bold text-gray-700 truncate cursor-pointer hover:text-blue-600 max-w-[200px] lg:max-w-[280px]">
                                                {{ item.title }}
                                            </span>
                                            <span class="text-xs text-gray-400 mt-0.5">{{ item.docNo }}</span>
                                        </div>
                                    </div>
                                </td>

                                <td class="p-4 text-center text-gray-600 whitespace-nowrap">
                                    {{ item.author }}
                                    <span class="text-xs text-gray-400 block">{{ item.department }}∙{{ item.position
                                        }}</span>
                                </td>

                                <td class="p-4 text-center text-gray-500 whitespace-nowrap">
                                    {{ item.date }}
                                </td>

                                <td class="p-4 text-center whitespace-nowrap">
                                    <div class="flex justify-center">
                                        <span class="px-2 py-1 rounded-full text-xs font-bold border"
                                            :class="getResultStatusColor(item.status)">
                                            {{ item.statusText }}
                                        </span>
                                    </div>
                                </td>

                            </tr>
                        </tbody>
                    </table>

                    <div v-if="recentHistory.length === 0" class="text-center py-8 text-gray-400 text-sm">
                        내역이 없습니다.
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import {
    getSubmittedApprovals,
    getRequestedApprovals,
    getReceivedApprovals,
    getProcessedApprovals,
    getReferencedApprovals
} from '@/api/approval.js';
import { EMPLOYEE_POSITION } from '@/constants/approval';
import { useRouter } from 'vue-router';

const router = useRouter();
const todoList = ref([]);       // 결재 할 문서 목록
const recentHistory = ref([]);  // 최근 결재 내역 목록
const currentTab = ref('ALL');  // 현재 선택된 탭 (ALL, ING, APPR)

// 탭 설정 (value는 API 호출 시 파라미터로 사용하거나 필터링 로직에 사용)
const tabs = [
    { label: '전체', value: 'ALL' },
    { label: '진행중', value: 'AS_ING' },
    { label: '완료', value: 'AS_APPR' }
];

// 요약 카드 데이터 (Count는 API 호출 후 업데이트)
const summaryCards = ref([
    {
        id: 'my_ing',
        title: '진행중인 나의 결재',
        count: 0,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        icon: `<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    {
        id: 'unread_req',
        title: '확인하지 않은 결재요청',
        count: 0,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        icon: `<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`
    },
    {
        id: 'unread_ref',
        title: '확인하지 않은 수신참조',
        count: 0,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        icon: `<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z"></path></svg>`
    },
    {
        id: 'total_hist',
        title: '전체 결재내역 보기',
        count: 0,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: `<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`
    }
]);

// 1. 진행 중인 나의 결재건 수 조회
const fetchMyInProgressCount = async () => {
    try {
        const response = await getSubmittedApprovals({ status: 'AS_ING' });
        if (response) {
            summaryCards.value[0].count = response.totalElements || 0;
        }
    } catch (error) {
        console.error("fetchMyInProgressCount Error:", error);
    }
};

// 2. 아직 읽지 않은 결재 요청 수 조회
const fetchUnreadRequestedCount = async () => {
    try {
        const response = await getRequestedApprovals({ isRead: false });
        if (response) {
            summaryCards.value[1].count = response.totalElements || 0;
        }
    } catch (error) {
        console.error("fetchUnreadRequestedCount Error:", error);
    }
};

// 3. 확인하지 않은 수신/참조 문서 수 조회 (합산)
const fetchUnreadReferenceCount = async () => {
    try {
        const [receivedRes, referencedRes] = await Promise.all([
            getReceivedApprovals({ isRead: false }),
            getReferencedApprovals({ isRead: false })
        ]);

        const receivedCount = receivedRes?.totalElements || 0;
        const referencedCount = referencedRes?.totalElements || 0;

        summaryCards.value[2].count = receivedCount + referencedCount;
    } catch (error) {
        console.error("fetchUnreadReferenceCount Error:", error);
    }
};

// 4. 전체 결재 건 수 (처리한 내역 전체)
const fetchTotalHistoryCount = async () => {
    try {
        const response = await getProcessedApprovals({});
        console.log(response);
        if (response) {
            summaryCards.value[3].count = response.totalElements || 0;
        }
    } catch (error) {
        console.error("fetchTotalHistoryCount Error:", error);
    }
};

// 5. 결재할 문서 목록 조회 (ToDo List)
const fetchTodoApprovals = async () => {
    try {
        const response = await getRequestedApprovals();
        if (response && response.approvals) {
            todoList.value = response.approvals.map(dto => ({
                id: dto.approvalId,
                date: formatDate(dto.draftedAt), // 날짜 포맷팅
                title: dto.title,
                department: dto.drafterDepartment,
                position: EMPLOYEE_POSITION.CODE[dto.drafterPositionCode],
                author: dto.drafterName,
                status: dto.approvalStatus,
                statusText: mapStatusToText(dto.approvalStatus) // 한글 변환
            }));
        }
    } catch (error) {
        console.error("fetchTodoApprovals Error:", error);
    }
};

// 6. 최근 결재 내역 목록 조회
const fetchRecentApprovals = async (status = 'ALL') => {
    const params = {};

    // 탭에 따라 파라미터 설정
    if (status !== 'ALL') {
        params.approvalStatus = status;
    }

    try {
        const response = await getProcessedApprovals(params);
        if (response && response.approvals) {
            recentHistory.value = response.approvals.map(dto => ({
                id: dto.approvalId,
                type: dto.refDocType,
                typeText: mapTypeToText(dto.refDocType),
                title: dto.title,
                docNo: dto.approvalCode,
                author: dto.drafterName,
                department: dto.drafterDepartment,
                position: EMPLOYEE_POSITION.CODE[dto.drafterPositionCode],
                date: formatDate(dto.draftedAt),
                status: dto.approvalStatus,
                statusText: mapStatusToText(dto.approvalStatus)
            }));
        }
    } catch (error) {
        console.error("fetchRecentApprovals Error:", error);
    }
};

const handleTabChange = (status) => {
    currentTab.value = status;
    console.log(currentTab.value)
    fetchRecentApprovals(status);
};

const goToDetail = (approval) => {
    router.push(`/approval/${approval.id}`);
}

// 날짜 포맷 (YYYY.MM.DD)
const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
};

// 상태 코드 -> 한글 텍스트 변환
const mapStatusToText = (statusCode) => {
    switch (statusCode) {
        case 'AS_ING': return '진행중';
        case 'AS_APPR': return '완료';
        case 'AS_RJCT': return '반려';
    }
};

// 문서 타입 코드 -> 한글 텍스트 변환
const mapTypeToText = (typeCode) => {
    switch (typeCode) {
        case 'SO': return '주문서';
        case 'PR': return '생산요청서';
        case 'GI': return '출고요청서';
        default: return '일반';
    }
};

// --- UI Styling Functions ---
const getStatusColor = (status) => {
    // ToDo 리스트용 (대기/검토 등)
    if (status === 'AS_WAIT' || status === '대기') return 'bg-orange-100 text-orange-600';
    if (status === 'AS_ING' || status === '검토') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
};

const getTypeColor = (type) => {
    // 문서 종류별 뱃지 색상
    switch (type) {
        case 'SO': return 'bg-indigo-100 text-indigo-600';
        case 'GI': return 'bg-green-100 text-green-600';
        case 'PR': return 'bg-purple-100 text-purple-600';
        case 'COOP': return 'bg-orange-100 text-orange-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const getResultStatusColor = (status) => {
    // 내역 리스트용 (결재중/완료/반려)
    switch (status) {
        case 'AS_ING': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'AS_APPR': return 'bg-green-50 text-green-600 border-green-100';
        case 'AS_RJCT': return 'bg-red-50 text-red-600 border-red-100';
    }
};

onMounted(() => {
    fetchMyInProgressCount();
    fetchUnreadRequestedCount();
    fetchUnreadReferenceCount();
    fetchTotalHistoryCount();
    fetchTodoApprovals();
    fetchRecentApprovals('ALL'); // 초기엔 전체 조회
});
</script>

<style scoped>
table {
    width: 100%;
}
</style>