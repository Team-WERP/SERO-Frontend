<template>
    <div class="p-1 min-h-screen font-sans bg-gray-50">
        <div class="mb-5 flex justify-between items-end">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">생산계획 관리</h1>
                <p class="text-sm text-gray-500">
                    생산요청 품목에 대해 월별로 생산계획을 수립합니다.
                </p>
            </div>
            <div class="flex justify-end items-start flex-1">
                <div class="flex flex-col gap-2 items-end">
                    <div class="flex items-center gap-1.5">
                        <button
                            class="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            @click="setThisMonth">이번 달</button>
                        <button
                            class="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            @click="prevMonth">◀</button>
                        <input type="month" v-model="month"
                            class="px-2.5 py-1.5 text-sm font-semibold border border-gray-300 rounded-md bg-white text-gray-900 outline-none hover:border-indigo-500 cursor-pointer" />
                        <button
                            class="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            @click="nextMonth">▶</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-3">
            <div class="flex flex-col">
                <div class="flex bg-slate-50 border-b-2 border-gray-200">
                    <div class="w-[220px] shrink-0 p-3 px-5 border-r border-gray-200 font-bold text-slate-600">라인 / 날짜
                    </div>
                    <div class="flex-grow overflow-hidden" ref="ganttHeaderRef">
                        <div class="flex h-[50px] w-full">
                            <div v-for="d in daysInMonth" :key="d"
                                class="flex-1 min-w-[30px] border-r border-slate-100 flex flex-col items-center justify-center relative"
                                :class="{ 'bg-red-50 text-red-600': isToday(d) }">
                                <span class="text-xs font-semibold"
                                    :class="isWeekend(d) ? 'text-slate-400' : 'text-slate-600'">{{ d }}</span>
                                <span v-if="isToday(d)"
                                    class="absolute top-0.5 text-[8px] font-black bg-red-600 text-white px-1 rounded">TODAY</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="overflow-y-auto">
                    <div v-for="(line, idx) in lines" :key="line.lineId" class="flex border-b border-gray-200 bg-white"
                        :class="{ 'bg-slate-50/50': idx % 2 === 1 }">

                        <div
                            class="w-[220px] shrink-0 p-3 px-5 border-r border-gray-200 flex flex-col justify-center bg-inherit z-10">
                            <div class="font-bold text-slate-800 text-base leading-tight">{{ line.lineName }}</div>
                            <div class="text-[13px] text-slate-400 flex flex-col mt-1">
                                <span>제품명: {{ line.materialName || '미지정' }}</span>
                                <span class="truncate">일일 최대: {{ formatNumber(line.dailyCapacity) }}{{ line.unit
                                }}</span>
                            </div>
                        </div>

                        <div class="flex-grow overflow-x-auto relative" @scroll="syncScroll">
                            <div class="flex relative"
                                :style="{ width: '100%', height: (maxLaneCount(line.lineId) * 44 + 12) + 'px' }">
                                <div v-for="d in daysInMonth" :key="d"
                                    class="flex-1 min-w-[30px] border-r border-slate-100 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[6px] before:opacity-80"
                                    :class="[
                                        isToday(d) ? 'bg-red-50/30' : '',
                                        getLoadTailwindClass(line.lineId, d)
                                    ]" />

                                <div class="absolute inset-0 pointer-events-none">
                                    <div v-for="plan in plansByLine[line.lineId] || []" :key="plan.ppId"
                                        class="absolute pointer-events-auto cursor-pointer rounded-lg text-white z-20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:z-30 overflow-hidden"
                                        :class="plan.status === 'PP_DRAFT' ? 'bg-emerald-500' : 'bg-indigo-500'"
                                        :style="barStyle(plan)" @click="openPlan(plan)"
                                        @mouseenter="showTooltip($event, plan)" @mouseleave="hideTooltip">
                                        <div class="p-1 px-2 flex flex-col h-full justify-center">
                                            <span class="text-[13px] font-bold truncate">
                                                {{ plan.ppCode }}
                                            </span>
                                            <span class="absolute top-1 right-1 text-[11px] opacity-70">
                                                ↗
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="lines.length === 0" class="p-10 text-center text-gray-400">데이터가 없습니다.</div>
                </div>
            </div>

            <div class="flex flex-col items-end p-3 pr-5">
                <div class="flex gap-3 text-[13px] font-medium text-slate-500">
                    <span>라인 부하율 :</span>
                    <span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-blue-500"></i> 보통
                        (50~80%)</span>
                    <span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-amber-500"></i> 주의
                        (80~100%)</span>
                    <span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-red-500"></i> 초과
                        (100%+)</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 p-5 mt-3">
            <div class="mb-4">
                <div class="text-lg font-bold flex items-center gap-2">
                    미편성 생산요청
                    <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{{ unassigned.length }}</span>
                </div>
                <div class="text-sm text-gray-500 mt-1">항목을 클릭하여 생산 일정을 등록하세요.</div>
            </div>

            <div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                <div v-for="u in unassigned" :key="u.prItemId" @click="openCreate(u)"
                    class="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 flex flex-col">

                    <div class="flex justify-between items-center mb-2.5">
                        <span class="text-[13px] font-extrabold text-gray-900 tracking-tight">{{ u.prCode }}</span>
                        <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                            :class="getDdayTailwindClass(u.dueAt)">
                            D-{{ calcDday(u.dueAt) }}
                        </span>
                    </div>

                    <div class="text-lg font-extrabold text-slate-800 mb-3.5">{{ u.itemName }}</div>

                    <div class="flex flex-col gap-1.5 text-sm">
                        <div class="flex justify-between font-medium">
                            <span class="text-gray-400">규격</span>
                            <span class="text-gray-900">{{ u.spec }}</span>
                        </div>
                        <div class="flex justify-between font-medium">
                            <span class="text-gray-400">요청 수량</span>
                            <span class="text-gray-900">{{ formatNumber(u.requestedQuantity) }} ea</span>
                        </div>
                        <div class="flex justify-between font-medium">
                            <span class="text-gray-400">납기일</span>
                            <span class="text-gray-900">{{ formatDate(u.dueAt) }}</span>
                        </div>
                        <div class="flex justify-between font-medium border-t border-gray-50 pt-1.5 mt-1">
                            <span class="text-gray-400">생산 라인</span>
                            <span class="text-indigo-600 font-bold">{{ u.productionLineName }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="unassigned.length === 0" class="col-span-full py-10 text-center text-gray-400 text-sm">
                    미편성 목록이 비어있습니다.
                </div>
            </div>
        </div>

        <PlanCreateModal v-if="showPlanModal" :prItemId="selectedPrItemId" :defaultLineId="selectedLineId"
            :month="month" @close="showPlanModal = false" @created="onCreated" />
        <PPDetailModal v-if="showDetailModal && selectedPpId !== null" :ppId="selectedPpId"
            @close="showDetailModal = false" />

        <Teleport to="body">
            <div v-show="tooltip.visible"
                class="fixed bg-gray-900/95 text-white text-[14px] leading-relaxed p-2.5 px-3.5 rounded-lg whitespace-pre-line z-[99999] pointer-events-none shadow-xl max-w-[300px]"
                :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translateX(-50%)' }">
                {{ tooltip.text }}
            </div>
        </Teleport>
    </div>
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
const BAR_HEIGHT = 30
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

const getLoadTailwindClass = (lineId, day) => {
    const summary = dailySummaryMap.value[lineId]
    if (!summary || !summary.dailyPlannedQtyMap) return ''
    const planned = summary.dailyPlannedQtyMap[day] || 0
    const capa = summary.dailyCapacity || 0
    if (capa === 0) return ''
    const rate = planned / capa
    if (rate > 1) return 'before:bg-red-500'
    if (rate >= 0.8) return 'before:bg-amber-500'
    if (rate >= 0.5) return 'before:bg-blue-500'
    return ''
}

const getDdayTailwindClass = (dueAt) => {
    const d = calcDday(dueAt)
    if (d <= 3) return 'bg-red-50 text-red-700'
    if (d <= 7) return 'bg-orange-50 text-orange-700'
    return 'bg-emerald-50 text-emerald-700'
}

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
    dailySummary.value = await getDailyLineSummary(month.value, 3)
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

const formatDate = (d) => {
    if (!d) return '-'
    return d.slice(0, 10) // YYYY-MM-DD
}

</script>