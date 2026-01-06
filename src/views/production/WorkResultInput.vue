<template>
    <div class="p-1.5 font-sans text-gray-900">
        <div class="flex justify-between items-end mb-5">
            <div>
                <h1 class="text-[28px] font-bold text-gray-900">작업지시 실적 등록</h1>
                <p class="text-sm text-gray-500">당일 작업지시를 시작·중지·종료하고 실적을 등록합니다.</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-semibold text-sm">작업일</span>
                <input type="date" v-model="selectedDate" @change="fetchList"
                    class="px-3 py-1.5 border border-gray-300 rounded-md font-semibold text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="px-5 py-4 flex justify-between items-center border-b border-gray-100 font-semibold">
                <span>총 {{ list.length }}건</span>
                <div class="flex items-center gap-2.5 text-xs text-gray-500">
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> 일시
                        중단</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> 가동
                        중</span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-center">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">No</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">작업지시번호</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">라인</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">품목명</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">규격</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">계획수량</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">상태</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">작업제어</th>
                            <th class="p-3.5 text-gray-600 text-xs font-semibold uppercase">로그</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="(wo, idx) in list" :key="wo.woId" class="hover:bg-gray-50 transition-colors">
                            <td class="p-3.5 text-sm">{{ idx + 1 }}</td>
                            <td class="p-3.5 text-sm font-bold">{{ wo.woCode }}</td>
                            <td class="p-3.5 text-sm">{{ wo.lineName }}</td>
                            <td class="p-3.5 text-sm font-semibold">{{ wo.materialName }}</td>
                            <td class="p-3.5 text-sm text-gray-600">{{ wo.materialSpec }}</td>
                            <td class="p-3.5 text-sm font-bold">{{ wo.plannedQuantity.toLocaleString() }} {{ wo.baseUnit
                            }}</td>
                            <td class="p-3.5">
                                <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold" :class="{
                                    'bg-green-100 text-green-800': wo.woStatus === 'WO_RUN',
                                    'bg-amber-100 text-amber-800': wo.woStatus === 'WO_PAUSE',
                                    'bg-gray-100 text-gray-500': wo.woStatus === 'WO_DONE' || wo.woStatus === 'WO_READY'
                                }">
                                    {{ statusLabel(wo.woStatus) }}
                                </span>
                            </td>

                            <td class="p-3.5">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button v-if="wo.woStatus === 'WO_READY'"
                                        class="h-8 px-3 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 transition-colors"
                                        @click="openStart(wo)">
                                        ▶ 시작
                                    </button>

                                    <template v-else-if="wo.woStatus === 'WO_RUN'">
                                        <div
                                            class="font-mono font-black px-2.5 py-1 rounded text-sm min-w-[92px] bg-blue-600 text-white">
                                            {{ formatHMS(displaySeconds[wo.woId] ?? 0) }}
                                        </div>
                                        <button
                                            class="w-8 h-8 bg-amber-500 text-white rounded font-black hover:bg-amber-600"
                                            @click="openPause(wo)">⏸</button>
                                        <button
                                            class="w-8 h-8 bg-red-500 text-white rounded font-black hover:bg-red-600"
                                            @click="openEndConfirm(wo)">■</button>
                                    </template>

                                    <template v-else-if="wo.woStatus === 'WO_PAUSE'">
                                        <div
                                            class="font-mono font-black px-2.5 py-1 rounded text-sm min-w-[92px] bg-amber-500 text-white">
                                            {{ formatHMS(displaySeconds[wo.woId] ?? 0) }}
                                        </div>
                                        <button
                                            class="w-8 h-8 bg-amber-500 text-white rounded font-black hover:bg-amber-600"
                                            @click="resume(wo)">▶</button>
                                        <button
                                            class="w-8 h-8 bg-red-500 text-white rounded font-black hover:bg-red-600"
                                            @click="openEndConfirm(wo)">■</button>
                                    </template>

                                    <span v-else class="text-gray-400 font-bold text-sm">작업 종료됨</span>
                                </div>
                            </td>

                            <td class="p-3.5">
                                <button
                                    class="bg-white border border-gray-300 rounded p-1 hover:bg-gray-50 transition-colors"
                                    @click="openHistory(wo)">
                                    🧾
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="['START', 'PAUSE', 'END_CONFIRM'].includes(activeModal)"
            class="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000]">
            <div class="w-80 p-7.5 text-center bg-white rounded-2xl shadow-xl p-8">
                <div class="w-15 h-15 w-[60px] h-[60px] rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white font-black"
                    :class="{
                        'bg-blue-600': activeModal === 'START',
                        'bg-amber-500': activeModal === 'PAUSE',
                        'bg-red-500': activeModal === 'END_CONFIRM'
                    }">
                    {{ activeModal === 'START' ? '▶' : activeModal === 'PAUSE' ? '⏸' : '■' }}
                </div>

                <h3 class="text-xl font-bold mb-3">
                    {{ activeModal === 'START' ? '작업 시작' : activeModal === 'PAUSE' ? '일시 중지' : '작업 종료' }}
                </h3>

                <p v-if="activeModal === 'START'" class="text-gray-600">
                    <strong>{{ selectedWO?.materialName }}</strong> 작업을 시작하시겠습니까?
                </p>
                <p v-else-if="activeModal === 'PAUSE'" class="text-gray-600">
                    현재 작업을 일시 중지하시겠습니까?
                </p>
                <p v-else class="text-gray-600">
                    작업을 종료하고 생산 실적을 등록합니다.
                </p>

                <div class="flex gap-2 mt-5 justify-center">
                    <button class="px-5 py-2.5 rounded-lg font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                        @click="closeModal">아니오</button>
                    <button v-if="confirmMeta" class="px-5 py-2.5 rounded-lg font-semibold text-white transition-colors"
                        :class="{
                            'bg-blue-600 hover:bg-blue-700': confirmMeta.class === 'primary',
                            'bg-amber-500 hover:bg-amber-600': confirmMeta.class === 'warning',
                            'bg-red-500 hover:bg-red-600': confirmMeta.class === 'danger'
                        }" @click="confirmMeta.action">
                        {{ confirmMeta.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="activeModal === 'RESULT'"
            class="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000]">
            <div class="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden">
                <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
                    <div class="font-black text-base text-lg">📝 생산 실적 등록</div>
                    <button class="text-2xl leading-none hover:opacity-70" @click="closeModal">✕</button>
                </header>

                <div class="p-6">
                    <div class="bg-slate-50 p-4 rounded-lg mb-5 border border-slate-200 text-sm">
                        <div class="mb-1.5">작업 지시 번호: <strong class="ml-1">{{ selectedWO?.woCode }}</strong></div>
                        <div>품목명: <span class="text-blue-600 font-extrabold ml-1">{{ selectedWO?.materialName }}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="block text-xs font-extrabold text-gray-600">양품 수량</label>
                            <input type="number" v-model.number="endForm.goodQuantity"
                                class="w-full px-3 py-2 border-2 border-blue-600 rounded-md focus:outline-none" />
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-xs font-extrabold text-red-500">불량 수량</label>
                            <input type="number" v-model.number="endForm.defectiveQuantity"
                                class="w-full px-3 py-2 border-2 border-red-500 rounded-md focus:outline-none" />
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-xs font-extrabold text-gray-600">작업 시작</label>
                            <input type="time" v-model="endForm.startTime"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-xs font-extrabold text-gray-600">작업 종료</label>
                            <input type="time" v-model="endForm.endTime"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <div class="col-span-2 space-y-1.5">
                            <label class="block text-xs font-extrabold text-gray-600">비고 (메모)</label>
                            <textarea v-model="endForm.note" placeholder="특이사항을 입력하세요"
                                class="w-full h-20 px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                        </div>

                        <div class="col-span-2 mt-4">
                            <label class="block text-xs font-extrabold text-gray-600 mb-2">아이템별 생산 수량</label>
                            <div class="border border-gray-100 rounded-lg overflow-hidden">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-50 border-b">
                                        <tr>
                                            <th class="p-2 font-semibold">품목명</th>
                                            <th class="p-2 font-semibold">계획 수량</th>
                                            <th class="p-2 font-semibold text-right">생산 수량</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in previewItems" :key="item.workOrderItemId"
                                            class="border-b last:border-0 text-center">
                                            <td class="p-2">{{ item.itemName }}</td>
                                            <td class="p-2">{{ item.plannedQuantity }}</td>
                                            <td class="p-2 text-right">
                                                <input type="number" v-model.number="item.producedQuantity" min="0"
                                                    class="w-24 px-2 py-1 border border-gray-300 rounded text-right" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="p-6 pt-0 flex justify-end gap-2.5">
                    <button class="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                        @click="closeModal">취소</button>
                    <button
                        class="px-5 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        @click="end">등록 완료</button>
                </footer>
            </div>
        </div>

        <div v-if="activeModal === 'HISTORY'" class="fixed inset-0 bg-black/40 z-[1000]" @click.self="closeModal">
            <div class="fixed right-0 top-0 bottom-0 w-[380px] bg-white shadow-2xl flex flex-col animate-slide-in">
                <header class="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div class="text-lg font-black italic">🕒 작업 로그</div>
                    <button class="text-xl text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
                </header>

                <div class="flex-1 p-6 overflow-y-auto relative">
                    <div class="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gray-200"></div>

                    <div v-for="(h, i) in historyList" :key="i" class="relative pl-10 mb-8">
                        <div
                            class="absolute left-[3px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-[3px] border-white ring-2 ring-blue-600 z-10">
                        </div>
                        <div class="flex flex-col">
                            <div class="font-black text-[15px] mb-1">{{ historyLabel(h.action) }}</div>
                            <div class="text-xs text-gray-400 mb-2">{{ h.actedAt }}</div>
                            <div v-if="h.note"
                                class="bg-gray-100 p-3 rounded-lg text-[13px] leading-relaxed text-gray-600">
                                {{ h.note }}
                            </div>
                        </div>
                    </div>

                    <div v-if="historyList.length === 0" class="text-center py-10 text-gray-400 font-bold">
                        로그가 없습니다.
                    </div>
                </div>

                <footer class="p-4 border-t border-gray-100">
                    <button
                        class="w-full py-3 bg-white border border-gray-300 rounded-lg font-extrabold hover:bg-gray-50 transition-colors"
                        @click="closeModal">닫기</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
    getWorkOrdersByDate,
    startWorkOrder,
    pauseWorkOrder,
    resumeWorkOrder,
    endWorkOrder,
    getWorkOrderHistory,
    previewWorkOrderResult
} from '@/api/production/workOrder.js'

const getTodayKST = () => {
    const now = new Date()
    const kstOffset = 9 * 60 * 60 * 1000
    const kst = new Date(now.getTime() + kstOffset)
    return kst.toISOString().slice(0, 10)
}

const selectedDate = ref(getTodayKST())
const list = ref([])
const activeModal = ref(null)
const selectedWO = ref(null)
const historyList = ref([])
const previewItems = ref([])

const endForm = ref({
    goodQuantity: 0,
    defectiveQuantity: 0,
    startTime: '09:00',
    endTime: '18:00',
    note: ''
})

const parseDT = (str) => {
    if (!str) return null
    const iso = String(str).replace(' ', 'T')
    const d = new Date(iso)
    return isNaN(d.getTime()) ? null : d
}

const isStart = (a) => ['START', '작업 시작', '작업시작'].includes(a)
const isResume = (a) => ['RESUME', '작업 재개', '작업재개'].includes(a)
const isPause = (a) => ['PAUSE', '일시 정지', '일시정지'].includes(a)
const isEnd = (a) => ['END', '작업 종료', '작업 완료', '작업종료', '작업완료'].includes(a)

const calcElapsedFromHistory = (history) => {
    let elapsed = 0
    let open = null
    for (const h of history) {
        const t = parseDT(h.actedAt)
        if (!t) continue
        if (isStart(h.action) || isResume(h.action)) {
            open = t
        } else if (isPause(h.action) || isEnd(h.action)) {
            if (open) {
                elapsed += Math.max(0, Math.floor((t - open) / 1000))
                open = null
            }
        }
    }
    return { elapsed, runningFrom: open }
}

const baseSeconds = ref({})
const runningSince = ref({})
const displaySeconds = ref({})
let tickId = null

const startTick = () => {
    if (tickId) return
    tickId = setInterval(() => {
        const now = new Date()
        for (const wo of list.value) {
            const id = wo.woId
            const base = baseSeconds.value[id] ?? 0
            const from = runningSince.value[id]
            if (wo.woStatus === 'WO_RUN' && from instanceof Date) {
                displaySeconds.value[id] = base + Math.max(0, Math.floor((now - from) / 1000))
            } else {
                displaySeconds.value[id] = base
            }
        }
    }, 1000)
}

const stopTick = () => { if (tickId) clearInterval(tickId); tickId = null }

const syncOneWO = async (wo) => {
    const { data: history } = await getWorkOrderHistory(wo.woId)
    if (!Array.isArray(history)) return
    const { elapsed, runningFrom } = calcElapsedFromHistory(history)
    baseSeconds.value[wo.woId] = elapsed
    if (wo.woStatus === 'WO_RUN' && runningFrom) {
        runningSince.value[wo.woId] = runningFrom
    } else {
        delete runningSince.value[wo.woId]
    }
    displaySeconds.value[wo.woId] = elapsed
}

const fetchList = async () => {
    const { data } = await getWorkOrdersByDate(selectedDate.value)
    list.value = data || []
    baseSeconds.value = {}
    runningSince.value = {}
    displaySeconds.value = {}
    for (const wo of list.value) await syncOneWO(wo)
    startTick()
}

const openStart = (wo) => { selectedWO.value = wo; activeModal.value = 'START' }
const openPause = (wo) => { selectedWO.value = wo; activeModal.value = 'PAUSE' }
const openEndConfirm = (wo) => { selectedWO.value = wo; activeModal.value = 'END_CONFIRM' }

const toHHMM = (d) => {
    if (!(d instanceof Date)) return ''
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getFirstStartTime = (history) => {
    if (!Array.isArray(history)) return null
    return history
        .filter(h => isStart(h.action))
        .map(h => parseDT(h.actedAt))
        .filter(d => d instanceof Date)
        .sort((a, b) => a - b)[0] || null
}

const openResult = async () => {
    const woId = selectedWO.value.woId
    endForm.value.goodQuantity = selectedWO.value?.plannedQuantity ?? 0
    endForm.value.defectiveQuantity = 0
    endForm.value.note = ''
    const { data: history } = await getWorkOrderHistory(woId)
    const firstStart = getFirstStartTime(history)
    endForm.value.startTime = firstStart ? toHHMM(firstStart) : ''
    endForm.value.endTime = toHHMM(new Date())
    const { data } = await previewWorkOrderResult(woId, { goodQuantity: endForm.value.goodQuantity })
    previewItems.value = data.items
    activeModal.value = 'RESULT'
}

const openHistory = async (wo) => {
    selectedWO.value = wo
    const { data } = await getWorkOrderHistory(wo.woId)
    historyList.value = data || []
    activeModal.value = 'HISTORY'
}

const closeModal = () => { activeModal.value = null; selectedWO.value = null; historyList.value = [] }

const start = async () => {
    await startWorkOrder(selectedWO.value.woId, '작업 시작')
    closeModal(); await fetchList()
}
const pause = async () => {
    await pauseWorkOrder(selectedWO.value.woId, '일시 정지')
    closeModal(); await fetchList()
}
const resume = async (wo) => {
    await resumeWorkOrder(wo.woId, '작업 재개')
    await fetchList()
}
const end = async () => {
    await endWorkOrder(selectedWO.value.woId, {
        goodQuantity: endForm.value.goodQuantity,
        defectiveQuantity: endForm.value.defectiveQuantity,
        startTime: `${selectedDate.value} ${endForm.value.startTime}:00`,
        endTime: `${selectedDate.value} ${endForm.value.endTime}:00`,
        note: endForm.value.note,
        items: previewItems.value.map(i => ({
            workOrderItemId: i.workOrderItemId,
            producedQuantity: i.producedQuantity
        }))
    })
    closeModal(); await fetchList()
}

const confirmMeta = computed(() => {
    if (activeModal.value === 'START') return { label: '작업 시작', action: start, class: 'primary' }
    if (activeModal.value === 'PAUSE') return { label: '일시 중지', action: pause, class: 'warning' }
    if (activeModal.value === 'END_CONFIRM') return { label: '종료 후 실적 등록', action: openResult, class: 'danger' }
    return null
})

const statusLabel = (s) => ({ WO_READY: '대기', WO_RUN: '진행중', WO_PAUSE: '일시정지', WO_DONE: '완료' }[s] || s)
const historyLabel = (a) => ({ START: '작업 시작', PAUSE: '일시 정지', RESUME: '작업 재개', END: '작업 완료' }[a] || a)

const formatHMS = (sec) => {
    const s = Math.max(0, Number(sec) || 0)
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${ss}`
}

watch(() => endForm.value.goodQuantity, async (qty) => {
    if (!selectedWO.value) return
    const { data } = await previewWorkOrderResult(selectedWO.value.woId, { goodQuantity: qty })
    previewItems.value = data.items
})

onMounted(fetchList)
onBeforeUnmount(stopTick)
</script>

<style scoped>
/* Tailwind로 표현하기 어려운 특정 애니메이션만 남김 */
@keyframes slideIn {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}

.animate-slide-in {
    animation: slideIn 0.3s ease-out;
}
</style>