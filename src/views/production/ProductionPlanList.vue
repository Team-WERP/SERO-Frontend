<template>
    <div class="pp-wrap">
        <div class="pp-header">
            <div class="pp-title">
                생산계획 관리
            </div>

            <div class="pp-controls">
                <div class="month-nav">
                    <button class="month-btn" @click="prevMonth">◀</button>
                    <button class="month-label" @click="openMonthPicker">
                        {{ displayMonth }}
                    </button>
                    <input ref="monthInput" type="month" v-model="month" class="hidden-month-input" />
                    <button class="month-btn" @click="nextMonth">▶</button>
                </div>
            </div>
        </div>

        <div class="panel gantt-panel">
            <div class="gantt-container">
                <div class="gantt-header-row">
                    <div class="gantt-label-column">라인 / 날짜</div>
                    <div class="gantt-timeline-column" ref="ganttHeaderRef">
                        <div class="days-row" :style="{ width: gridWidthPx + 'px' }">
                            <div v-for="d in daysInMonth" :key="d" class="day-cell"
                                :class="{ today: isToday(d), weekend: isWeekend(d) }">
                                <span class="day-num">{{ d }}</span>
                                <span v-if="isToday(d)" class="today-tag">TODAY</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="gantt-body">
                    <div v-for="(line, idx) in lines" :key="line.lineId" class="gantt-row"
                        :class="{ alt: idx % 2 === 1 }">

                        <div class="gantt-label-column line-info">
                            <div class="line-name">{{ line.lineName }}</div>
                            <div class="line-meta">
                                <span class="meta-v">{{ line.materialName || '미지정' }}</span>
                                <span class="meta-capa">Max: {{ formatNumber(line.dailyCapacity) }} {{ line.unit
                                }}</span>
                            </div>
                        </div>

                        <div class="gantt-timeline-column body-grid" @scroll="syncScroll">
                            <div class="grid-row" :style="{
                                width: gridWidthPx + 'px',
                                height: (maxLaneCount(line.lineId) * 44 + 12) + 'px'
                            }">

                                <div v-for="d in daysInMonth" :key="d" class="grid-cell" :class="[
                                    { today: isToday(d), weekend: isWeekend(d) },
                                    getLoadClass(line.lineId, d)
                                ]" />

                                <div class="bars-layer">
                                    <div v-for="plan in plansByLine[line.lineId] || []" :key="plan.ppId"
                                        class="plan-bar" :class="plan.status" :style="barStyle(plan)"
                                        @click="openPlan(plan)" @mouseenter="showTooltip($event, plan)"
                                        @mouseleave="hideTooltip">
                                        <div class="bar-content">
                                            <span class="bar-title">{{ plan.prCode }}</span>
                                            <span class="bar-qty">
                                                {{ formatNumber(plan.productionQuantity) }} {{ plan.unit }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="lines.length === 0" class="empty-state">
                        데이터가 없습니다.
                    </div>
                </div>
            </div>
        </div>

        <div class="panel unassigned-panel">
            <div class="sub-head">
                <div class="sub-title">
                    미편성 생산요청
                    <span class="count-badge">{{ unassigned.length }}</span>
                </div>
                <div class="sub-desc">항목을 클릭하여 생산 일정을 등록하세요.</div>
            </div>

            <div class="unassigned-grid">
                <div v-for="u in unassigned" :key="u.prItemId" class="ua-card" @click="openCreate(u.prItemId)">
                    <div class="ua-card-header">
                        <span class="ua-badge">{{ u.productionLineName }}</span>
                        <span class="ua-date">납기: {{ u.dueAt?.slice(5, 10) }}</span>
                    </div>
                    <div class="ua-item-name">{{ u.itemName }}</div>
                    <div class="ua-details">
                        <div class="ua-row"><span>규격</span><strong>{{ u.spec }}</strong></div>
                        <div class="ua-row"><span>요청</span><strong>{{ formatNumber(u.requestedQuantity) }}ea</strong>
                        </div>
                    </div>
                    <div class="ua-action">일정 편성하기 →</div>
                </div>
                <div v-if="unassigned.length === 0" class="empty-inline">미편성 목록이 비어있습니다.</div>
            </div>
        </div>

        <PlanCreateModal v-if="showPlanModal" :prItemId="selectedPrItemId" :month="month" @close="showPlanModal = false"
            @created="onCreated" />
        <PPDetailModal v-if="showDetailModal && selectedPpId !== null" :ppId="selectedPpId"
            @close="showDetailModal = false" />
    </div>

    <Teleport to="body">
        <div v-show="tooltip.visible" class="global-tooltip" :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px'
        }">
            {{ tooltip.text }}
        </div>
    </Teleport>

</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PlanCreateModal from '@/components/production/PlanCreateModal.vue'
import PPDetailModal from '@/components/production/PPDetailModal.vue'
import { getProductionLines, getMonthlyPlans, getUnassignedTargets, getDailyLineSummary } from '@/api/production/productionPlan'

// --- Constants & Refs ---
const DAY_WIDTH = 40
const month = ref(toMonthValue(new Date()))
const lines = ref([])
const plans = ref([])
const unassigned = ref([])
const dailySummary = ref([])
const showPlanModal = ref(false)
const selectedPrItemId = ref(null)
const ganttHeaderRef = ref(null)
const BAR_HEIGHT = 36
const BAR_GAP = 6
const BAR_TOP_PADDING = 8
const selectedPpId = ref(null)
const showDetailModal = ref(false)

const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    text: ''
})

const showTooltip = (e, plan) => {
    const rect = e.currentTarget.getBoundingClientRect()

    tooltip.value = {
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
        text: `${plan.startDate} ~ ${plan.endDate}`
    }
}

const hideTooltip = () => {
    tooltip.value.visible = false
}


// --- Computed ---
const daysInMonth = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    return new Date(y, m, 0).getDate()
})

const gridWidthPx = computed(() => daysInMonth.value * DAY_WIDTH)

const displayMonth = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    return `${y}년 ${m}월`
})

const plansByLine = computed(() => {
    const map = {}

    for (const p of plans.value) {
        const key = p.productionLineId
        if (!map[key]) map[key] = []
        map[key].push(p)
    }

    for (const key of Object.keys(map)) {
        map[key].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        assignPlanLanes(map[key])
    }

    return map
})

const dailySummaryMap = computed(() => {
    const map = {}
    dailySummary.value.forEach(s => { map[s.productionLineId] = s })
    return map
})

// --- Methods ---
const isToday = (day) => {
    const now = new Date()
    const [y, m] = month.value.split('-').map(Number)
    return now.getFullYear() === y && now.getMonth() + 1 === m && now.getDate() === day
}

const isWeekend = (day) => {
    const [y, m] = month.value.split('-').map(Number)
    const dayOfWeek = new Date(y, m - 1, day).getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // 0:일, 6:토
}

const getLoadClass = (lineId, day) => {
    const summary = dailySummaryMap.value[lineId]
    if (!summary || !summary.dailyPlannedQtyMap) return ''
    const planned = summary.dailyPlannedQtyMap[day] || 0
    const capa = summary.dailyCapacity || 0
    if (capa === 0) return ''
    const rate = planned / capa
    if (rate > 1) return 'load-over'
    if (rate >= 0.8) return 'load-warn'
    if (rate >= 0.5) return 'load-mid'
    return 'load-low'
}

const barStyle = (plan) => {
    const [y, m] = month.value.split('-').map(Number)
    const monthStart = new Date(y, m - 1, 1)
    const monthEnd = new Date(y, m, 0)

    const start = new Date(plan.startDate); start.setHours(0, 0, 0, 0)
    const end = new Date(plan.endDate); end.setHours(0, 0, 0, 0)

    const s = start < monthStart ? monthStart : start
    const e = end > monthEnd ? monthEnd : end
    if (s > e) return { display: 'none' }

    const left = (s.getDate() - 1) * DAY_WIDTH
    const width = (e.getDate() - s.getDate() + 1) * DAY_WIDTH

    const laneIndex = plan._laneIndex ?? 0

    return {
        left: `${left + 4}px`,
        width: `${Math.max(0, width - 8)}px`,
        top: `${BAR_TOP_PADDING + laneIndex * (BAR_HEIGHT + BAR_GAP)}px`,
        height: `${BAR_HEIGHT}px`
    }
}


const maxLaneCount = (lineId) => {
    const list = plansByLine.value[lineId] || []
    return Math.max(1, ...list.map(p => p._laneIndex + 1))
}


const syncScroll = (e) => {
    if (ganttHeaderRef.value) ganttHeaderRef.value.scrollLeft = e.target.scrollLeft
}

const prevMonth = () => {
    const [y, m] = month.value.split('-').map(Number)
    month.value = toMonthValue(new Date(y, m - 2, 1))
}

const nextMonth = () => {
    const [y, m] = month.value.split('-').map(Number)
    month.value = toMonthValue(new Date(y, m, 1))
}

const openMonthPicker = () => { /* Logic to show hidden month input */ }

const openCreate = (id) => { selectedPrItemId.value = id; showPlanModal.value = true }
const openPlan = (plan) => {
    selectedPpId.value = plan.ppId
    showDetailModal.value = true
}

function assignPlanLanes(plans) {
    const lanes = []

    for (const plan of plans) {
        let placed = false

        for (let i = 0; i < lanes.length; i++) {
            const last = lanes[i][lanes[i].length - 1]

            // 겹치지 않으면 같은 lane 사용
            if (new Date(last.endDate) < new Date(plan.startDate)) {
                lanes[i].push(plan)
                plan._laneIndex = i
                placed = true
                break
            }
        }

        if (!placed) {
            plan._laneIndex = lanes.length
            lanes.push([plan])
        }
    }

    return plans
}


const reloadAll = async () => {
    lines.value = await getProductionLines(2)
    plans.value = await getMonthlyPlans(month.value)
    unassigned.value = await getUnassignedTargets()
    dailySummary.value = await getDailyLineSummary(month.value, 2)
}

const onCreated = () => { showPlanModal.value = false; reloadAll() }

watch(month, reloadAll)
onMounted(reloadAll)

function toMonthValue(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const formatNumber = (v) => v?.toLocaleString() || '0'
</script>

<style scoped>
.pp-wrap {
    padding: 20px;
    background: #f4f7fa;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
}

/* Header */
.pp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.pp-title {
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
}

.month-nav {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.month-btn {
    border: none;
    background: none;
    padding: 8px 12px;
    cursor: pointer;
    color: #64748b;
}

.month-label {
    border: none;
    background: none;
    font-weight: 700;
    font-size: 16px;
    min-width: 120px;
    cursor: pointer;
}

/* Gantt Layout */
.panel {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.gantt-container {
    display: flex;
    flex-direction: column;
}

.gantt-header-row {
    display: flex;
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
}

.gantt-label-column {
    width: 220px;
    flex-shrink: 0;
    padding: 12px 20px;
    border-right: 1px solid #e2e8f0;
}

.gantt-timeline-column {
    flex-grow: 1;
    overflow: hidden;
}

/* Timeline Header */
.days-row {
    display: flex;
    height: 50px;
}

.day-cell {
    width: 40px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    border-right: 1px solid #f1f5f9;
    position: relative;
}

/* 
.day-cell.weekend {
    background: #f1f5f9;
} */

.day-cell.today {
    background: #fff1f2;
    color: #e11d48;
}

.today-tag {
    position: absolute;
    top: 2px;
    font-size: 8px;
    font-weight: 900;
    background: #e11d48;
    color: white;
    padding: 1px 4px;
    border-radius: 4px;
}

/* Gantt Body */
.gantt-row {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
}

.line-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: white;
    z-index: 10;
}

.line-name {
    font-weight: 700;
    color: #1e293b;
    font-size: 14px;
}

.line-meta {
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    flex-direction: column;
}

.body-grid {
    overflow-x: auto;
    position: relative;
}

.grid-row {
    display: flex;
    height: 60px;
    position: relative;
}

.grid-cell {
    width: 40px;
    flex-shrink: 0;
    border-right: 1px solid #f1f5f9;
    position: relative;
}

/* Load Indicators (Top Bar) */
.grid-cell::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0.6;
}

.load-over::before {
    background: #ef4444;
}

.load-warn::before {
    background: #f59e0b;
}

.load-mid::before {
    background: #3b82f6;
}

/* Plan Bars */
.bars-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.plan-bar {
    position: absolute;
    pointer-events: auto;
    cursor: pointer;
    border-radius: 8px;
    background: #6366f1;
    color: white;
    z-index: 20;
}

.plan-bar:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    z-index: 50;
}

.plan-bar {
    background: #6366f1;
    color: white;
}

/* Default confirmed style */
.plan-bar.PP_DRAFT {
    background: #10b981;
}

.bar-content {
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
}

.bar-title {
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bar-qty {
    font-size: 10px;
    opacity: 0.9;
}

/* Unassigned Cards */
.unassigned-panel {
    margin-top: 24px;
    padding: 20px;
}

.sub-head {
    margin-bottom: 16px;
}

.sub-title {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
}

.count-badge {
    background: #e11d48;
    color: white;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
}

.unassigned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.ua-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: 0.2s;
}

.ua-card:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.ua-card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.ua-badge {
    background: #eef2ff;
    color: #6366f1;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
}

.ua-date {
    font-size: 11px;
    color: #94a3b8;
}

.ua-item-name {
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 12px;
    color: #1e293b;
}

.ua-details {
    font-size: 13px;
    color: #64748b;
}

.ua-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
}

.ua-action {
    margin-top: 12px;
    text-align: right;
    color: #6366f1;
    font-weight: 700;
    font-size: 13px;
}

.hidden-month-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.gantt-row.alt {
    background: #fafafa;
}

.global-tooltip {
    position: fixed;
    transform: translateX(-50%);
    background: #111827;
    color: #fff;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 99999;
    pointer-events: none;
}

.global-tooltip::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #111827 transparent;
}
</style>