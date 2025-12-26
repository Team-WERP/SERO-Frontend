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
            <div class="stepper">
                <div v-for="(s, idx) in steps" :key="s.code" class="stepper-item">
                    <div class="dot" :class="getStepState(idx)">
                        {{ idx + 1 }}
                    </div>


                    <div class="stepper-text">
                        <div class="step-label">{{ s.label }}</div>
                        <div class="step-date">{{ stepDateText(idx) }}</div>
                    </div>

                    <div v-if="idx !== steps.length - 1" class="line"></div>
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
                <div class="section-title" style="margin-top: 24px;">
                    생산요청 결재 진행 상황
                </div>

                <div class="approval-box">
                    <div class="approval-empty">
                        <img class="empty-character" src="@/assets/새로이새로미.png" alt="결재 없음" />
                        <div class="ghost">진행 중인 결재 건이 없습니다.</div>
                    </div>
                </div>

                <div v-if="showAssignManagerBtn || showRequestApprovalBtn" class="assign-btn-row">
                    <button v-if="showAssignManagerBtn" class="assign-btn" @click="openAssignmentModal">
                        담당자 배정
                    </button>
                    <ManagerAssignmentModal v-if="isModalOpen" :departmentData="deptEmployees"
                        @close="isModalOpen = false" @confirm="onConfirmAssignment" />

                    <button v-if="showRequestApprovalBtn" class="assign-btn" @click="requestApproval">
                        결재 요청
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

const route = useRoute()
const router = useRouter()
const prId = Number(route.params.prId)
const activeTab = ref('PR') // PR | PLAN
const isModalOpen = ref(false)
const deptEmployees = ref([])

const header = ref({
    prId: null,
    prCode: '',
    soCode: '',
    status: '',
    productionProgress: '',
    requestedAt: '',
    dueAt: '',
    managerId: null,
    drafterName: '',
    managerName: '',
    totalQuantity: 0
})
const items = ref([])

const steps = [
    { key: 'APPR', label: '생산요청 결재' },
    { key: 'PLAN', label: '계획수립' },
    { key: 'PROD', label: '생산 중' },
    { key: 'DONE', label: '생산 완료' }
]

const CURRENT_STEP_MAP = {
    PR_RVW: 0,
    PR_APPR_PEND: 0,
    PR_APPR_DONE: 1,
    PR_PLANNED: 1,
    PR_PRODUCING: 2,
    PR_DONE: 3,
    PR_APPR_RJCT: -1,
    PR_CANCEL: -1
}

const currentStepIndex = computed(() => {
    const status = header.value.status
    const progress = header.value.productionProgress

    if (status === 'PR_RVW' || status === 'PR_TMP') {
        return -1
    }

    if (status === 'PR_APPR_PEND') {
        return 0
    }

    if (status === 'PR_APPR_DONE') {
        switch (progress) {
            case 'PLANNING':
            case 'PLANNED':
                return 1
            case 'PRODUCING':
                return 2
            case 'COMPLETED':
                return 3
            default:
                return 0
        }
    }

    return -1
})


const getStepState = (idx) => {
    const cur = currentStepIndex.value
    if (cur === -1) return 'inactive'
    if (idx < cur) return 'done'
    if (idx === cur) return 'current'
    return 'inactive'
}


const reloadDetail = async () => {
    const res = await getPRDetail(prId)
    header.value = res.header
    items.value = Array.isArray(res.items) ? res.items : []
}

onMounted(async () => {
    const res = await getPRDetail(prId)
    header.value = res.header
    items.value = Array.isArray(res.items) ? res.items : []
})

const statusLabel = computed(() => ({
    PR_RVW: '요청검토',
    PR_APPR_PEND: '결재중',
    PR_APPR_DONE: '결재승인',
    PR_APPR_RJCT: '결재반려',
    PR_CANCEL: '취소'
}[header.value.status] || header.value.status))

const statusClass = computed(() => {
    const s = header.value.status
    if (s === 'PR_RVW' || s === 'PR_APPR_PEND') return 'green'
    if (s === 'PR_APPR_RJCT') return 'red'
    if (s === 'PR_PLANNED') return 'yellow'
    if (s === 'PR_PRODUCING') return 'purple'
    if (s === 'PR_DONE') return 'blue'
    return 'gray'
})

const stepDateText = (idx) => {
    return '-'
}

const showAssignManagerBtn = computed(() => {
    return header.value.status === 'PR_RVW'
        && !header.value.managerId
})

const showRequestApprovalBtn = computed(() => {
    return header.value.status === 'PR_RVW'
        && !!header.value.managerId
})

const requestApproval = async () => {
    if (!header.value.managerId) {
        alert('담당자를 먼저 배정해주세요.')
        return
    }

    if (!confirm('결재를 요청하시겠습니까?')) return

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
    // 네 프로젝트의 SO 상세 라우트에 맞게 수정
    // 예: router.push(`/orders/${header.value.soId}`)
    // soId가 응답에 없으면 soCode로 조회 페이지 이동 등으로 처리
    alert('주문 상세 라우트 연결 필요')
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

/* 오른쪽 stepper */
.stepper {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 2px;
}

.stepper-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.dot {
    width: 41px;
    height: 41px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    background: #CBD5E0;
}

.stepper-text {
    width: 78px;
}

.step-label {
    font-size: 13px;
    font-weight: 500;
    color: #000;
    margin-top: 2px;
}

.step-date {
    margin-top: 2px;
    font-size: 13px;
    font-weight: 500;
    color: #A0ADC1;
    text-align: center;
}

.line {
    width: 53px;
    height: 2px;
    background: #D9D9D9;
    margin-top: 20px;
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


/* 결재 진행 박스 */
.approval-box {
    background: #F9FAFB;
    border-radius: 10px;
    height: 256px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.approval-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.empty-character {
    width: 120px;
    height: auto;
    opacity: 0.5;
}

.ghost {
    font-size: 15px;
    font-weight: 400;
    color: #7B808D;
}

/* 결재 진행 박스 (Rectangle 688) */
.plan-box {
    background: #F9FAFB;
    border-radius: 10px;
    height: 256px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.plan-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
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

/* 담당자 배정 버튼 (PR) */
.assign-btn-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}

.assign-btn {
    background: #4C4CDD;
    color: #FFFFFF;
    border: none;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
}

.assign-btn:hover {
    background: #3B3BB0;
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