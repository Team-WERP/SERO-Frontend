<template>
    <div
        class="fixed inset-0 bg-slate-800/50 z-[9999] overflow-y-auto flex justify-center py-10 print:p-0 print:bg-white print:absolute print:inset-0 print:z-auto">

        <div
            class="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 flex justify-between items-center shadow-md print:hidden z-50">
            <h2 class="font-bold text-lg">문서 미리보기</h2>
            <div class="flex gap-2">
                <button @click="handlePrint"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold flex items-center gap-2 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    인쇄하기
                </button>
                <button @click="$emit('close')"
                    class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm font-bold transition-colors">
                    닫기
                </button>
            </div>
        </div>

        <div
            class="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl mt-10 mb-10 text-slate-900 print:w-full print:shadow-none print:m-0 print:p-0">

            <h1 class="text-3xl font-bold text-center border-b-2 border-black pb-4 mb-8 tracking-widest">
                기 안 서
            </h1>

            <div class="flex justify-between items-start mb-8">

                <table class="text-[13px] w-[300px]">
                    <tbody>
                        <tr>
                            <td class="font-bold w-24 py-1">문서 번호</td>
                            <td>{{ data.approvalCode || '-' }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold py-1">기안 일자</td>
                            <td>{{ formatDate(data.draftedAt) }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold py-1">기 안 자</td>
                            <td>{{ data.drafterName }} ({{ data.drafterDepartment }})</td>
                        </tr>
                        <tr>
                            <td class="font-bold py-1">보존 연한</td>
                            <td>5년</td>
                        </tr>
                    </tbody>
                </table>

                <div class="flex border border-black select-none">
                    <div v-for="(person, idx) in approvalChain" :key="idx"
                        class="flex flex-col border-l first:border-l-0 border-black w-[70px] text-center">

                        <div
                            class="bg-gray-100 border-b border-black text-[11px] py-1 h-[24px] flex items-center justify-center">
                            {{ idx === 0 ? '기안' : (person.approverPositionCode || '결재') }}
                        </div>

                        <div class="h-[60px] flex items-center justify-center relative p-1">

                            <div v-if="person.status === 'APPROVED' || person.status === 'COMPLETED' || (idx === 0 && person.status !== 'REJECTED')"
                                class="w-12 h-12 border-2 border-red-600 rounded-full flex flex-col items-center justify-center text-red-600 opacity-80">
                                <span class="text-[10px] leading-none mb-0.5">{{ formatDateShort(person.processedAt ||
                                    data.draftedAt) }}</span>
                                <span class="text-[12px] font-bold leading-none">{{ person.approverName ||
                                    person.drafterName }}</span>
                                <span class="text-[9px] leading-none mt-0.5">승인</span>
                            </div>

                            <div v-else-if="person.status === 'REJECTED'"
                                class="w-full h-full flex items-center justify-center">
                                <span
                                    class="border-2 border-red-600 text-red-600 font-bold px-2 py-1 text-xs -rotate-12 rounded">
                                    반려
                                </span>
                            </div>

                            <div v-else class="text-gray-300 text-xs">
                                {{ person.approverName }}
                            </div>
                        </div>

                        <div
                            class="border-t border-black text-[9px] h-[20px] flex items-center justify-center text-gray-600">
                            {{ person.processedAt ? formatDateOnly(person.processedAt) : '' }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t-2 border-black mt-2">
                <div class="flex border-b border-gray-400">
                    <div
                        class="w-24 bg-gray-100 font-bold text-center py-3 flex items-center justify-center border-r border-gray-400 text-sm">
                        제 &nbsp; &nbsp; 목
                    </div>
                    <div class="flex-1 px-4 py-3 text-sm font-semibold flex items-center">
                        {{ data.title }}
                    </div>
                </div>

                <div class="flex border-b border-gray-400 min-h-[300px]">
                    <div class="w-24 bg-gray-100 font-bold text-center py-3 border-r border-gray-400 text-sm">
                        내 &nbsp; &nbsp; 용
                    </div>
                    <div class="flex-1 px-4 py-4 text-sm whitespace-pre-wrap leading-relaxed">
                        {{ data.content }}
                    </div>
                </div>

                <div class="mt-8">
                    <div class="text-sm font-bold mb-2 flex items-center gap-2">
                        <span>◼ 상세 내역</span>
                        <span class="text-xs font-normal text-gray-500">(주문/생산/출고 관련 정보)</span>
                    </div>

                    <div class="border border-gray-400 p-10 text-center text-gray-400 text-sm bg-gray-50">
                        상세 품목 내역이 여기에 표시됩니다.
                    </div>
                </div>

                <div v-if="data.files && data.files.length > 0" class="mt-8">
                    <div class="text-sm font-bold mb-2">◼ 첨부 파일</div>
                    <ul class="list-disc pl-5 text-xs text-gray-700">
                        <li v-for="file in data.files" :key="file.name">
                            {{ file.name }} ({{ file.size }})
                        </li>
                    </ul>
                </div>
            </div>

            <div class="mt-20 text-center space-y-2 print:fixed print:bottom-10 print:left-0 print:w-full">
                <div class="text-sm text-gray-500">위와 같이 기안하오니 재가 바랍니다.</div>
                <div class="text-xl font-bold pt-5 tracking-widest">(주) 제 조 E R P</div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

const handlePrint = () => {
    window.print();
};

// 기안자 + 결재자 합쳐서 '결재선' 만들기
const approvalChain = computed(() => {
    // 1. 기안자
    const drafter = {
        approverName: props.data.drafterName,
        approverPositionCode: props.data.drafterPositionCode, // '대리' 등
        status: 'APPROVED', // 기안자는 무조건 승인 상태
        processedAt: props.data.draftedAt,
        isDrafter: true
    };

    // 2. 결재자들 (순서 정렬)
    const lines = [...(props.data.approvalLines || [])].sort((a, b) => a.sequence - b.sequence);

    return [drafter, ...lines];
});

// 날짜 포맷팅
const formatDate = (str) => str ? str.replace('T', ' ').slice(0, 16) : ''; // 2024-01-01 10:00
const formatDateOnly = (str) => str ? str.slice(0, 10) : ''; // 2024-01-01
const formatDateShort = (str) => str ? str.slice(5, 10).replace('-', '.') : ''; // 01.01

</script>

<style scoped>
/* 인쇄 시 배경 제거 및 크기 조정 */
@media print {
    body {
        background: white;
    }
}
</style>