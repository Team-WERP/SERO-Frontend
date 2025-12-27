<template>
    <div class="flex flex-col h-full bg-white">
        <div class="flex border-b border-[#efefef] text-[13px] font-bold">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                class="flex-1 py-2 text-center border-b-2" :class="activeTab === tab.id
                    ? 'border-[#4C4CDD] text-[#4C4CDD]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'">
                {{ tab.label }}
            </button>
        </div>

        <div v-if="activeTab === 'org'" class="p-3 border-b border-[#efefef]">
            <div class="flex items-center bg-[#F8F9FA] border border-[#efefef] rounded px-2">
                <svg fill="#99a1af" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                    <path
                        d="M23.809 21.646l-6.205-6.205c1.167-1.605 1.857-3.579 1.857-5.711 0-5.365-4.365-9.73-9.731-9.73-5.365 0-9.73 4.365-9.73 9.73 0 5.366 4.365 9.73 9.73 9.73 2.034 0 3.923-.627 5.487-1.698l6.238 6.238 2.354-2.354zm-20.955-11.916c0-3.792 3.085-6.877 6.877-6.877s6.877 3.085 6.877 6.877-3.085 6.877-6.877 6.877c-3.793 0-6.877-3.085-6.877-6.877z" />
                </svg>
                <input :value="searchKeyword" @input="e => searchKeyword = e.target.value" type="text"
                    placeholder="부서, 사원명 검색" class="flex-1 ml-2 py-2 text-[12px] focus:outline-none transition-colors">
            </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-white custom-scrollbar p-2 min-h-0">
            <template v-if="activeTab === 'org'">
                <div v-if="isOrganizationTreeLoading"
                    class="flex flex-col items-center justify-center h-40 text-gray-400 text-[12px]">
                    <div class="w-6 h-6 border-2 border-gray-200 border-t-[#4C4CDD] rounded-full animate-spin mb-2">
                    </div>
                    데이터를 불러오는 중...
                </div>

                <div v-else-if="filteredTree.length === 0" class="text-[12px] text-gray-400 text-center py-10">
                    검색 결과가 없습니다.
                </div>

                <div v-else v-for="dept in filteredTree" :key="dept.id">
                    <div @click="toggleNode(dept)"
                        class="flex items-center px-2 py-1.5 cursor-pointer hover:bg-[#F0F4FF] select-none text-[13px] text-gray-700 rounded-sm">
                        <span class="font-bold truncate">{{ dept.name }}</span>
                    </div>

                    <div v-show="dept.isOpen" class="ml-2 pl-2 border-l border-gray-200 border-dotted">

                        <div v-for="team in dept.teams" :key="team.id">
                            <div @click="toggleNode(team)"
                                class="flex items-center px-2 py-1 cursor-pointer hover:bg-[#F0F4FF] select-none text-[12px] text-gray-700 rounded-sm">
                                <span class="font-medium truncate">{{ team.name }}</span>
                            </div>

                            <div v-show="team.isOpen" class="ml-4 border-l border-gray-200 pl-1 border-dotted">
                                <div v-for="emp in team.employees" :key="emp.id" @click="selectUser(emp)" :class="[
                                    'flex items-center px-2 py-1.5 cursor-pointer text-[12px] border border-transparent rounded-sm mb-0.5',
                                    localSelectedEmployeeId === emp.id
                                        ? 'bg-[#E5E9FF] border-[#BCC5FF] text-[#4C4CDD]'
                                        : 'hover:bg-gray-50 text-gray-600'
                                ]">
                                    <i class="ph ph-user mr-1.5 text-xs"
                                        :class="localSelectedEmployeeId === emp.id ? 'text-[#4C4CDD]' : 'text-gray-400'"></i>
                                    <span class="flex-1 truncate font-medium">{{ emp.name }}</span>
                                    <span class="text-gray-400 text-[11px] ml-1">{{ getPositionName(emp) }} ·
                                        {{ getRankName(emp) }}
                                    </span>
                                </div>

                                <div v-if="(!team.employees || team.employees.length === 0)"
                                    class="text-[11px] text-gray-300 px-2 py-1">
                                    (팀원 없음)
                                </div>
                            </div>
                        </div>

                        <div v-for="emp in dept.employees" :key="emp.id" @click="selectUser(emp)" :class="[
                            'flex items-center px-2 py-1.5 cursor-pointer text-[12px] border border-transparent rounded-sm ml-2',
                            localSelectedEmployeeId === emp.id
                                ? 'bg-[#E5E9FF] border-[#BCC5FF] text-[#4C4CDD]'
                                : 'hover:bg-gray-50 text-gray-600'
                        ]">
                            <i class="ph ph-user mr-1.5 text-xs"
                                :class="localSelectedEmployeeId === emp.id ? 'text-[#4C4CDD]' : 'text-gray-400'"></i>
                            <span class="flex-1 truncate">{{ emp.name }}</span>
                            <span class="text-gray-400 text-[11px] ml-1">{{ emp.position || emp.rank }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div v-if="isTemplateLoading"
                    class="flex flex-col items-center justify-center h-40 text-gray-400 text-[12px]">
                    <div class="w-6 h-6 border-2 border-gray-200 border-t-[#4C4CDD] rounded-full animate-spin mb-2">
                    </div>
                    템플릿을 불러오는 중...
                </div>

                <div v-else-if="approvalLineTemplates.length === 0"
                    class="flex flex-col items-center justify-center h-60 text-gray-400 text-[12px]">
                    <i class="ph ph-tray text-3xl mb-2 text-gray-300"></i>
                    저장된 결재선이 없습니다.
                </div>

                <div v-else class="p-2">
                    <div v-for="(tpl, idx) in approvalLineTemplates" :key="idx" @click="selectTemplate(tpl)" class="bg-white border rounded p-3 mb-2 cursor-pointer transition-all group relative
                        border-gray-200 hover:border-[#4C4CDD] hover:shadow-sm">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-[13px] font-bold text-gray-700 group-hover:text-[#4C4CDD]">
                                {{ tpl.name }}
                            </span>
                            <button @click.stop="deleteTpl(tpl)"
                                class="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                title="삭제">
                                <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                    viewBox="0 0 24 24">
                                    <path
                                        d="M19 24h-14c-1.104 0-2-.896-2-2v-17h-1v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2h-1v17c0 1.104-.896 2-2 2zm0-19h-14v16.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-16.5zm-9 4c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm-2-7h-4v1h4v-1z" />
                                </svg>
                            </button>
                        </div>

                        <div class="text-[11px] text-gray-500 flex gap-2">
                            <span class="bg-red-50 px-1.5 py-0.5 rounded">결재·협조 {{ (tpl.data.approval || []).length
                                }}</span>
                            <span class="bg-blue-50 px-1.5 py-0.5 rounded">수신 {{ (tpl.data.recipient || []).length
                                }}</span>
                            <span class="bg-gray-50 px-1.5 py-0.5 rounded">참조 {{ (tpl.data.reference || []).length
                                }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { EMPLOYEE_RANK, EMPLOYEE_POSITION } from '@/constants/approval.js';

const props = defineProps({
    organizationTree: {
        type: Array,
        required: true
    },
    isOrganizationTreeLoading: {
        type: Boolean,
        default: false
    },
    approvalLineTemplates: {
        type: Array,
        required: true
    },
    isTemplateLoading: {
        type: Boolean,
        default: false
    },
});

const emit = defineEmits(['selectEmployee', 'selectApprovalLineTemplate', 'deleteTemplate']);

// --- 상태 ---
const activeTab = ref('org');               // 'org' | 'template'

const localSelectedEmployeeId = ref(null); // 시각적 선택 표시용

const searchKeyword = ref('');            // 조직도 검색어
const debouncedKeyword = ref('');        // 디바운스된 검색어 (필터링에 실제로 사용할 값)

const tabs = [
    { id: 'org', label: '조직도' },
    { id: 'template', label: '나의 결재선' }
];

let debounceTimeout = null;

watch(searchKeyword, (newVal) => {
    clearTimeout(debounceTimeout);  // 이전 타이머 초기화

    debounceTimeout = setTimeout(() => {
        debouncedKeyword.value = newVal;    // 타이핑 멈춤 후 값 적용
    }, 500); // 0.5s 디바운스
});

const matchKeyword = (text, keyword) => {
    return text?.toLowerCase().includes(keyword);
}

const filterTeam = (team, keyword) => {
    const matchedEmployees = team.employees.filter(emp =>
        matchKeyword(emp.name, keyword)
    );

    if (matchKeyword(team.name, keyword) || matchedEmployees.length > 0) {
        return {
            ...team,
            isOpen: true,
            employees: matchedEmployees.length > 0 ? matchedEmployees : team.employees
        };
    }

    return null;
};

const filterDept = (dept, keyword) => {
    const teams = dept.teams
        .map(team => filterTeam(team, keyword))
        .filter(Boolean);

    const deptEmployees = (dept.employees || []).filter(emp =>
        matchKeyword(emp.name, keyword)
    );

    if (matchKeyword(dept.name, keyword) || teams.length > 0 || deptEmployees.length > 0) {
        return {
            ...dept,
            isOpen: true,
            teams,
            employees: deptEmployees
        };
    }

    return null;
};

// 조직도 필터링
const filteredTree = computed(() => {
    console.log(searchKeyword.value);
    if (!debouncedKeyword.value) return props.organizationTree;

    const keyword = debouncedKeyword.value.toLowerCase();

    return props.organizationTree
        .map(dept => filterDept(dept, keyword))
        .filter(Boolean);
});

// 트리 노드 토글
const toggleNode = (node) => {
    node.isOpen = !node.isOpen;
};

// 직원 선택
const selectUser = (employee) => {
    localSelectedEmployeeId.value = employee.id;
    emit('selectEmployee', employee);
};

// 템플릿 선택
const selectTemplate = (tpl) => {
    emit('selectApprovalLineTemplate', tpl);
};

// 템플릿 삭제
const deleteTpl = (tpl) => {
    if (confirm(`[${tpl.name}] 결재선을 삭제하시겠습니까?`)) {
        emit('deleteTemplate', tpl);
    }
}

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