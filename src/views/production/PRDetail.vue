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
                        <div class="cell qty">생산요청수량</div>
                    </div>

                    <div v-for="(i, idx) in items" :key="i.prItemId" class="trow">
                        <div class="cell no">{{ idx + 1 }}</div>
                        <div class="cell code">{{ i.itemCode }}</div>
                        <div class="cell name">{{ i.itemName }}</div>
                        <div class="cell spec">{{ i.spec }}</div>
                        <div class="cell qty">{{ formatNumber(i.requestedQuantity) }}</div>
                    </div>

                    <div class="tfoot">
                        <div class="cell no"></div>
                        <div class="cell code"></div>
                        <div class="cell name"></div>
                        <div class="cell spec"></div>
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

            </div>

            <!-- 생산계획/작업지시 -->
            <div v-if="activeTab === 'PLAN'">
                <PlanTab :prId="prId" :items="items" @refresh="reloadDetail" />
            </div>


        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPRDetail } from '@/api/production/productionRequest'
import PlanTab from './PlanTab.vue'

const route = useRoute()
const router = useRouter()
const prId = Number(route.params.prId)
const activeTab = ref('PR') // PR | PLAN

const header = ref({
    prId: null,
    prCode: '',
    soCode: '',
    status: '',
    requestedAt: '',
    dueAt: '',
    drafterName: '',
    managerName: '',
    totalQuantity: 0
})
const items = ref([])

const steps = [
    { code: 'PR_RVW', label: '생산요청 결재' },
    { code: 'PR_PLANNED', label: '계획수립' },
    { code: 'PR_PRODUCING', label: '생산 중' },
    { code: 'PR_DONE', label: '생산 완료' }
]

const CURRENT_STEP_MAP = {
    PR_RVW: null,        // 시작 전
    PR_APPR: 0,          // 결재중
    PR_APPR_DONE: 1,     // 결재 완료
    PR_PLANNED: 1,       // 계획 수립 완료
    PR_PRODUCING: 2,     // 생산 중
    PR_DONE: 3,          // 생산 완료
    PR_RJCT: -1,
    PR_CANCEL: -1,
}

const currentStepIndex = computed(() => {
    return CURRENT_STEP_MAP[header.value.status] ?? null
})

const getStepState = (idx) => {
    const cur = currentStepIndex.value

    if (cur === null || cur < 0) return 'inactive'
    if (idx < cur) return 'done'
    if (idx === cur) {
        // 완료 상태는 current가 아니라 done
        if (['PR_PLANNED', 'PR_DONE'].includes(header.value.status)) {
            return 'done'
        }
        return 'current'
    }
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
    PR_APPR: '결재중',
    PR_APPR_DONE: '결재승인',
    PR_RJCT: '결재반려',
    PR_PLANNED: '계획수립',
    PR_PRODUCING: '생산중',
    PR_DONE: '생산완료',
    PR_CANCEL: '취소'
}[header.value.status] || header.value.status))

const statusClass = computed(() => {
    const s = header.value.status
    if (s === 'PR_RVW' || s === 'PR_APPR') return 'green'
    if (s === 'PR_RJCT') return 'red'
    if (s === 'PR_PLANNED') return 'yellow'
    if (s === 'PR_PRODUCING') return 'purple'
    if (s === 'PR_DONE') return 'blue'
    return 'gray'
})

const stepDateText = (idx) => {
    if (idx === 0) return header.value.requestedAt?.slice(0, 10) || '-'
    if (idx === 3) return header.value.completedAt?.slice(0, 10) || '-'
    return '-'
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

</script>

<style scoped>
/* 페이지 배경: Figma 스펙 */
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

/* 상태 pill (Frame 77) */
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

/* 메인 흰 패널 (Rectangle 663) */
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
    /* divider 위 */
}

/* .tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0px;
    width: 100%;
    height: 3px;
    background: #4C4CDD;
    border-radius: 2px;
} */

.divider {
    position: relative;
    z-index: 1;
    height: 1px;
    background: #D9D9D9;
    margin-bottom: 18px;
}

/* 공통 아웃라인 버튼 (Frame 100/115) */
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 품목 테이블 (Frame 63) */
.items-table {
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    max-width: 1300px;
    border: 1px solid #D9D9D9;
    margin-top: 10px;
}

.thead {
    display: grid;
    grid-template-columns: 120px 140px 1fr 160px 170px;
    background: #F9FAFB;
    border-bottom: 1px solid #D9D9D9;
    height: 47px;
    align-items: center;
}

.trow {
    display: grid;
    grid-template-columns: 120px 140px 1fr 160px 170px;
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
    grid-template-columns: 120px 140px 1fr 160px 170px;
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


/* 결재 진행 박스 (Rectangle 688) */
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
</style>
