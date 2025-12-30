<!-- src/views/production/request/detail/PlanTab.vue (경로는 예시) -->
<template>
    <div class="plan-tab">
        <div class="section-head">
            <div class="section-title">생산계획/작업지시 현황</div>
            <div class="section-desc">
                생산요청 품목을 계획대상으로 등록한 뒤, 생산계획 페이지에서 실제 계획(간트)을 수립합니다.
            </div>
        </div>

        <div class="plan-table">
            <div class="thead">
                <div class="cell no">No</div>
                <div class="cell code">품목코드</div>
                <div class="cell name">품목명</div>
                <div class="cell qty">요청수량</div>
                <div class="cell status">계획상태</div>
                <div class="cell action">액션</div>
            </div>

            <div v-for="(row, idx) in rows" :key="row.prItemId" class="trow">
                <div class="cell no">{{ idx + 1 }}</div>
                <div class="cell code">{{ row.itemCode }}</div>
                <div class="cell name">{{ row.itemName }}</div>
                <div class="cell qty">{{ formatNumber(row.requestedQuantity) }}</div>

                <div class="cell status">
                    <span class="badge" :class="statusBadgeClass(row.prItemStatus)">
                        {{ statusLabel(row.prItemStatus) }}
                    </span>
                </div>

                <div class="cell action">
                    <button v-if="row.prItemStatus === 'PIS_WAIT'" class="outline-btn small"
                        :disabled="loadingId === row.prItemId" @click="onAddTarget(row.prItemId)">
                        {{ loadingId === row.prItemId ? '처리 중...' : '계획대상 추가' }}
                    </button>

                    <button v-else-if="row.prItemStatus === 'PIS_TARGET'" class="solid-btn small"
                        @click="goPlanPage(row.prItemId)">
                        생산계획 수립하러가기 →
                    </button>

                    <button v-else-if="row.prItemStatus === 'PIS_PLANNED'" class="outline-btn small"
                        @click="goPlanPage(row.prItemId)">
                        생산계획 보기 →
                    </button>


                    <span v-else class="muted">-</span>
                </div>
            </div>

            <div v-if="rows.length === 0" class="empty">
                표시할 품목이 없습니다.
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { addPlanningTarget } from '@/api/production/productionPlan'

const props = defineProps({
    prId: { type: Number, required: true },
    items: { type: Array, default: () => [] }
})

// PR 상세에서 상태 갱신을 위해 emit으로 알림
// - parent에서 getPRDetail 재호출하거나 items만 부분 업데이트 가능
const emit = defineEmits(['refresh'])

const router = useRouter()
const loadingId = ref(null)

const normalizeStatus = (item) => {
    // 프로젝트마다 필드명이 다를 수 있어 유연하게 처리
    return item.prItemStatus || item.status || item.itemStatus || 'UNKNOWN'
}

const rows = computed(() => {
    return (Array.isArray(props.items) ? props.items : []).map(i => ({
        prItemId: i.prItemId,
        itemCode: i.itemCode,
        itemName: i.itemName,
        spec: i.spec,
        requestedQuantity: i.requestedQuantity,
        prItemStatus: normalizeStatus(i),

        // (선택) 쿼리에서 내려주면 사용 가능
        ppId: i.ppId,
        ppCode: i.ppCode
    }))
})

const onAddTarget = async (prItemId) => {
    try {
        loadingId.value = prItemId
        await addPlanningTarget(prItemId)

        // 가장 단단한 방법: parent에서 PR detail 재조회
        emit('refresh')
    } finally {
        loadingId.value = null
    }
}

const goPlanPage = (prItemId) => {
    // 네 생산계획 페이지 라우트에 맞게 수정
    // 권장: query로 prItemId 전달해서 생산계획 페이지가 상세조회(/planning)로 진입
    router.push({ path: '/production/plans', query: { prItemId } })
}

const formatNumber = (v) => (v != null ? Number(v).toLocaleString() : '-')

const statusLabel = (s) => ({
    PIS_WAIT: '대기',
    PIS_TARGET: '계획대상',
    PIS_PLANNED: '계획완료',
    PIS_PRODUCING: '생산중',
    PIS_DONE: '생산완료',
    UNKNOWN: '미확인'
}[s] || s)

const statusBadgeClass = (s) => {
    if (s === 'PIS_WAIT') return 'gray'
    if (s === 'PIS_TARGET') return 'yellow'
    if (s === 'PIS_PLANNED') return 'green'
    if (s === 'PIS_PRODUCING') return 'blue'
    if (s === 'PIS_DONE') return 'dark'
    return 'gray'
}
</script>

<style scoped>
.plan-tab {
    padding: 6px 2px 10px;
}

.section-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.section-title {
    color: #4C4CDD;
    font-size: 16px;
    font-weight: 700;
}

.section-desc {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.plan-table {
    border: 1px solid #D9D9D9;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
}

.thead,
.trow {
    display: grid;
    grid-template-columns: 80px 140px 1fr 160px 140px 220px;
    align-items: center;
    height: 47px;
}

.thead {
    background: #F9FAFB;
    border-bottom: 1px solid #D9D9D9;
    font-weight: 700;
}

.trow {
    border-bottom: 1px solid #D9D9D9;
}

.trow:last-of-type {
    border-bottom: none;
}

.cell {
    padding: 0 14px;
    font-size: 13px;
    color: #000;
}

.cell.qty {
    text-align: left;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 700;
}

.badge.gray {
    background: #F3F4F6;
    color: #374151;
}

.badge.yellow {
    background: #FEF3C7;
    color: #92400E;
}

.badge.green {
    background: #ECFEF6;
    color: #278465;
}

.badge.blue {
    background: #E0F2FE;
    color: #0369A1;
}

.badge.dark {
    background: #E5E7EB;
    color: #111827;
}

.muted {
    color: #9ca3af;
    font-size: 13px;
}

.empty {
    padding: 16px;
    color: #6b7280;
    font-size: 13px;
}

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

.solid-btn {
    border: 1px solid #4C4CDD;
    color: #fff;
    background: #4C4CDD;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 10px;
    cursor: pointer;
}

.outline-btn.small,
.solid-btn.small {
    padding: 8px 10px;
}

.outline-btn:disabled {
    opacity: 0.6;
    cursor: default;
}

.hint {
    margin-top: 12px;
    font-size: 12px;
    color: #9ca3af;
}
</style>
