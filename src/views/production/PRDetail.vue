<template>
    <div class="pr-detail-wrap">

        <!-- breadcrumb -->
        <div class="breadcrumb">
            <span class="crumb link" @click="goList">생산요청 관리</span>
            <span class="separator">›</span>
            <span class="crumb">{{ header.prCode || '생산요청상세' }}</span>
        </div>

        <!-- title row -->
        <div class="title-row">
            <div class="title-left">
                <div class="title">
                    {{ header.prCode }}
                    <span class="status-pill" :class="statusClass">
                        {{ statusLabel }}
                    </span>
                </div>

                <div class="submeta">
                    요청자: {{ header.drafterName || '-' }} |
                    담당자:
                    <span :class="{ danger: !header.managerName }">
                        {{ header.managerName || '담당자배정필요' }}
                    </span>
                </div>
            </div>

            <!-- stepper -->
            <div class="flex items-center gap-4">
                <div v-for="(step, idx) in steps" :key="idx" class="relative flex items-center gap-3">
                    <div class="flex flex-col items-center">
                        <div :class="getStepDotClass(idx)"
                            class="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white transition-all duration-300">
                            {{ idx + 1 }}
                        </div>
                        <span class="mt-1 text-[11px] font-medium text-gray-900">{{ step }}</span>
                        <span class="text-[10px] text-gray-400">
                            {{ idx === 0 ? header.requestedAt?.slice(0, 10) : (idx === 3 && header.status === 'PR_DONE'
                                ? header.updatedAt?.slice(0, 10) : '-') }}
                        </span>
                    </div>
                    <div v-if="idx !== steps.length - 1" class="mb-6 h-[2px] w-12 bg-gray-200"></div>
                </div>
            </div>
        </div>

        <!-- main white panel -->
        <div class="panel">

            <!-- tabs -->
            <div class="tabs">
                <button class="tab" :class="{ active: activeTab === 'PR' }" @click="activeTab = 'PR'">
                    생산요청 관리
                </button>
                <button class="tab" :class="{ active: activeTab === 'PLAN' }" @click="activeTab = 'PLAN'">
                    생산계획/작업지시 관리
                </button>
            </div>

            <div class="divider"></div>

            <div v-if="activeTab === 'PR'">

                <div class="info-cards">
                    <!-- left card -->
                    <div class="info-card">
                        <div class="card-title">기본 생산요청 정보</div>

                        <div class="kv">
                            <div class="k">생산요청번호</div>
                            <div class="v">{{ header.prCode }}</div>

                            <div class="k">총 요청 수량</div>
                            <div class="v">{{ formatNumber(header.totalQuantity) }}</div>

                            <div class="k">생산요청일시</div>
                            <div class="v">{{ header.requestedAt || '-' }}</div>

                            <div class="k">생산마감일시</div>
                            <div class="v">{{ header.dueAt || '-' }}</div>

                            <div class="k">요청 사유</div>
                            <div class="v reason-text">
                                {{ header.reason || '-' }}
                            </div>
                        </div>
                    </div>

                    <!-- right card -->
                    <div class="info-card">
                        <div class="card-title">관련 주문 정보</div>

                        <div class="kv">
                            <div class="k">주문번호</div>
                            <div class="v">{{ header.soCode }}</div>

                            <div class="k"></div>
                            <div class="v link" @click="goSO">
                                주문상세 바로가기 →
                            </div>
                        </div>
                    </div>
                </div>

                <!-- items -->
                <div class="section-row">
                    <div class="section-title">생산요청 품목 정보</div>
                    <button class="outline-btn small" @click="onPrint">
                        생산요청서 인쇄
                    </button>
                </div>

                <div class="items-table">
                    <div class="thead">
                        <div class="cell no">No</div>
                        <div class="cell code">품목코드</div>
                        <div class="cell name">품목명</div>
                        <div class="cell spec">규격</div>
                        <div class="cell unit">단위</div>
                        <div class="cell qty">생산요청수량</div>
                    </div>

                    <div v-for="(i, idx) in items" :key="i.prItemId" class="trow">
                        <div class="cell no">{{ idx + 1 }}</div>
                        <div class="cell code">{{ i.itemCode }}</div>
                        <div class="cell name">{{ i.itemName }}</div>
                        <div class="cell spec">{{ i.spec }}</div>
                        <div class="cell unit">{{ i.unit }}</div>
                        <div class="cell qty">{{ formatNumber(i.requestedQuantity) }}</div>
                    </div>

                    <div class="tfoot">
                        <div class="cell no"></div>
                        <div class="cell code"></div>
                        <div class="cell name"></div>
                        <div class="cell spec"></div>
                        <div class="cell unit"></div>
                        <div class="cell qty sum-value">
                            {{ formatNumber(header.totalQuantity) }}
                        </div>
                    </div>

                </div>

                <!-- approvals -->
                <div class="section mt-8">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-[#4C4CDD]">생산요청 결재 진행 상황</h3>
                    </div>

                    <div class="relative rounded-xl border border-gray-200 bg-white min-h-[300px] overflow-hidden">
                        <div v-if="isApprovalLoading"
                            class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                            <svg class="animate-spin h-10 w-10 text-[#4C4CDD]" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                                </path>
                            </svg>
                        </div>

                        <template v-if="approvalData">
                            <div
                                class="flex items-center justify-center gap-4 py-12 px-6 bg-white border-b border-gray-50">
                                <div class="flex flex-col items-center">
                                    <div
                                        class="flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5] text-sm font-bold text-[#238869] mb-3">
                                        기안
                                    </div>
                                    <div class="text-sm font-bold text-gray-900">{{ approvalData.drafterName }}</div>
                                    <div class="text-[11px] text-gray-500 text-center leading-tight">
                                        {{ getPositionLabel(approvalData.drafterPositionCode) }} / {{
                                            approvalData.drafterDepartment }}
                                    </div>
                                </div>

                                <div v-for="(appr, index) in approvalData.approvers" :key="appr.approvalLineId"
                                    class="flex items-center">
                                    <div :class="[
                                        'h-[3px] w-24 mx-4 mb-10 transition-colors duration-300',
                                        (index === 0 || approvalData.approvers[index - 1].status === 'ALS_APPR')
                                            ? 'bg-[#D1FAE5]' : 'bg-gray-200'
                                    ]"></div>

                                    <div class="flex flex-col items-center">
                                        <div :class="[
                                            'flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold mb-3 transition-all border-2',
                                            appr.status === 'ALS_APPR' ? 'bg-[#D1FAE5] text-[#238869] border-[#A7F3D0]' :
                                                appr.status === 'ALS_RVW' ? 'bg-[#DBEAFE] text-[#3223DD] border-[#BFDBFE]' :
                                                    'bg-gray-100 text-gray-400 border-gray-200'
                                        ]">
                                            {{ getLineTypeLabel(appr.lineType) }}
                                        </div>
                                        <div class="text-sm font-bold text-gray-900">{{ appr.approverName }}</div>
                                        <div class="text-[11px] text-gray-500 text-center leading-tight">
                                            {{ getPositionLabel(appr.approverPositionCode) }} / {{
                                                appr.approverDepartment }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="overflow-x-auto m-6">
                                <div class="border border-gray-200 rounded-lg overflow-hidden">
                                    <table class="w-full text-[13px] text-center table-fixed border-collapse">
                                        <thead class="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th class="w-20 px-2 py-3 text-gray-600 font-bold">구분</th>
                                                <th class="w-24 px-2 py-3 text-gray-600 font-bold">이름</th>
                                                <th class="w-32 px-2 py-3 text-gray-600 font-bold">직위/직책</th>
                                                <th class="w-40 px-2 py-3 text-gray-600 font-bold">소속</th>
                                                <th class="w-24 px-2 py-3 text-gray-600 font-bold">상태</th>
                                                <th class="w-44 px-2 py-3 text-gray-600 font-bold">결재일</th>
                                                <th class="w-64 px-4 py-3 text-gray-600 font-bold">비고</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            <tr class="hover:bg-gray-50 transition-colors text-center">
                                                <td class="py-4">기안</td>
                                                <td class="py-4 font-bold text-gray-900">{{ approvalData.drafterName }}
                                                </td>
                                                <td class="py-4">{{ getPositionLabel(approvalData.drafterPositionCode)
                                                }}</td>
                                                <td class="py-4">{{ approvalData.drafterDepartment }}</td>
                                                <td class="py-4 text-[#10B981] font-bold">승인</td>
                                                <td class="py-4">{{ approvalData.draftedAt }}</td>
                                                <td class="px-4 py-4 text-gray-400">-</td>
                                            </tr>
                                            <tr v-for="appr in approvalData.approvers" :key="appr.approvalLineId"
                                                class="hover:bg-gray-50 transition-colors text-center">
                                                <td class="py-4">{{ getLineTypeLabel(appr.lineType) }}</td>
                                                <td class="py-4 font-bold text-gray-900">{{ appr.approverName }}</td>
                                                <td class="py-4">{{ getPositionLabel(appr.approverPositionCode) }}</td>
                                                <td class="py-4">{{ appr.approverDepartment }}</td>
                                                <td :class="['py-4 font-bold', getLineStatusClass(appr.status)]">
                                                    {{ getLineStatusLabel(appr.status) }}
                                                </td>
                                                <td class="py-4">{{ appr.processedAt || '-' }}</td>
                                                <td class="px-4 py-4 truncate text-gray-400" :title="appr.note">
                                                    {{ appr.note || '-' }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="flex justify-end mt-4">
                                    <router-link :to="`/approval/${approvalData.approvalId}`"
                                        class="text-[13px] font-bold text-[#4C4CDD] hover:underline flex items-center gap-1">
                                        결재 바로가기 <span class="text-lg">→</span>
                                    </router-link>
                                </div>
                            </div>
                        </template>

                        <div v-else-if="!isApprovalLoading"
                            class="flex flex-col items-center justify-center py-16 px-4">
                            <img src="@/assets/새로이새로미.png" alt="No Approval" class="mb-4 h-24 w-auto opacity-40" />
                            <p class="text-gray-400 font-medium mb-6">진행 중인 결재 건이 없습니다.</p>
                        </div>
                    </div>
                </div>


                <div class="flex justify-end gap-1 pt-6 ">

                    <button v-if="showAssignManagerBtn" @click="openAssignmentModal"
                        class="px-6 py-2 text-sm font-bold rounded-lg bg-[#4C4CDD] text-white hover:bg-[#3b3bbb] shadow-md transition-all active:scale-95">
                        담당자 배정
                    </button>
                    <ManagerAssignmentModal v-if="isModalOpen" :departmentData="deptEmployees"
                        @close="isModalOpen = false" @confirm="onConfirmAssignment" />

                    <button v-if="showRequestApprovalBtn" @click="requestApproval"
                        class="px-6 py-2.5 rounded-lg bg-[#4C4CDD] text-sm font-bold text-white hover:bg-[#3b3bbb] shadow-md transition-all active:scale-95">
                        결재 상신하기
                    </button>
                </div>

            </div>

            <!-- 생산계획/작업지시 -->
            <div v-if="activeTab === 'PLAN'">
                <PlanTab :prId="prId" :items="items" @refresh="reloadDetail" />
            </div>


        </div>
    </div>

    <!-- 인쇄 미리보기 모달 -->
    <div v-if="showPrintModal" class="print-modal-backdrop">
        <div class="print-modal">
            <div class="print-modal-header">
                <span>생산요청서 미리보기</span>
                <button class="close-btn" @click="closePrint">✕</button>
            </div>

            <div class="print-modal-body">
                <div class="print-area">
                    <PRPrintDocument :header="header" :items="items" />
                </div>
            </div>

            <div class="print-modal-footer">
                <button class="outline-btn primary-fill" @click="handlePrint">
                    출력하기
                </button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPRDetail, assignPRManager } from '@/api/production/productionRequest'
import { getEmployees } from '@/api/employee/employee'
import ManagerAssignmentModal from './ManagerAssignmentModal.vue';
import PlanTab from './PlanTab.vue'
import PRPrintDocument from '@/components/production/PRPrintDocument.vue'
import { getApprovalSummary } from '@/api/approval/approval'; // API 임포트 확인

const route = useRoute()
const router = useRouter()
const prId = Number(route.params.prId)
const activeTab = ref('PR') // PR | PLAN
const isModalOpen = ref(false)
const deptEmployees = ref([])
const approvalLines = ref([])


const header = ref({
    prId: null,
    soId: null,
    prCode: '',
    soCode: '',
    status: '',
    productionProgress: '',
    requestedAt: '',
    dueAt: '',
    managerId: null,
    drafterName: '',
    drafterDepartment: '',
    drafterPosition: '',
    drafterRank: '',
    managerName: '',
    approvalId: null,
    approvalCode: '',
    totalQuantity: 0
})
const items = ref([])

const steps = ['요청/결재', '생산 계획', '생산 진행', '생산 완료'];

const currentStepIndex = computed(() => {
    const status = header.value.status;
    const progress = header.value.productionProgress;

    if (!status) return -1;

    if (['PR_TMP', 'PR_RVW', 'PR_APPR_PEND', 'PR_APPR_RJCT'].includes(status)) return 0;

    if (status === 'PR_PLANNED' || (status === 'PR_APPR_DONE' && (!progress || progress === 'PLANNING' || progress === 'PLANNED'))) {
        return 1;
    }

    if (status === 'PR_PRODUCING' || progress === 'PRODUCING') return 2;

    if (status === 'PR_DONE' || progress === 'COMPLETED') return 3;

    return -1;
});

const getStepDotClass = (idx) => {
    const cur = currentStepIndex.value;
    if (cur === -1) return 'bg-[#CBD5E0]';

    if (cur === 3) return 'bg-[#0FBA81]';

    if (idx < cur) return 'bg-[#0FBA81]';
    if (idx === cur) return 'bg-[#4C4CDD]';
    return 'bg-[#CBD5E0]';
};

const statusClass = computed(() => {
    const s = header.value.status;
    const styles = {
        'PR_TMP': 'bg-[#F3F4F6] text-[#374151]', // gray
        'PR_RVW': 'bg-[#FFFBEB] text-[#B4540A]', // yellow/amber
        'PR_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]', // green
        'PR_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]', // green
        'PR_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]', // red
        'PR_PLANNED': 'bg-[#F0F6FF] text-[#1E4ED8]', // blue
        'PR_PRODUCING': 'bg-[#F0F6FF] text-[#1E4ED8]', // blue
        'PR_DONE': 'bg-[#F3F4F6] text-[#000000]', // gray/black
        'PR_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'  // red
    };
    return styles[s] || 'bg-gray-100 text-gray-600';
});

const reloadDetail = async () => {
    const res = await getPRDetail(prId)
    header.value = res.header
    items.value = Array.isArray(res.items) ? res.items : []
    approvalLines.value = Array.isArray(res.approvalLines)
        ? res.approvalLines
        : []
}


const approvalData = ref(null);
const isApprovalLoading = ref(false);

// 결재 정보 가져오기
const fetchApprovalSummary = async () => {
    if (!header.value?.approvalCode) {
        approvalData.value = null;
        return;
    }

    isApprovalLoading.value = true;
    try {
        const data = await getApprovalSummary(header.value.approvalCode);
        approvalData.value = data;
    } catch (err) {
        console.error('결재 현황 로드 실패:', err);
        approvalData.value = null;
    } finally {
        isApprovalLoading.value = false;
    }
};

// 직위 라벨
const getPositionLabel = (code) => {
    const map = { JP_CEO: '사장', JP_DIR: '이사', JP_MGR: '부장', JP_SM: '과장', JP_AM: '대리', JP_STF: '사원' };
    return map[code] || code;
};

// 결재 타입 라벨
const getLineTypeLabel = (type) => {
    const map = { AT_APPR: '결재', AT_RVW: '협조', AT_REF: '참조', AT_RCPT: '수신' };
    return map[type] || '결재';
};

// 결재 상태 라벨 및 클래스
const getLineStatusLabel = (status) => {
    const map = { ALS_PEND: '대기', ALS_RVW: '검토중', ALS_APPR: '승인', ALS_RJCT: '반려' };
    return map[status] || status;
};

const getLineStatusClass = (status) => {
    if (status === 'ALS_APPR') return 'text-[#10B981]';
    if (status === 'ALS_RJCT') return 'text-red-600';
    if (status === 'ALS_RVW') return 'text-blue-600';
    return 'text-gray-400';
};

// onMounted 수정
onMounted(async () => {
    const res = await getPRDetail(prId);
    header.value = res.header;
    items.value = Array.isArray(res.items) ? res.items : [];

    // 헤더 정보 로드 후 결재 요약정보 별도 호출
    if (header.value.approvalCode) {
        fetchApprovalSummary();
    }
});

onMounted(async () => {
    const res = await getPRDetail(prId)
    header.value = res.header
    items.value = Array.isArray(res.items) ? res.items : []
    await reloadDetail()
})

const stepDateText = (idx) => {
    return '-'
}

const showAssignManagerBtn = computed(() => {
    return header.value.status === 'PR_RVW' && !header.value.managerId;
});

const showRequestApprovalBtn = computed(() => {
    return header.value.status === 'PR_RVW'
        && !!header.value.managerId
        && !header.value.approvalCode
        && !approvalData.value;
});


const requestApproval = () => {
    if (!header.value.managerId) {
        alert('담당자를 먼저 배정해주세요.')
        return
    }

    if (!confirm('결재를 요청하시겠습니까?')) return

    const routeData = router.resolve({
        path: '/approval/create',
        query: {
            refDocType: 'pr',
            refDocId: header.value.prId
        }
    })

    window.open(routeData.href, '_blank')
}


const openAssignmentModal = async () => {
    try {
        const res = await getEmployees('DEPT_PRO') // 생산팀 기준
        deptEmployees.value = Array.isArray(res[0]) ? res[0] : res
        isModalOpen.value = true
    } catch (e) {
        console.error(e)
        alert('담당자 목록을 불러오지 못했습니다.')
    }
}

const onConfirmAssignment = async (employee) => {
    try {
        await assignPRManager(prId, employee.id)
        alert(`담당자가 ${employee.name}(으)로 배정되었습니다.`)
        isModalOpen.value = false
        await reloadDetail()
    } catch (e) {
        console.error(e)
        alert('담당자 배정에 실패했습니다.')
    }
}


const formatNumber = (v) => (v != null ? Number(v).toLocaleString() : '-')

const goSO = () => {
    if (!header.value.soId) {
        alert('주문 ID가 없습니다.')
        return
    }

    const routeData = router.resolve({
        path: `/order/management/${header.value.soId}`
    })

    window.open(routeData.href, '_blank')
}

const goList = () => {
    router.push('/production/requests')
}

const showPrintModal = ref(false)

const onPrint = () => {
    showPrintModal.value = true
}

const handlePrint = () => {
    window.print();
    showPrintModal.value = false
};

const closePrint = () => {
    showPrintModal.value = false
}

</script>

<style scoped>
.pr-detail-wrap {
    background: #F9FAFB;
    padding: 24px;
    min-height: calc(100vh - 70px);
}

/* breadcrumb */
.breadcrumb {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
}

.breadcrumb .link {
    color: #4C4CDD;
    cursor: pointer;
    font-weight: 500;
}

.breadcrumb .link:hover {
    text-decoration: underline;
}

.breadcrumb .separator {
    margin: 0 6px;
    color: #9ca3af;
}

/* 타이틀 라인 */
.title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 18px;
}

.title {
    font-size: 25px;
    font-weight: 700;
    color: #000;
    display: flex;
    align-items: center;
    gap: 10px;
}

.submeta {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #898989;
}

.submeta .danger {
    color: #FF3B30;
}

/* 상태 pill */
.status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 13px;
    font-weight: 700;
}

.status-pill.green {
    background: #ECFEF6;
    color: #278465;
}

.status-pill.red {
    background: #FEE2E2;
    color: #991B1B;
}

.status-pill.yellow {
    background: #FEF3C7;
    color: #92400E;
}

.status-pill.purple {
    background: #EDE9FE;
    color: #5B21B6;
}

.status-pill.blue {
    background: #E0F2FE;
    color: #0369A1;
}

.status-pill.gray {
    background: #F3F4F6;
    color: #374151;
}

/* 메인 흰 패널 */
.panel {
    background: #fff;
    border-radius: 10px;
    padding: 16px 18px 22px;
}

/* 탭 라인 + 버튼 */
.tab-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 6px 10px;
}

.tabs {
    display: flex;
    gap: 18px;
    align-items: center;
}

.tab {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 8px 4px;
    color: #000;
    font-weight: 400;
    position: relative;
}

.tab.active {
    font-weight: 700;
}

.tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0px;
    width: 100%;
    height: 3px;
    background: #4C4CDD;
    z-index: 2;
}

.divider {
    position: relative;
    z-index: 1;
    height: 1px;
    background: #D9D9D9;
    margin-bottom: 18px;
}

/* 공통 아웃라인 버튼 */
.outline-btn {
    border: 1px solid #4C4CDD;
    color: #4C4CDD;
    background: #fff;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 10px;
    cursor: pointer;
}

.outline-btn.small {
    padding: 8px 10px;
}

/* 섹션 타이틀 (main color) */
.section-title {
    color: #4C4CDD;
    font-size: 16px;
    font-weight: 700;
    margin: 10px 0 12px;
}

.section-footer {
    margin-top: 15px;
    text-align: right;
}

/* 기본정보 카드 2개 (Rectangle 679/680) */
.info-cards {
    display: grid;
    grid-template-columns: 426px 426px;
    gap: 32px;
    margin-bottom: 18px;
}

.info-card {
    border: 1px solid #D9D9D9;
    border-radius: 10px;
    padding: 12px 16px;
    min-height: 213px;
    background: #fff;
}

.card-title {
    color: #4C4CDD;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
}

.kv {
    display: grid;
    grid-template-columns: 140px 1fr;
    row-gap: 14px;
    align-items: center;
}

.k {
    color: #898989;
    font-size: 13px;
    font-weight: 700;
}

.v {
    color: #000;
    font-size: 14px;
    font-weight: 400;
}

.v.link {
    justify-self: end;
    color: #4C4CDD;
    font-weight: 700;
    cursor: pointer;
}

/* 품목 섹션 타이틀 row */
.section-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 품목 테이블 */
.thead,
.trow,
.tfoot {
    display: grid;
    grid-template-columns:
        60px minmax(120px, 1.2fr) minmax(200px, 2fr) minmax(140px, 1.2fr) minmax(80px, 0.6fr) minmax(120px, 1fr);
}

.items-table {
    width: 100%;
    max-width: none;
    overflow-x: auto;
}

.thead,
.trow,
.tfoot {
    min-width: 900px;
}

.items-table {
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    border: 1px solid #D9D9D9;
    margin-top: 10px;
}

.thead {
    display: grid;
    background: #F9FAFB;
    border-bottom: 1px solid #D9D9D9;
    height: 47px;
    align-items: center;
}

.trow {
    display: grid;
    background: #fff;
    border-bottom: 1px solid #D9D9D9;
    height: 47px;
    align-items: center;
}

.trow:last-of-type {
    border-bottom: none;
}

.cell {
    font-size: 13px;
    font-weight: 400;
    color: #000;
    padding: 0 14px;
    text-align: left;
}

.cell.no {
    width: 100%;
}

.cell.qty {
    text-align: left;
}

.tfoot {
    display: grid;
    background: #F9FAFB;
    height: 47px;
    align-items: center;
    border-top: 1px solid #D9D9D9;
}

.sum-value {
    font-size: 13px;
    font-weight: 400;
    color: #000;
}

.ghost {
    font-size: 15px;
    font-weight: 400;
    color: #7B808D;
}

.dot {
    background: #CBD5E0;
}

.dot.current {
    background: #4C4CDD;
}

.dot.done {
    background: #0FBA81;
}

.print-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.print-modal {
    background: #fff;
    width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.print-modal-body {
    overflow: auto;
    padding: 16px;
}

.print-modal-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
}

.print-modal-footer {
    padding: 12px 16px;
    border-top: 1px solid #ddd;
    border-bottom: none;
    display: flex;
    justify-content: flex-end;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
}

/* 결재 진행 상황 전체 박스 */
.approval-progress {
    background: #F9FAFB;
    border-radius: 10px;
    padding: 24px;
    margin-top: 10px;
}

/* 시각적 결재 플로우 (원형) */
.approval-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 30px;
}

.flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 80px;
}

.flow-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #D9D9D9;
    color: #898989;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
}

.flow-circle.completed {
    background: #ECFEF6;
    border-color: #0FBA81;
    color: #0FBA81;
}

.flow-circle.active {
    background: #EDE9FE;
    border-color: #4C4CDD;
    color: #4C4CDD;
}

.flow-arrow {
    color: #D9D9D9;
    font-weight: bold;
    margin-bottom: 20px;
}

/* 결재 바로가기 링크 */
.view-approval-link {
    font-size: 13px;
    color: #4C4CDD;
    text-decoration: none;
    font-weight: bold;
}
</style>

<style>
@media print {
    @page {
        size: A4;
        margin: 0;
    }

    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    html,
    body {
        width: 210mm;
        height: 297mm;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }

    .pr-detail-wrap,
    .title-row,
    .breadcrumb,
    .stepper,
    .tabs,
    .divider,
    .print-modal-header,
    .print-modal-footer {
        display: none !important;
    }

    .print-modal-backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: #fff !important;
        z-index: 9999 !important;
    }

    .print-modal {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
    }

    .print-modal-body {
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        /* 스크롤바가 페이지를 생성하는 것 방지 */
    }

    .print-area {
        width: 210mm;
        height: 297mm;
    }
}
</style>