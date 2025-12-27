<template>
    <!-- 모달 오버레이 -->
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" v-if="isOpen">

        <!-- 모달 윈도우 -->
        <div class="bg-[#ffffff] rounded shadow-xl w-[1100px] h-[640px] flex flex-col">

            <!-- 1. 헤더 -->
            <div class="h-12.5 border-b border-[#efefef] flex justify-between px-5 items-center shrink-0">
                <div class="flex items-center gap-2">
                    <div class="w-[4px] h-[16px] bg-[#4C4CDD]"></div>
                    <h2 class="font-bold">결재선 지정</h2>
                </div>
                <button @click="closeModal"
                    class="text-gray-500 rounded cursor-pointer bg-[#efefef] p-1 flex items-center justify-center hover:shadow-sm">
                    <svg fill="#4C4CDD" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path
                            d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
                    </svg>
                </button>
            </div>

            <!-- 바디 -->
            <div class="bg-[#f9fafb] grow p-5 flex gap-5 overflow-hidden min-h-0">
                <!-- 조직도 / 나의 결재선 -->
                <div class="border border-[#efefef] flex-2 overflow-hidden min-h-0">
                    <OrganizationPanel :organizationTree="organizationTree"
                        :isOrganizationTreeLoading="isOrganizationTreeLoading"
                        :approvalLineTemplates="approvalLineTemplates" :isTemplateLoading="isTemplateLoading"
                        @selectEmployee="onSelectEmployee" @selectApprovalLineTemplate="onSelectApprovalLineTemplate" />
                </div>

                <div class="w-16 shrink-0 items-center">
                    <div class="h-full flex flex-col items-center justify-center">
                        <!-- @click="addToTarget" -->
                        <button :disabled="!selectedEmployee"
                            class="w-10 h-10 bg-white border border-[#efefef] rounded flex items-center justify-center text-[#4C4CDD]
                         enabled:hover:bg-[#efefef] enabled:hover:border-[#4C4CDD]  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M0 3.795l2.995-2.98 11.132 11.185-11.132 11.186-2.995-2.981 8.167-8.205-8.167-8.205zm18.04 8.205l-8.167 8.205 2.995 2.98 11.132-11.185-11.132-11.186-2.995 2.98 8.167 8.206z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="border border-black flex-4">
                    결재선 목록
                </div>
            </div>




            <!-- 푸터 -->
            <div class="px-5 flex flex-col gap-1 border border-gray-300 shrink-0">
                <!-- 기안자 정보 -->

                <!-- 결재선 전체 요약 -->

                <div class="h-12.5 flex justify-between items-center">
                    <div class="text-[13px] text-gray-500">
                        <span class="text-[red] font-bold">*</span> 결재선은 <span class="font-bold text-gray-800">최대
                            10명</span>까지 지정
                        가능합니다.
                    </div>
                    <div class="flex gap-2">
                        <button @click="closeModal"
                            class="h-7.5 px-5 rounded-sm border border-[#efefef] hover:bg-gray-50 hover:shadow-sm text-[13px] font-bold cursor-pointer">
                            취소
                        </button>
                        <button @click="applyLines"
                            class="h-7.5 px-5 rounded-sm bg-[#4C4CDD] text-white hover:bg-[#3b3bcf] hover:shadow-sm text-[13px] font-bold flex items-center cursor-pointer">
                            적용
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useApprovalLineStore } from '@/stores/approvalLine';
import { storeToRefs } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { getEmployees } from '@/api/employee.js';
import { getApprovalTemplates } from '@/api/approval.js';
import OrganizationPanel from './OrganizationPanel.vue';
import ApprovalLinePanel from './ApprovalLinePanel.vue';

const approvalLineStore = useApprovalLineStore();
const { isOpen, isDirty } = storeToRefs(approvalLineStore);

const isOrganizationTreeLoading = ref(false);              // 조직도 로딩 상태
const isTemplateLoading = ref(false);                       // 템플릿 로딩 상태
const organizationTree = ref([]);                            // 조직도 데이터
const approvalLineTemplates = ref([]);                 // 결재선 템플릿 데이터

const selectedEmployee = ref(null);                             // 선택된 직원
const selectedApprovalLineTemplate = ref(null);                  // 선택된 결재선 템플릿

const tabs = [
    { id: 'approval', label: '결재자' },
    { id: 'recipient', label: '수신자' },
    { id: 'reference', label: '참조자' }
];

const approvalLines = ref({
    approval: [],
    recipient: [],
    reference: []
});

onMounted(() => {
    // 조직도 조회
    fetchEmployeeData();

    // 결재선 템플릿 조회
    fetchApprovalTemplates();
});

const fetchEmployeeData = async () => {
    isOrganizationTreeLoading.value = true;

    try {
        const data = await getEmployees();

        organizationTree.value = data.map(response => ({
            id: response.id,
            name: response.deptName,
            code: response.deptCode,
            isOpen: true, // 최상위 부서는 펼침 기본값
            teams: (response.teams || []).map(team => ({
                id: team.id,
                name: team.deptName,
                code: team.deptCode,
                isOpen: false, // 하위 팀은 닫힘 기본값
                employees: (team.employees || []).map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    deptName: emp.deptName,
                    rank: emp.rankCode,
                    position: emp.positionCode
                }))
            }))
        }));
    } catch (error) {
        console.error('직원 조회 실패:', error);
    } finally {
        isOrganizationTreeLoading.value = false;
    }
};

const fetchApprovalTemplates = async () => {
    isTemplateLoading.value = true;

    try {
        const data = await getApprovalTemplates();

        approvalLineTemplates.value = data.map(tpl => {
            const approval = (tpl.approvalLines || []).map(line => ({
                id: line.approvalTemplateLineId,
                type: line.lineType,
                sequence: line.sequence,
                note: line.note || '',
                user: {
                    id: line.approverId,
                    name: line.approverName,
                    deptName: line.approverDepartmentName,
                    rank: line.approverRankCode,
                    position: line.approverPositionCode
                }
            }));

            const recipient = (tpl.recipientLines || []).map(line => ({
                id: line.approvalTemplateLineId,
                type: line.lineType,
                sequence: line.sequence,
                note: line.note || '',
                user: {
                    id: line.approverId,
                    name: line.approverName,
                    deptName: line.approverDepartmentName,
                    rank: line.approverRankCode,
                    position: line.approverPositionCode
                }
            }));

            const reference = (tpl.referenceLines || []).map(line => ({
                id: line.approvalTemplateLineId,
                type: line.lineType,
                sequence: line.sequence,
                note: line.note || '',
                user: {
                    id: line.approverId,
                    name: line.approverName,
                    rank: line.approverRankCode,
                    position: line.approverPositionCode
                }
            }));

            return {
                id: tpl.id,
                name: tpl.name,
                description: tpl.description,
                data: {
                    approval,
                    recipient,
                    reference
                }
            };
        });
    } catch (error) {
        console.error('결재 템플릿 조회 실패:', error);
    } finally {
        isTemplateLoading.value = false;
    }
};

const onSelectEmployee = (employee) => {
    selectedEmployee.value = employee;
};

const onSelectApprovalLineTemplate = (template) => {
    if (confirm(`'${template.name}' 템플릿을 불러오시겠습니까?`)) {
        //     const data = JSON.parse(JSON.stringify(template.data));
        //     selectedLists.approval = data.approval || [];
        //     selectedLists.recipient = data.recipient || [];
        //     selectedLists.reference = data.reference || [];

        //     // 불러온 후 조직도 탭으로 돌아가거나 유지
    }
};

const closeModal = () => {
    if (isDirty.value) {
        if (!confirm("변경사항이 저장되지 않았습니다. 그래도 닫으시겠습니까?")) {
            return;
        }
    }
    approvalLineStore.close();
}

const applyLines = () => {
    approvalLineStore.close();
}



</script>

<style scoped></style>