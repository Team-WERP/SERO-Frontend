<template>
    <div class="flex flex-col h-full bg-white rounded-sm border border-[#efefef]">
        <div class="flex px-2 pt-2 bg-[#F8F9FA] border-b border-[#efefef] gap-1">
            <button v-for="tab in tabs" :key="tab.id" @click="changeTab(tab.id)"
                class="flex-1 py-2 text-[12px] font-bold text-center rounded-t-md border-t border-l border-r transition-colors relative top-[1px]"
                :class="currentTab === tab.id
                    ? 'bg-white border-[#efefef] border-b-white text-[#4C4CDD] z-10'
                    : 'bg-[#F1F3F5] border-transparent text-gray-500 hover:bg-gray-200'">
                {{ tab.label }}
                <span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full"
                    :class="currentTab === tab.id ? 'bg-[#E5E9FF] text-[#4C4CDD]' : 'bg-gray-300 text-white'">
                    {{ lines[tab.id].length }}
                </span>
            </button>
        </div>

        <div class="h-8 flex items-center justify-end px-4 border-b border-[#efefef] bg-white shrink-0">
            <button @click="resetTab"
                class="flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="현재 탭 목록 초기화">
                초기화
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-white">
            <table class="w-full border-collapse table-fixed">
                <thead class="bg-[#F8F9FA] text-[12px] text-gray-500 font-medium sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th v-if="currentTab === 'approval'" class="w-12 py-2 border-b border-[#efefef]">순서</th>

                        <th class="w-25 py-2 border-b border-[#efefef]">
                            {{ currentTab === 'approval' ? '타입' : '구분' }}
                        </th>

                        <th class="py-2 w-22 border-b border-[#efefef]">성명</th>
                        <th class="py-2 border-b border-[#efefef]">부서</th>
                        <th class="py-2 px-3 border-b border-[#efefef]">직급/직책</th>

                        <th class="w-22 py-2 border-b border-[#efefef]">관리</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="lines[currentTab].length === 0">
                        <td :colspan="currentTab === 'approval' ? 6 : 5">
                            <div class="h-80 text-gray-400 text-[12px] flex flex-col justify-center items-center">
                                <img :src="IMAGE" class="w-20 opacity-50" />
                                지정된 {{ getTabLabel(currentTab) }}가 없습니다.
                            </div>

                        </td>
                    </tr>

                    <tr v-for="(item, index) in lines[currentTab]" :key="item.id"
                        class="border-b border-[#f1f1f1] hover:bg-gray-50 transition-colors text-[13px]">
                        <td v-if="currentTab === 'approval'" class="text-center font-bold text-gray-600">
                            {{ index + 1 }}
                        </td>

                        <td class="text-center px-1 py-2">
                            <template v-if="currentTab === 'approval'">
                                <select v-model="item.lineType"
                                    class="w-full text-[12px] border border-gray-200 rounded px-1 py-1 focus:border-[#4C4CDD] focus:outline-none bg-white">
                                    <option value="AT_APPR">결재</option>
                                    <option value="AT_RVW">협조</option>
                                </select>
                            </template>
                            <template v-else>
                                <span class="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                    {{ getTabLabel(currentTab) }}
                                </span>
                            </template>
                        </td>

                        <td class="text-center">
                            {{ item.name }}
                        </td>

                        <td class="text-center">
                            {{ item.deptName }}

                        </td>

                        <td class="text-center">
                            {{ getPositionName(item) }} · {{ getRankName(item) }}
                        </td>

                        <td class="text-center py-2">
                            <div class="flex justify-center gap-1">
                                <template v-if="currentTab === 'approval'">
                                    <button @click="moveItem(index, -1)" :disabled="index === 0"
                                        class="text-gray-400 hover:text-[#4C4CDD] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
                                        <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M12 4l-8 8h6v8h4v-8h6z" />
                                        </svg>
                                    </button>
                                    <button @click="moveItem(index, 1)"
                                        :disabled="index === lines[currentTab].length - 1"
                                        class="text-gray-400 hover:text-[#4C4CDD] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
                                        <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M12 20l8-8h-6v-8h-4v8h-6z" />
                                        </svg>
                                    </button>
                                </template>
                                <button @click="removeItem(index)"
                                    class="text-gray-400 hover:text-red-500 ml-1 cursor-pointer">
                                    <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
                                        <path
                                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="border-t border-[#efefef] p-2 flex justify-end">
            <button @click="closeModal"
                class=" h-7 px-4 rounded-sm border border-[#4C4CDD] text-[#4C4CDD] font-medium hover:bg-gray-50 hover:shadow-sm text-[12px] cursor-pointer">
                나의 결재선으로 등록
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import IMAGE from '@/assets/새로이새로미.png';
import { EMPLOYEE_RANK, EMPLOYEE_POSITION } from '@/constants/approval.js';

const props = defineProps({
    lines: {
        type: Object,
        required: true
        // 구조: { approval: [], recipient: [], reference: [] }
    },
    activeTab: {
        type: String,
        default: 'approval'
    }
});

const emit = defineEmits(['update:activeTab', 'remove', 'move']);

const tabs = [
    { id: 'approval', label: '결재자' },
    { id: 'recipient', label: '수신자' },
    { id: 'reference', label: '참조자' }
];

// 탭 변경 시 부모에게 알림 (v-model:activeTab 동작)
const currentTab = computed({
    get: () => props.activeTab,
    set: (val) => emit('update:activeTab', val)
});

const changeTab = (id) => {
    currentTab.value = id;
};

const getTabLabel = (id) => tabs.find(t => t.id === id)?.label;

const removeItem = (index) => {
    emit('remove', { tab: currentTab.value, index });
};

const moveItem = (index, direction) => {
    // direction: -1 (위), 1 (아래)
    emit('move', { tab: currentTab.value, index, direction });
};

const getRankName = (emp) => {
    if (emp.rank && EMPLOYEE_RANK.CODE[emp.rank]) {
        return EMPLOYEE_RANK.CODE[emp.rank];
    }

    return '';
};

const getPositionName = (emp) => {
    if (emp.position && EMPLOYEE_POSITION.CODE[emp.position]) {
        return EMPLOYEE_POSITION.CODE[emp.position];
    }

    return '';
};
</script>

<style scoped></style>