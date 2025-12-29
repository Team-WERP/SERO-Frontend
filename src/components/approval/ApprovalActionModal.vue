<template>
    <div class="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 transition-opacity">
        <div class="bg-white rounded shadow-xl w-[600px] flex flex-col overflow-hidden transform transition-all">
            <div class="h-12.5 border-b border-[#efefef] flex justify-between px-5 items-center shrink-0 bg-white">
                <div class="flex items-center gap-2">
                    <div class="w-[4px] h-[16px] bg-[#4C4CDD]"></div>
                    <h2 class="font-bold">결재 처리</h2>
                </div>
                <button @click="$emit('close')"
                    class="text-gray-500 rounded cursor-pointer p-1 flex items-center justify-center">
                    <svg fill="#808080" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                        <path
                            d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
                    </svg>
                </button>
            </div>

            <div class="bg-gray-50/50 p-6 flex flex-col gap-6">

                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div class="grid grid-cols-[100px_1fr] text-[13px]">
                        <div
                            class="bg-gray-50 px-4 py-3 text-gray-500 font-medium border-b border-r border-gray-100 flex items-center">
                            문서 제목
                        </div>
                        <div class="px-4 py-3 text-gray-800 font-bold border-b border-gray-100 flex items-center">
                            {{ data.title }}
                        </div>
                        <div
                            class="bg-gray-50 px-4 py-3 text-gray-500 font-medium border-r border-gray-100 flex items-center">
                            기안자
                        </div>
                        <div class="px-4 py-3 text-gray-800 flex items-center gap-1.5">
                            <span>{{ data.drafterName }} <span class="text-gray-700 text-[10px]">{{
                                getRankName(data.drafterRankCode)
                                    }} · {{
                                        getPositionName(data.drafterPositionCode) }}</span></span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-end">
                        <label class="text-[13px] font-bold text-gray-700 flex items-center gap-1">
                            결재 의견 / 반려 사유
                            <span class="text-xs font-normal text-red-500 ml-1">* 반려 시 필수 입력</span>
                        </label>
                        <span class="text-xs text-gray-400">{{ note.length }} / 500자</span>
                    </div>

                    <div class="relative group">
                        <textarea v-model="note" rows="5" maxlength="500" class="w-full border border-gray-300 rounded-lg p-3 text-[14px] leading-relaxed resize-none 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4C4CDD]/20 focus:border-[#4C4CDD]
                     transition-all bg-white group-hover:border-gray-400"
                            placeholder="결재 승인에 대한 의견이나 반려 사유를 입력해주세요."></textarea>
                    </div>
                </div>
            </div>

            <div class="h-12.5 px-6 bg-white border-t border-gray-200 flex justify-end items-center">
                <div class="flex items-center gap-3">
                    <button @click="onReject"
                        class="cursor-pointer h-8 px-5 rounded bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-[14px] font-bold transition-all shadow-sm flex items-center gap-1.5">
                        반려
                    </button>

                    <button @click="onApprove"
                        class="cursor-pointer h-8 px-5 rounded bg-[#4C4CDD] text-white hover:bg-[#3d3dbf] hover:shadow-md text-[14px] font-bold transition-all shadow-sm flex items-center gap-1.5">
                        승인
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { EMPLOYEE_RANK, EMPLOYEE_POSITION } from '@/constants/approval.js';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['approve', 'reject', 'close']);
const note = ref('');

const onApprove = () => {
    emit('approve', note.value);
};

const onReject = () => {
    if (!note.value.trim()) {
        alert('반려 처리를 위해 반려 사유를 입력해주세요.');
        return;
    }
    emit('reject', note.value);
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
</script>