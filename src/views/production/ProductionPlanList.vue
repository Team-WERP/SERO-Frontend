<template>
    <div class="pp-wrap">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">생산계획 관리</h1>
                <p class="page-description">
                    생산요청 품목에 대해 월별로 생산계획을 수립합니다.
                </p>
            </div>
            <div class="pp-controls">
                <div class="date-box">
                    <div class="date-controls">
                        <button class="date-btn" @click="setThisMonth">이번 달</button>
                        <button class="date-btn" @click="prevMonth">◀</button>

                        <input type="month" v-model="month" class="date-input" />

                        <button class="date-btn" @click="nextMonth">▶</button>
                    </div>

                </div>

            </div>
        </div>

        <div class="panel gantt-panel">
            <div class="gantt-container">
                <div class="gantt-header-row">
                    <div class="gantt-label-column">라인 / 날짜</div>
                    <div class="gantt-timeline-column" ref="ganttHeaderRef">
                        <div class="days-row" :style="{ width: '100%' }">
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
                                <span class="meta-v">제품명: {{ line.materialName || '미지정' }}</span>
                                <span class="meta-capa">일일 최대 생산량: {{ formatNumber(line.dailyCapacity) }} {{
                                    line.unit
                                    }}</span>
                            </div>
                        </div>

                        <div class="gantt-timeline-column body-grid" @scroll="syncScroll">
                            <div class="grid-row" :style="{
                                width: '100%',
                                height: (maxLaneCount(line.lineId) * 44 + 12) + 'px'
                            }">

                                <div v-for="d in daysInMonth" :key="d" class="grid-cell" :class="[
                                    { today: isToday(d), weekend: isWeekend(d) },
                                    getLoadClass(line.lineId, d)
                                ]" />

                                <div class="bars-layer" style="width: 100%; position: absolute; left: 0; top: 0;">
                                    <div v-for="plan in plansByLine[line.lineId] || []" :key="plan.ppId"
                                        class="plan-bar" :class="plan.status" :style="barStyle(plan)"
                                        @click="openPlan(plan)" @mouseenter="showTooltip($event, plan)"
                                        @mouseleave="hideTooltip">
                                        <div class="bar-content">
                                            <span class="bar-title">{{ plan.prCode }}</span>
                                            <span class="bar-qty">
                                                총 {{ formatNumber(plan.productionQuantity) }} {{ plan.unit }}
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
            <div class="load-info-area">
                <div class="load-legend">
                    <span class="lg-item">라인 부하율 :</span>
                    <span class="lg-item"><i class="dot mid"></i> 보통 (50~80%)</span>
                    <span class="lg-item"><i class="dot warn"></i> 주의 (80~100%)</span>
                    <span class="lg-item"><i class="dot over"></i> 초과 (100% 초과)</span>
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
                <div v-for="u in unassigned" :key="u.prItemId" class="ua-card" @click="openCreate(u)">
                    <!-- 상단: PR + D-Day -->
                    <div class="ua-top">
                        <span class="ua-pr">{{ u.prCode }}</span>
                        <span class="ua-dday" :class="ddayClass(u.dueAt)">
                            D-{{ calcDday(u.dueAt) }}
                        </span>
                    </div>

                    <!-- 제품명 -->
                    <div class="ua-item-name">
                        {{ u.itemName }}
                    </div>

                    <!-- 상세 정보 -->
                    <div class="ua-details">
                        <div class="ua-row">
                            <span>규격</span>
                            <strong>{{ u.spec }}</strong>
                        </div>

                        <div class="ua-row">
                            <span>요청 수량</span>
                            <strong>{{ formatNumber(u.requestedQuantity) }} ea</strong>
                        </div>

                        <div class="ua-row">
                            <span>납기일</span>
                            <strong>{{ formatDate(u.dueAt) }}</strong>
                        </div>

                        <div class="ua-row">
                            <span>생산 라인</span>
                            <strong class="line">{{ u.productionLineName }}</strong>
                        </div>
                    </div>
                </div>

                <div v-if="unassigned.length === 0" class="empty-inline">
                    미편성 목록이 비어있습니다.
                </div>
            </div>

        </div>

        <PlanCreateModal v-if="showPlanModal" :prItemId="selectedPrItemId" :defaultLineId="selectedLineId"
            :month="month" @close="showPlanModal = false" @created="onCreated" />

        <PPDetailModal v-if="showDetailModal && selectedPpId !== null" :ppId="selectedPpId"
            @close="showDetailModal = false" />
    </div>

    <Teleport to="body">
        <div v-show="tooltip.visible" class="global-tooltip" :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: 'translateX(-50%)'
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
const month = ref(toMonthValue(new Date()))
const lines = ref([])
const plans = ref([])
const unassigned = ref([])
const dailySummary = ref([])
const showPlanModal = ref(false)
const selectedPrItemId = ref(null)
const ganttHeaderRef = ref(null)
const BAR_HEIGHT = 40
const BAR_GAP = 6
const BAR_TOP_PADDING = 10
const selectedPpId = ref(null)
const showDetailModal = ref(false)
const selectedLineId = ref(null)

const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    text: ''
})

const showTooltip = (e, plan) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dailyQty = calcDailyQuantity(plan)

    const text = `기간: ${plan.startDate} ~ ${plan.endDate} (${plan.durationDays}일)\n총 수량: ${formatNumber(plan.productionQuantity)} ${plan.unit}\n예상 일일 생산량: ${formatNumber(dailyQty)} ${plan.unit}`

    let x = rect.left + rect.width / 2
    let y = rect.bottom + 8

    const tooltipExpectedWidth = 220
    const padding = 20

    if (x + tooltipExpectedWidth / 2 > window.innerWidth - padding) {
        x = window.innerWidth - tooltipExpectedWidth / 2 - padding
    } else if (x - tooltipExpectedWidth / 2 < padding) {
        x = tooltipExpectedWidth / 2 + padding
    }

    tooltip.value = {
        visible: true,
        x: x,
        y: y,
        text: text
    }
}

const hideTooltip = () => {
    tooltip.value.visible = false
}

const daysInMonth = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    return new Date(y, m, 0).getDate()
})

const plansByLine = computed(() => {
    const map = {}

    for (const p of plans.value) {
        const key = p.productionLineId
        if (!map[key]) map[key] = []
        map[key].push(p)
    }

    for (const key of Object.keys(map)) {
        const list = map[key]

        list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

        for (const plan of list) {
            const s = new Date(plan.startDate)
            const e = new Date(plan.endDate)
            const days =
                Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1

            plan.durationDays = days > 0 ? days : 1
            plan.dailyQuantity = Math.ceil(
                plan.productionQuantity / plan.durationDays
            )
        }

        assignPlanLanes(list)
    }

    return map
})

const calcDurationDays = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    s.setHours(0, 0, 0, 0)
    e.setHours(0, 0, 0, 0)

    return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1
}

const calcDailyQuantity = (plan) => {
    const days = calcDurationDays(plan.startDate, plan.endDate)
    if (!days || days <= 0) return 0
    return Math.ceil(plan.productionQuantity / days)
}

const setThisMonth = () => {
    month.value = toMonthValue(new Date());
};

const dailySummaryMap = computed(() => {
    const map = {}
    dailySummary.value.forEach(s => { map[s.productionLineId] = s })
    return map
})

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
}

const barStyle = (plan) => {
    const [y, m] = month.value.split('-').map(Number)
    const monthStart = new Date(y, m - 1, 1)
    const monthEnd = new Date(y, m, 0)
    const totalDays = daysInMonth.value // 이번 달 전체 일수 (예: 31)

    const start = new Date(plan.startDate); start.setHours(0, 0, 0, 0)
    const end = new Date(plan.endDate); end.setHours(0, 0, 0, 0)

    const s = start < monthStart ? monthStart : start
    const e = end > monthEnd ? monthEnd : end
    if (s > e) return { display: 'none' }

    // 시작 위치(left): (시작일 - 1) / 전체일수 * 100
    const leftPercent = ((s.getDate() - 1) / totalDays) * 100

    // 너비(width): (표시일수) / 전체일수 * 100
    const durationDays = (e.getDate() - s.getDate() + 1)
    const widthPercent = (durationDays / totalDays) * 100

    const laneIndex = plan._laneIndex ?? 0

    return {
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${BAR_TOP_PADDING + laneIndex * (BAR_HEIGHT + BAR_GAP)}px`,
        height: `${BAR_HEIGHT}px`,
        padding: '0 4px'
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

const openCreate = (u) => {
    selectedPrItemId.value = u.prItemId
    selectedLineId.value = u.productionLineId
    showPlanModal.value = true
}
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
    lines.value = await getProductionLines(3)   // 공장 id 고정
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

const calcDday = (dueAt) => {
    if (!dueAt) return '-'
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(dueAt)
    due.setHours(0, 0, 0, 0)

    return Math.max(
        0,
        Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    )
}

const ddayClass = (dueAt) => {
    const d = calcDday(dueAt)
    if (d <= 3) return 'danger'
    if (d <= 7) return 'warn'
    return 'safe'
}

const formatDate = (d) => {
    if (!d) return '-'
    return d.slice(0, 10) // YYYY-MM-DD
}

</script>

<style scoped>
.pp-wrap {
    padding: 5px;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
}

/* ===== 헤더 ===== */
.page-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}


.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}

/* Gantt Layout */
.panel {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
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

.day-num {
    font-size: 14px;
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

.day-cell,
.grid-cell {
    width: 0;
    flex: 1 0 0;
    padding-bottom: 5px;
    min-width: 30px;
    border-right: 1px solid #f1f5f9;
}

.day-cell {
    width: 40px;
    flex-grow: 1;
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
    font-size: 16px;
}

.line-meta {
    font-size: 13px;
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
    flex-grow: 1;
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
    height: 6px;
    opacity: 0.8;
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
    box-sizing: border-box;
    transition: transform 0.2s, box-shadow 0.2s;
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
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bar-qty {
    font-size: 11px;
    opacity: 0.9;
}

/* Unassigned Cards */
.unassigned-panel {
    margin-top: 12px;
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

.sub-desc {
    font-size: 15px;
    color: #6b7280;
    margin-top: 4px;
}

.count-badge {
    background: #e11d48;
    color: white;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
}

/* ===== Unassigned Cards ===== */

.unassigned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}

/* 카드 */
.ua-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 16px 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
}

.ua-card:hover {
    border-color: #4c4cdd;
    box-shadow: 0 8px 18px rgba(76, 76, 221, 0.12);
    transform: translateY(-2px);
}

/* 상단 영역 */
.ua-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

/* PR 코드 */
.ua-pr {
    font-size: 13px;
    font-weight: 800;
    color: #111827;
    letter-spacing: 0.2px;
}

/* D-Day */
.ua-dday {
    font-size: 12px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 999px;
}

/* D-Day 색상 */
.ua-dday.safe {
    background: #ecfdf5;
    color: #047857;
}

.ua-dday.warn {
    background: #fff7ed;
    color: #b45309;
}

.ua-dday.danger {
    background: #fef2f2;
    color: #b91c1c;
}

/* 제품명 */
.ua-item-name {
    font-size: 17px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 14px;
}

/* 상세 정보 */
.ua-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    color: #475569;
}

.ua-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.ua-row span {
    color: #6b7280;
    font-weight: 500;
}

.ua-row strong {
    font-weight: 700;
    color: #111827;
}

.ua-row strong.line {
    color: #4c4cdd;
}

/* Empty */
.empty-inline {
    padding: 24px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
}


.gantt-row.alt {
    background: #fafafa;
}

.global-tooltip {
    position: fixed;
    background: rgba(17, 24, 39, 0.95);
    color: #fff;
    font-size: 14px;
    line-height: 1.5;
    padding: 10px 14px;
    border-radius: 8px;
    white-space: pre-line;
    z-index: 99999;
    pointer-events: none;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    width: max-content;
    max-width: 300px;
}

.global-tooltip::before {
    display: none;
}

/* ===== 날짜 컨트롤 ===== */
.pp-controls {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    flex: 1;
}

.date-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
}

.date-controls {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* 연월 선택 인풋 스타일 */
.date-input {
    padding: 6px 10px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #111827;
    outline: none;
    font-family: inherit;
    cursor: pointer;
}

.date-input:hover {
    border-color: #4C4CDD;
}

/* 버튼 스타일 */
.date-btn {
    padding: 7px 12px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.date-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

/* 부하율 안내 영역 */
.load-info-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    padding-right: 12px;

}

/* 범례 아이템 배열 */
.load-legend {
    display: flex;
    gap: 12px;
    font-size: 12px;
    margin: 8px 0 12px;
}

.lg-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}

/* 동그란 점 아이콘 */
.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.dot.low {
    background-color: #10b981;
    opacity: 0.8;
}

.dot.mid {
    background-color: #3b82f6;
    opacity: 0.8;
}

.dot.warn {
    background-color: #f59e0b;
    opacity: 0.8;
}

.dot.over {
    background-color: #ef4444;
    opacity: 0.8;
}

.pp-controls {
    align-items: flex-start;
}
</style>