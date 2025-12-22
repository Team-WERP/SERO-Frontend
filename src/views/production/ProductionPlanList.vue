<!-- src/views/production/plan/ProductionPlanPage.vue -->
<template>
    <div class="pp-wrap">
        <!-- header -->
        <div class="pp-header">
            <div class="pp-title">생산계획 관리</div>

            <div class="pp-controls">
                <div class="month-box">
                    <input type="month" v-model="month" />
                </div>
            </div>
        </div>

        <!-- gantt panel -->
        <div class="panel">
            <div class="gantt">
                <!-- left header -->
                <div class="gantt-left head">
                    <div class="left-head">
                        <div class="left-head__title">라인 / 날짜</div>
                    </div>
                </div>

                <!-- right header -->
                <div class="gantt-right head" ref="ganttHeaderRef">
                    <div class="days-row" :style="{ width: gridWidthPx + 'px' }">
                        <div v-for="d in daysInMonth" :key="d" class="day-cell" :class="{ today: isToday(d) }">
                            <div class="day-num">{{ d }}</div>
                            <div v-if="isToday(d)" class="today-pill">Today</div>
                        </div>
                    </div>
                </div>

                <!-- body -->
                <div class="gantt-left body">
                    <div v-for="line in lines" :key="line.productionLineId" class="line-cell">
                        <div class="line-name">{{ line.productionLineName }}</div>
                        <div class="line-meta">
                            <div class="meta-row">
                                <span class="meta-k">제품:</span>
                                <span class="meta-v">{{ line.productName || '-' }}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-k">Max:</span>
                                <span class="meta-v">{{ formatNumber(line.dailyCapa) }}ea/일</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="gantt-right body" ref="ganttBodyRef" @scroll="syncScroll">
                    <div v-for="line in lines" :key="line.productionLineId" class="grid-row"
                        :style="{ width: gridWidthPx + 'px' }">
                        <!-- vertical grid -->
                        <div v-for="d in daysInMonth" :key="d" class="grid-cell" :class="{ today: isToday(d) }" />

                        <!-- plan bars -->
                        <div class="bars-layer">
                            <div v-for="plan in plansByLine[line.productionLineId] || []" :key="plan.ppId"
                                class="plan-bar" :class="{ draft: plan.status === 'PP_DRAFT' }" :style="barStyle(plan)"
                                @click="openPlan(plan)" title="클릭하여 상세보기">
                                <div class="bar-title">{{ plan.itemName }}</div>
                                <div class="bar-sub">{{ formatNumber(plan.productionQuantity) }}ea</div>
                            </div>
                        </div>
                    </div>

                    <!-- empty state -->
                    <div v-if="lines.length === 0" class="empty-box">
                        등록된 생산라인이 없습니다.
                    </div>
                </div>
            </div>
        </div>

        <!-- unassigned panel -->
        <div class="panel" style="margin-top: 14px;">
            <div class="sub-head">
                <div class="sub-title">
                    <span class="warn">⚠</span> 미편성 생산요청 목록
                </div>
                <div class="sub-desc">아이템을 클릭하여 일정을 잡아주세요.</div>
            </div>

            <div v-if="unassigned.length === 0" class="empty-row">
                미편성 생산요청이 없습니다.
            </div>

            <div class="unassigned-list">
                <div v-for="u in unassigned" :key="u.prItemId" class="unassigned-item" @click="openCreate(u.prItemId)">
                    <!-- header -->
                    <div class="ua-head">
                        <div class="ua-title">{{ u.itemName }}</div>
                        <div class="ua-line">
                            {{ u.productionLineName }}
                        </div>
                    </div>

                    <!-- body -->
                    <div class="ua-body kv">
                        <div class="k">규격</div>
                        <div class="v">{{ u.spec }}</div>

                        <div class="k">요청수량</div>
                        <div class="v">{{ formatNumber(u.requestedQuantity) }}</div>

                        <div class="k">납기일</div>
                        <div class="v">{{ u.dueAt?.slice(0, 10) }}</div>
                    </div>

                    <!-- footer -->
                    <div class="ua-foot">
                        계획 수립 →
                    </div>
                </div>
            </div>

        </div>

        <!-- modal -->
        <PlanCreateModal v-if="modal.open" :prItemId="modal.prItemId" :month="month" @close="modal.open = false"
            @created="onCreated" />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import PlanCreateModal from '@/components/production/PlanCreateModal.vue'
import {
    getProductionLines,
    getMonthlyPlans,
    getUnassignedTargets
} from '@/api/production/productionPlan'

const DAY_WIDTH = 34 // screenshot 느낌(촘촘) 유지
const ROW_HEIGHT = 56

const month = ref(toMonthValue(new Date())) // 'YYYY-MM'
const lines = ref([])
const plans = ref([])
const unassigned = ref([])

const modal = reactive({
    open: false,
    prItemId: null
})

/**
 * 날짜 계산
 */
const daysInMonth = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    return new Date(y, m, 0).getDate()
})

const gridWidthPx = computed(() => daysInMonth.value * DAY_WIDTH)

const isToday = (day) => {
    const now = new Date()
    const [y, m] = month.value.split('-').map(Number)
    return (
        now.getFullYear() === y &&
        now.getMonth() + 1 === m &&
        now.getDate() === day
    )
}

/**
 * Gantt scroll sync (header <-> body)
 */
const ganttHeaderRef = ref(null)
const ganttBodyRef = ref(null)
const syncScroll = (e) => {
    if (ganttHeaderRef.value) {
        ganttHeaderRef.value.scrollLeft = e.target.scrollLeft
    }
}

/**
 * plans grouping by line
 */
const plansByLine = computed(() => {
    const map = {}
    for (const p of plans.value) {
        const lineId = p.productionLineId
        if (!map[lineId]) map[lineId] = []
        map[lineId].push(p)
    }
    return map
})

/**
 * bar position
 * plan: { startDate, endDate } assumed 'YYYY-MM-DD'
 */
const barStyle = (plan) => {
    const startDay = Number(plan.startDate?.slice(8, 10))
    const endDay = Number(plan.endDate?.slice(8, 10))

    const left = (startDay - 1) * DAY_WIDTH
    const width = (endDay - startDay + 1) * DAY_WIDTH

    return {
        left: left + 'px',
        width: Math.max(width, DAY_WIDTH) + 'px',
        height: '38px',
        top: '9px'
    }
}

/**
 * navigation actions
 */
const openCreate = (prItemId) => {
    modal.open = true
    modal.prItemId = prItemId
}

const openPlan = (plan) => {
    // TODO: 상세/수정 모달 열기 (원하면 바로 만들어줄게)
    // 지금은 우선 클릭 시 콘솔만
    console.log('plan clicked', plan)
}

const onCreated = async () => {
    modal.open = false
    modal.prItemId = null
    await reloadAll()
}

const reloadAll = async () => {
    lines.value = await getProductionLines()
    // plans.value = await getMonthlyPlans(month.value)
    unassigned.value = await getUnassignedTargets()
}
watch(month, async () => {
    await reloadAll()
})

onMounted(reloadAll)

/**
 * utils
 */
function toMonthValue(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
}

const formatNumber = (v) => (v != null ? Number(v).toLocaleString() : '-')
</script>

<style scoped>
.pp-wrap {
    background: #F9FAFB;
    padding: 24px;
    min-height: calc(100vh - 70px);
}

.pp-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 12px;
}

.pp-title {
    font-size: 22px;
    font-weight: 800;
    color: #111827;
}

.pp-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.month-box input[type="month"] {
    height: 34px;
    border: 1px solid #D9D9D9;
    border-radius: 10px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
    background: #fff;
}

.panel {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 14px;
}

.gantt {
    display: grid;
    grid-template-columns: 220px 1fr;
    grid-template-rows: 44px auto;
    border: 1px solid #D9D9D9;
    border-radius: 10px;
    overflow: hidden;
}

.gantt-left.head {
    background: #F9FAFB;
    border-right: 1px solid #D9D9D9;
    border-bottom: 1px solid #D9D9D9;
}

.gantt-right.head {
    background: #F9FAFB;
    border-bottom: 1px solid #D9D9D9;
    overflow: hidden;
}

.left-head {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 12px;
}

.left-head__title {
    color: #6B7280;
    font-size: 13px;
    font-weight: 800;
}

.gantt-left.body {
    border-right: 1px solid #D9D9D9;
    background: #fff;
}

.line-cell {
    height: 56px;
    padding: 10px 12px;
    border-bottom: 1px solid #EEF2F7;
}

.line-cell:last-child {
    border-bottom: none;
}

.line-name {
    font-size: 13px;
    font-weight: 800;
    color: #111827;
}

.line-meta {
    margin-top: 4px;
    font-size: 11px;
    color: #6B7280;
    display: grid;
    gap: 2px;
}

.meta-row {
    display: flex;
    gap: 6px;
}

.meta-k {
    color: #9CA3AF;
    font-weight: 700;
}

.meta-v {
    font-weight: 700;
}

.gantt-right.body {
    overflow: auto;
    background: #fff;
}

.days-row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 34px;
    height: 44px;
}

.day-cell {
    position: relative;
    border-right: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6B7280;
    font-size: 12px;
    font-weight: 700;
}

.day-cell.today {
    background: rgba(244, 63, 94, 0.06);
    border-right: 1px solid rgba(244, 63, 94, 0.12);
}

.day-num {
    transform: translateY(1px);
}

.today-pill {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #EF4444;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 999px;
}

.grid-row {
    position: relative;
    height: 56px;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 34px;
    border-bottom: 1px solid #EEF2F7;
}

.grid-row:last-child {
    border-bottom: none;
}

.grid-cell {
    border-right: 1px solid #EEF2F7;
}

.grid-cell.today {
    background: rgba(244, 63, 94, 0.06);
}

.bars-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.plan-bar {
    position: absolute;
    border-radius: 8px;
    background: rgba(76, 76, 221, 0.12);
    border: 1px solid rgba(76, 76, 221, 0.35);
    padding: 6px 8px;
    pointer-events: auto;
    cursor: pointer;
    overflow: hidden;
}

.plan-bar.draft {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.35);
}

.bar-title {
    font-size: 12px;
    font-weight: 800;
    color: #111827;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.bar-sub {
    font-size: 11px;
    font-weight: 700;
    color: #4C4CDD;
    margin-top: 1px;
}

.empty-box {
    padding: 16px;
    color: #6B7280;
    font-size: 13px;
}

.sub-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.sub-title {
    font-size: 13px;
    font-weight: 800;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 8px;
}

.warn {
    color: #F59E0B;
    font-weight: 900;
}

.sub-desc {
    font-size: 12px;
    color: #9CA3AF;
    font-weight: 700;
}

.empty-row {
    padding: 14px;
    color: #6B7280;
    font-size: 13px;
}


.unassigned-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(300px, 23vw, 340px), 1fr));
    gap: 14px;
}

.unassigned-item {
    width: 100%;
}

.unassigned-item {
    border: 1px solid #D9D9D9;
    border-radius: 12px;
    padding: 16px 18px;
    background: #fff;
    cursor: pointer;
    transition: all 0.15s ease;
}

.unassigned-item:hover {
    border-color: #4C4CDD;
    background: #F9FAFB;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
}

.ua-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
}

.ua-title {
    font-size: 16px;
    font-weight: 600;
    color: #000;
}

.ua-line {
    font-size: 13px;
    font-weight: 500;
    color: #4C4CDD;
}

.ua-body.kv {
    display: grid;
    grid-template-columns: 100px 1fr;
    row-gap: 10px;
    column-gap: 12px;
}

.ua-body .k {
    font-size: 13px;
    font-weight: 500;
    color: #898989;
}

.ua-body .v {
    font-size: 14px;
    font-weight: 400;
    color: #000;
}

.ua-foot {
    margin-top: 14px;
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    color: #4C4CDD;
}
</style>
