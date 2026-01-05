<template>
    <div class="p-6 max-w-[1600px] mx-auto bg-gray-50 min-h-screen font-sans">
        <header class="flex justify-between items-end mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 tracking-tight">생산 및 작업 실행 통합 관리</h1>
                <p class="text-gray-500 mt-1 text-sm">생산 계획 확인부터 작업지시 생성, 실시간 실적 등록까지 한 번에 관리합니다.</p>
            </div>

            <div class="flex flex-col items-end gap-2">
                <span v-if="isNotToday"
                    class="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    ※ 작업지시는 당일만 생성 가능합니다
                </span>
                <div class="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                    <button @click="setToday"
                        class="px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 rounded transition">오늘</button>
                    <button @click="moveDate(-1)" class="p-1.5 hover:bg-gray-100 rounded transition">◀</button>
                    <input type="date" v-model="selectedDate" @change="fetchAllData"
                        class="border-none focus:ring-0 text-sm font-bold bg-transparent cursor-pointer" />
                    <button @click="moveDate(1)" class="p-1.5 hover:bg-gray-100 rounded transition">▶</button>
                </div>
            </div>
        </header>

        <div class="grid grid-cols-1 gap-8">

            <section class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                        오늘의 생산 계획 및 지시 대기
                    </h2>
                </div>

                <div class="p-6">
                    <div v-if="lineGroups.length === 0" class="text-center py-12 text-gray-400">조회된 생산 계획이 없습니다.</div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="group in lineGroups" :key="group.lineId"
                            class="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors bg-white relative overflow-hidden">
                            <div v-if="group.hasWorkOrder"
                                class="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                지시완료</div>

                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="font-bold text-gray-900 text-lg">{{ group.lineName }}</h3>
                                    <p class="text-xs text-gray-500">일일 최대 생산량: {{
                                        formatQuantity(group.dailyCapacity) }}
                                    </p>
                                </div>
                                <div class="flex gap-1">
                                    <button @click="onPrint(group)"
                                        class="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition" title="인쇄">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                    </button>
                                    <button @click="openCreateModal(group)" :disabled="group.hasWorkOrder || isNotToday"
                                        class="px-3 py-1.5 text-xs font-bold rounded-md transition shadow-sm"
                                        :class="group.hasWorkOrder ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'">
                                        지시생성
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-2 border-t pt-3">
                                <div v-for="item in group.items" :key="item.ppId" class="flex justify-between text-sm">
                                    <span class="text-gray-600 truncate max-w-[150px]">{{ item.materialName }}</span>
                                    <span class="font-semibold">{{ formatQuantity(item.dailyPlannedQuantity) }} <small
                                            class="text-gray-400 font-normal">{{ item.baseUnit }}</small></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                        실시간 작업 현황 및 제어
                    </h2>
                    <div class="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span class="flex items-center gap-1.5"><i class="w-2 h-2 rounded-full bg-emerald-500"></i>
                            가동중</span>
                        <span class="flex items-center gap-1.5"><i class="w-2 h-2 rounded-full bg-amber-500"></i>
                            일시중지</span>
                        <span class="flex items-center gap-1.5"><i class="w-2 h-2 rounded-full bg-gray-300"></i>
                            대기/완료</span>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50/50 text-gray-600 text-xs uppercase tracking-wider">
                                <th class="px-6 py-4 font-bold border-b">No</th>
                                <th class="px-6 py-4 font-bold border-b">작업지시번호 / 라인</th>
                                <th class="px-6 py-4 font-bold border-b">품목 정보</th>
                                <th class="px-6 py-4 font-bold border-b">계획 수량</th>
                                <th class="px-6 py-4 font-bold border-b">현재 상태</th>
                                <th class="px-6 py-4 font-bold border-b text-center">작업 제어 및 타이머</th>
                                <th class="px-6 py-4 font-bold border-b text-center">로그</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="(wo, idx) in woList" :key="wo.woId"
                                class="hover:bg-slate-50/50 transition-colors">
                                <td class="px-6 py-4 text-sm text-gray-400">{{ idx + 1 }}</td>
                                <td class="px-6 py-4">
                                    <div class="font-bold text-gray-900 text-sm">{{ wo.woCode }}</div>
                                    <div class="text-xs text-indigo-600 font-medium">{{ wo.lineName }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="font-bold text-gray-800 text-sm">{{ wo.materialName }}</div>
                                    <div class="text-xs text-gray-500">{{ wo.materialSpec }}</div>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-gray-700">
                                    {{ formatQuantity(wo.plannedQuantity) }} <span
                                        class="text-xs font-normal text-gray-400">{{ wo.baseUnit }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-tight"
                                        :class="statusBadgeClass(wo.woStatus)">
                                        {{ statusLabel(wo.woStatus) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-center gap-3">
                                        <button v-if="wo.woStatus === 'WO_READY'" @click="openStart(wo)"
                                            class="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm transition">
                                            ▶ 작업시작
                                        </button>

                                        <template v-else-if="wo.woStatus === 'WO_RUN' || wo.woStatus === 'WO_PAUSE'">
                                            <div class="font-mono font-black text-sm px-3 py-1.5 rounded-md shadow-inner min-w-[90px] text-center"
                                                :class="wo.woStatus === 'WO_RUN' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'">
                                                {{ formatHMS(displaySeconds[wo.woId] ?? 0) }}
                                            </div>
                                            <div class="flex gap-1">
                                                <button v-if="wo.woStatus === 'WO_RUN'" @click="openPause(wo)"
                                                    class="p-1.5 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition">⏸</button>
                                                <button v-else @click="resume(wo)"
                                                    class="p-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition">▶</button>
                                                <button @click="openEndConfirm(wo)"
                                                    class="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition">■</button>
                                            </div>
                                        </template>
                                        <span v-else class="text-gray-400 text-xs font-bold">작업 종료됨</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <button @click="openHistory(wo)"
                                        class="text-gray-400 hover:text-indigo-600 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mx-auto" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="woList.length === 0" class="p-20 text-center text-gray-400 font-medium">오늘 생성된 작업지시가
                        없습니다.</div>
                </div>
            </section>
        </div>

        <div v-if="activeModal === 'CREATE'"
            class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="text-xl font-bold text-gray-900">작업지시 생성 <span class="text-indigo-600 ml-2">[{{
                        selectedGroup.lineName }}]</span></h3>
                    <button @click="activeModal = null" class="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div class="p-6 space-y-6">
                    <div class="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div><span class="text-gray-500 mr-2 font-medium">작업일자</span> <span
                                class="font-bold text-gray-900">{{
                                    selectedDate }}</span></div>
                        <div><span class="text-gray-500 mr-2 font-medium">라인 CAPA</span> <span
                                class="font-bold text-gray-900">{{ formatQuantity(selectedGroup.dailyCapacity) }}</span>
                        </div>
                    </div>
                    <table class="w-full text-sm border-collapse">
                        <thead>
                            <tr class="text-left text-gray-500 border-b border-gray-100">
                                <th class="pb-2 font-medium">생산계획</th>
                                <th class="pb-2 text-right font-medium">계획량</th>
                                <th class="pb-2 text-right font-medium">지시량</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="pp in selectedGroup.items" :key="pp.ppId">
                                <td class="py-3 font-medium text-gray-700">{{ pp.ppCode }}</td>
                                <td class="py-3 text-right">{{ formatQuantity(pp.dailyPlannedQuantity) }}</td>
                                <td class="py-3 text-right">
                                    <input type="number" v-model.number="pp.workQuantity" @input="recalculateTotal"
                                        class="w-24 text-right border-gray-200 rounded-md text-sm font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span class="text-sm font-bold text-gray-600">총 작업지시 합계</span>
                        <div class="text-right">
                            <div class="text-2xl font-black"
                                :class="createQuantity > selectedGroup.dailyCapacity ? 'text-red-500' : 'text-indigo-600'">
                                {{
                                    formatQuantity(createQuantity) }}</div>
                            <p v-if="createQuantity > selectedGroup.dailyCapacity"
                                class="text-[10px] text-red-500 font-bold">
                                CAPA를 초과했습니다</p>
                        </div>
                    </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end gap-3">
                    <button @click="activeModal = null"
                        class="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition">취소</button>
                    <button @click="createWorkOrder"
                        :disabled="createQuantity <= 0 || createQuantity > selectedGroup.dailyCapacity"
                        class="px-8 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md">지시생성
                        완료</button>
                </div>
            </div>
        </div>

        <div v-if="activeModal === 'RESULT'"
            class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <header class="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-black uppercase tracking-tight">📝 생산 실적 등록</h3>
                        <p class="text-indigo-100 text-xs mt-0.5">{{ selectedWO?.woCode }} | {{ selectedWO?.materialName
                            }}</p>
                    </div>
                    <button @click="activeModal = null" class="text-white/80 hover:text-white text-2xl">✕</button>
                </header>
                <div class="p-8">
                    <div class="grid grid-cols-2 gap-8 mb-8">
                        <div class="space-y-4">
                            <div><label class="block text-xs font-black text-gray-500 mb-1.5 uppercase">양품 수량
                                    (Good)</label><input type="number" v-model.number="endForm.goodQuantity"
                                    class="w-full border-2 border-indigo-100 rounded-xl px-4 py-3 font-black text-indigo-600 focus:border-indigo-500 outline-none text-xl" />
                            </div>
                            <div><label class="block text-xs font-black text-red-400 mb-1.5 uppercase">불량 수량
                                    (Defective)</label><input type="number" v-model.number="endForm.defectiveQuantity"
                                    class="w-full border-2 border-red-50 rounded-xl px-4 py-3 font-black text-red-500 focus:border-red-400 outline-none text-xl" />
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div><label class="block text-xs font-black text-gray-500 mb-1.5 uppercase">시작/종료 시간</label>
                                <div class="flex items-center gap-2"><input type="time" v-model="endForm.startTime"
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /><span
                                        class="text-gray-400">~</span><input type="time" v-model="endForm.endTime"
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                            </div>
                            <div><label
                                    class="block text-xs font-black text-gray-500 mb-1.5 uppercase">비고</label><textarea
                                    v-model="endForm.note"
                                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 resize-none"
                                    placeholder="특이사항 입력"></textarea></div>
                        </div>
                    </div>
                    <div class="border-t pt-6">
                        <h4 class="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">아이템별 세부 생산 실적</h4>
                        <table class="w-full text-sm">
                            <tr v-for="item in previewItems" :key="item.workOrderItemId"
                                class="border-b border-gray-50">
                                <td class="py-3 font-bold text-gray-700">{{ item.itemName }}</td>
                                <td class="py-3 text-right text-gray-400 italic">계획: {{ item.plannedQuantity }}</td>
                                <td class="py-3 text-right"><input type="number" v-model.number="item.producedQuantity"
                                        class="w-24 text-right border-gray-200 rounded-md text-sm font-black text-indigo-600" />
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <footer class="px-8 py-6 bg-gray-50 flex justify-end gap-3"><button @click="activeModal = null"
                        class="px-6 py-2.5 text-sm font-bold text-gray-500">취소</button><button @click="end"
                        class="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">등록
                        완료</button></footer>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { getDailyPlanPreview, getMonthlyPlans } from '@/api/production/productionPlan.js'
import { getWorkOrdersByDate, startWorkOrder, pauseWorkOrder, resumeWorkOrder, endWorkOrder, getWorkOrderHistory, previewWorkOrderResult, createWorkOrder as createWorkOrderApi } from '@/api/production/workOrder.js'

// --- 1. 기본 데이터 및 날짜 상태 ---
const getKSTDateString = (date = new Date()) => {
    const kstOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(date.getTime() + kstOffset)
    return kstDate.toISOString().slice(0, 10)
}
const selectedDate = ref(getKSTDateString())
const today = getKSTDateString()
const isNotToday = computed(() => selectedDate.value !== today)

// --- 2. 목록 데이터 ---
const planPlans = ref([]) // 상단 계획 데이터
const woList = ref([])    // 하단 작업 현황 데이터

// --- 3. 모달 및 선택 상태 ---
const activeModal = ref(null) // 'CREATE', 'RESULT', 'HISTORY', 'START', 'PAUSE'
const selectedGroup = ref(null) // 지시 생성용 라인 그룹
const selectedWO = ref(null)    // 제어용 작업지시
const createQuantity = ref(0)
const previewItems = ref([])
const endForm = ref({ goodQuantity: 0, defectiveQuantity: 0, startTime: '09:00', endTime: '18:00', note: '' })

// --- 4. 타이머 로직 ---
const baseSeconds = ref({})
const runningSince = ref({})
const displaySeconds = ref({})
let tickId = null

// --- 5. 데이터 로딩 로직 통합 ---
const fetchAllData = async () => {
    // A. 상단 계획 프리뷰 로드
    const planData = await getDailyPlanPreview(selectedDate.value)
    planPlans.value = planData || []

    // B. 하단 작업지시 목록 로드
    const { data: woData } = await getWorkOrdersByDate(selectedDate.value)
    woList.value = woData || []

    // C. 타이머 초기화 및 동기화
    stopTick()
    baseSeconds.value = {}
    runningSince.value = {}
    displaySeconds.value = {}

    for (const wo of woList.value) {
        await syncTimer(wo)
    }
    startTick()
}

// --- 6. 그룹화 로직 (계획) ---
const lineGroups = computed(() => {
    const map = {}
    planPlans.value.forEach(row => {
        if (!map[row.lineId]) {
            map[row.lineId] = { lineId: row.lineId, lineName: row.lineName, dailyCapacity: row.dailyCapacity, hasWorkOrder: false, items: [], totalWoPlanned: 0 }
        }
        map[row.lineId].items.push(row)
        map[row.lineId].totalWoPlanned += row.woPlannedQuantity
        if (row.hasWorkOrder) map[row.lineId].hasWorkOrder = true
    })
    return Object.values(map)
})

// --- 7. 작업 제어 핸들러 ---
const openCreateModal = (group) => {
    selectedGroup.value = { ...group, items: group.items.map(pp => ({ ...pp, workQuantity: pp.recommendedQuantity })) }
    recalculateTotal()
    activeModal.value = 'CREATE'
}

const createWorkOrder = async () => {
    await createWorkOrderApi({
        lineId: selectedGroup.value.lineId,
        workDate: selectedDate.value,
        items: selectedGroup.value.items.map(pp => ({ ppId: pp.ppId, quantity: pp.workQuantity }))
    })
    activeModal.value = null
    await fetchAllData() // 생성 후 새로고침
}

const openStart = async (wo) => {
    if (!confirm(`${wo.materialName} 작업을 시작하시겠습니까?`)) return
    await startWorkOrder(wo.woId, '작업 시작')
    await fetchAllData()
}

const openPause = async (wo) => {
    await pauseWorkOrder(wo.woId, '일시 정지')
    await fetchAllData()
}

const resume = async (wo) => {
    await resumeWorkOrder(wo.woId, '작업 재개')
    await fetchAllData()
}

const openEndConfirm = async (wo) => {
    selectedWO.value = wo
    endForm.value = { goodQuantity: wo.plannedQuantity, defectiveQuantity: 0, startTime: '09:00', endTime: toHHMM(new Date()), note: '' }

    const { data: history } = await getWorkOrderHistory(wo.woId)
    const firstStart = history.find(h => h.action === 'START' || h.action === '작업 시작')
    if (firstStart) endForm.value.startTime = firstStart.actedAt.split(' ')[1].slice(0, 5)

    const { data } = await previewWorkOrderResult(wo.woId, { goodQuantity: endForm.value.goodQuantity })
    previewItems.value = data.items
    activeModal.value = 'RESULT'
}

const end = async () => {
    await endWorkOrder(selectedWO.value.woId, {
        ...endForm.value,
        startTime: `${selectedDate.value} ${endForm.value.startTime}:00`,
        endTime: `${selectedDate.value} ${endForm.value.endTime}:00`,
        items: previewItems.value.map(i => ({ workOrderItemId: i.workOrderItemId, producedQuantity: i.producedQuantity }))
    })
    activeModal.value = null
    await fetchAllData()
}

// --- 유틸리티 및 헬퍼 ---
const syncTimer = async (wo) => {
    const { data: history } = await getWorkOrderHistory(wo.woId)
    if (!Array.isArray(history)) return

    let elapsed = 0
    let open = null
    history.forEach(h => {
        const t = new Date(h.actedAt.replace(' ', 'T'))
        if (['START', 'RESUME', '작업 시작', '작업 재개'].includes(h.action)) open = t
        else if (['PAUSE', 'END', '일시 정지', '작업 종료'].includes(h.action) && open) {
            elapsed += Math.floor((t - open) / 1000)
            open = null
        }
    })
    baseSeconds.value[wo.woId] = elapsed
    if (wo.woStatus === 'WO_RUN' && open) runningSince.value[wo.woId] = open
    displaySeconds.value[wo.woId] = elapsed
}

const startTick = () => {
    tickId = setInterval(() => {
        const now = new Date()
        woList.value.forEach(wo => {
            if (wo.woStatus === 'WO_RUN' && runningSince.value[wo.woId]) {
                displaySeconds.value[wo.woId] = (baseSeconds.value[wo.woId] || 0) + Math.floor((now - runningSince.value[wo.woId]) / 1000)
            }
        })
    }, 1000)
}
const stopTick = () => { if (tickId) clearInterval(tickId) }

const statusBadgeClass = (s) => ({
    'WO_READY': 'bg-gray-100 text-gray-500',
    'WO_RUN': 'bg-emerald-100 text-emerald-600',
    'WO_PAUSE': 'bg-amber-100 text-amber-600',
    'WO_DONE': 'bg-slate-100 text-slate-400'
}[s])

const statusLabel = (s) => ({ WO_READY: '대기중', WO_RUN: '가동중', WO_PAUSE: '일시정지', WO_DONE: '완료' }[s])
const formatHMS = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const formatQuantity = (v) => v?.toLocaleString() || '0'
const toHHMM = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const moveDate = (diff) => {
    const d = new Date(selectedDate.value + 'T00:00:00'); d.setDate(d.getDate() + diff)
    selectedDate.value = getKSTDateString(d); fetchAllData()
}
const setToday = () => { selectedDate.value = today; fetchAllData() }
const recalculateTotal = () => { createQuantity.value = selectedGroup.value.items.reduce((sum, p) => sum + (p.workQuantity || 0), 0) }

onMounted(fetchAllData)
onBeforeUnmount(stopTick)

watch(() => endForm.value.goodQuantity, async (q) => {
    if (activeModal.value === 'RESULT') {
        const { data } = await previewWorkOrderResult(selectedWO.value.woId, { goodQuantity: q })
        previewItems.value = data.items
    }
})
</script>