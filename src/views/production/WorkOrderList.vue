아 취소..

<template>
    <div class="p-6 min-h-screen bg-gray-50 font-sans text-gray-800">

        <!-- ================= Header ================= -->
        <header class="flex justify-between items-end mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
                    작업지시 통합 관리
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                    생산계획 확인부터 작업지시 발행까지 한 화면에서 관리합니다.
                </p>
            </div>

            <div class="flex flex-col items-end gap-2">
                <span v-if="isNotToday"
                    class="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    ※ 작업지시는 당일만 생성 가능합니다
                </span>

                <div class="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                    <button @click="setToday"
                        class="px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 rounded transition">
                        오늘
                    </button>
                    <button @click="moveDate(-1)" class="p-1.5 hover:bg-gray-100 rounded">◀</button>
                    <input type="date" v-model="selectedDate" @change="fetchData"
                        class="border-none focus:ring-0 text-sm font-bold bg-transparent" />
                    <button @click="moveDate(1)" class="p-1.5 hover:bg-gray-100 rounded">▶</button>
                </div>
            </div>
        </header>

        <!-- ================= Line Dashboard ================= -->
        <div class="space-y-6">
            <section v-for="line in lineDashboard" :key="line.lineId"
                class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="grid grid-cols-1 xl:grid-cols-[320px_1fr]">

                    <!-- ===== Line Summary ===== -->
                    <div class="p-6 bg-gray-50 border-r">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-gray-500">
                                LINE {{ line.lineId }}
                            </span>
                            <span class="text-xs font-bold"
                                :class="line.totalUtilization > 100 ? 'text-red-500' : 'text-indigo-600'">
                                {{ line.totalUtilization > 100 ? '특근 가동' : '정상 가동' }}
                            </span>
                        </div>

                        <h2 class="text-lg font-bold text-gray-900">
                            {{ line.lineName }}
                        </h2>
                        <p class="text-sm text-gray-500 mb-4">
                            {{ line.materialName }}
                        </p>

                        <!-- Utilization -->
                        <div class="mb-4">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-500">작업지시 비율</span>
                                <span class="font-bold"
                                    :class="line.totalUtilization > 100 ? 'text-red-500' : 'text-indigo-600'">
                                    {{ line.totalUtilization }}%
                                </span>
                            </div>

                            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full transition-all"
                                    :class="line.totalUtilization > 100 ? 'bg-red-500' : 'bg-indigo-500'"
                                    :style="{ width: Math.min(line.totalUtilization, 100) + '%' }" />
                            </div>

                            <div class="flex justify-between text-[11px] text-gray-400 mt-1">
                                <span>지시 {{ formatQuantity(line.totalOrdered) }}</span>
                                <span>CAPA {{ formatQuantity(line.dailyCapacity) }}</span>
                            </div>
                        </div>

                        <button @click="openCreateModal(line)" :disabled="isNotToday" class="w-full py-3 text-sm font-bold rounded-xl transition
                bg-indigo-600 text-white hover:bg-indigo-700
                disabled:bg-gray-200 disabled:text-gray-400">
                            작업지시 생성
                        </button>
                    </div>

                    <!-- ===== Work Orders ===== -->
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-sm font-bold text-gray-500">
                                발행된 작업지시
                            </h3>
                            <span class="text-xs text-gray-400">
                                {{ line.workOrders.length }}건
                            </span>
                        </div>

                        <div v-if="line.workOrders.length === 0"
                            class="h-32 flex items-center justify-center text-gray-400 text-sm">
                            발행된 작업지시가 없습니다.
                        </div>

                        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div v-for="(wo, idx) in line.workOrders" :key="idx"
                                class="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition">
                                <div class="flex justify-between mb-3">
                                    <div>
                                        <div class="text-sm font-bold text-gray-900">
                                            {{ wo.woCode }}
                                        </div>
                                        <div class="text-xs text-gray-400">
                                            {{ wo.createdAt || '금일 발행' }}
                                        </div>
                                    </div>
                                    <button @click="onPrint(wo)" class="text-gray-400 hover:text-indigo-600 text-sm">
                                        인쇄
                                    </button>
                                </div>

                                <div class="space-y-2">
                                    <div v-for="item in wo.items" :key="item.ppId"
                                        class="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                        <div class="flex items-center gap-2">
                                            <button @click="handlePlanClick(item.ppId)"
                                                class="font-mono text-indigo-600 hover:underline text-xs">
                                                {{ item.ppCode || '긴급' }}
                                            </button>
                                            <span v-if="item.isEmergency"
                                                class="text-[10px] bg-amber-100 text-amber-600 px-1.5 rounded">
                                                긴급
                                            </span>
                                        </div>
                                        <span class="font-bold text-gray-700">
                                            {{ formatQuantity(item.quantity) }} {{ line.baseUnit }}
                                        </span>
                                    </div>
                                </div>

                                <div class="flex justify-between mt-3 pt-2 border-t text-sm">
                                    <span class="text-gray-400 font-bold">합계</span>
                                    <span class="font-bold text-gray-900">
                                        {{ formatQuantity(wo.totalQty) }} {{ line.baseUnit }}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>


        <div v-if="showCreateModal"
            class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div
                class="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
                <div class="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-black text-slate-900 tracking-tight italic">CREATE WORK ORDER</h3>
                        <p class="text-sm text-slate-500 font-medium mt-1">{{ selectedGroup.lineName }} / 발행일: {{
                            selectedDate }}</p>
                    </div>
                    <button @click="showCreateModal = false"
                        class="text-slate-400 hover:text-slate-900 font-black text-2xl transition-colors">✕</button>
                </div>

                <div class="p-8">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">배정 가능한 생산계획 리스트</h4>
                        <button @click="addEmergencyRow"
                            class="text-[11px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-all">+
                            계획외 긴급 작업 추가</button>
                    </div>

                    <div class="max-h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                        <table class="w-full text-sm">
                            <thead class="sticky top-0 bg-white shadow-sm z-10">
                                <tr
                                    class="text-left text-slate-400 font-black text-[10px] uppercase border-b border-slate-100">
                                    <th class="pb-3">Plan Code</th>
                                    <th class="pb-3 text-right">금일 계획</th>
                                    <th class="pb-3 text-right">기지시량</th>
                                    <th class="pb-3 text-right w-40 text-blue-600">신규 지시 수량</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <tr v-for="pp in selectedGroup.items" :key="pp.ppId">
                                    <td class="py-4">
                                        <span class="font-mono font-black text-slate-700">{{ pp.ppCode }}</span>
                                    </td>
                                    <td class="py-4 text-right font-bold text-slate-400">{{
                                        formatQuantity(pp.dailyPlannedQuantity) }}</td>
                                    <td class="py-4 text-right font-bold text-slate-300 italic">{{
                                        formatQuantity(pp.woPlannedQuantity) }}</td>
                                    <td class="py-4 text-right">
                                        <input type="number" v-model.number="pp.workQuantity" @input="recalculateTotal"
                                            class="w-32 text-right font-black border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:ring-0 transition-all text-blue-600 py-1.5" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-xl">
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">New Instruction
                                Total</p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-4xl font-black italic tracking-tighter text-blue-400">{{
                                    formatQuantity(createQuantity) }}</span>
                                <span class="text-xs font-bold text-slate-500 uppercase">/ Line Capa {{
                                    formatQuantity(selectedGroup.dailyCapacity) }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div v-if="(selectedGroup.totalOrdered + createQuantity) > selectedGroup.dailyCapacity"
                                class="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-[11px] font-black mb-2 animate-pulse inline-block">
                                ⚠ 특근 가동 필요 (Capa 초과)
                            </div>
                            <div
                                class="flex items-center gap-1 justify-end text-[10px] font-bold text-slate-400 mb-1 uppercase">
                                Expected Utilization: {{ Math.round(((selectedGroup.totalOrdered + createQuantity) /
                                    selectedGroup.dailyCapacity) * 100) }}%
                            </div>
                            <div class="h-2 w-48 bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-500 transition-all duration-500"
                                    :style="{ width: Math.min(((selectedGroup.totalOrdered + createQuantity) / selectedGroup.dailyCapacity) * 100, 100) + '%' }">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-8 bg-slate-50 flex justify-end gap-3">
                    <button @click="showCreateModal = false"
                        class="px-8 py-3 text-slate-400 font-black hover:text-slate-600 text-[13px] uppercase tracking-widest">Cancel</button>
                    <button @click="handleCreateWorkOrder" :disabled="createQuantity <= 0"
                        class="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[14px] hover:bg-slate-900 disabled:bg-slate-200 shadow-xl shadow-blue-100 transition-all uppercase tracking-widest">
                        Issue Work Order
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDailyPlanPreview } from '@/api/production/productionPlan.js'
import { createWorkOrder as createWorkOrderApi } from '@/api/production/workOrder.js'

// --- 유틸리티 및 기본 데이터 ---
const getKSTDateString = (date = new Date()) => {
    const kstOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(date.getTime() + kstOffset)
    return kstDate.toISOString().slice(0, 10)
}

const selectedDate = ref(getKSTDateString())
const today = getKSTDateString()
const isNotToday = computed(() => selectedDate.value !== today)

const planPlans = ref([]) // 서버 데이터 (PP 정보 + WO 매핑 정보 포함)
const showCreateModal = ref(false)
const selectedGroup = ref(null)
const createQuantity = ref(0)

// --- 핵심 비즈니스 로직: 라인 대시보드 데이터 가공 ---
const lineDashboard = computed(() => {
    const map = {}

    // 1. 서버 데이터를 라인별로 그룹화 (계획이 있든 없든 라인은 마스터 데이터를 기반으로 나타나야 함)
    // 실제 운영 시에는 '모든 라인 목록 API'와 '생산계획 API'를 merge해야 하지만, 
    // 여기서는 planPlans의 데이터 구조를 활용하여 그룹화합니다.
    planPlans.value.forEach(row => {
        if (!map[row.lineId]) {
            map[row.lineId] = {
                lineId: row.lineId,
                lineName: row.lineName,
                materialName: row.materialName,
                dailyCapacity: row.dailyCapacity,
                baseUnit: row.baseUnit,
                items: [],        // 이 라인에 할당된 모든 PP들
                workOrders: [],   // 이 라인에 발행된 개별 지시서 문서들
                totalOrdered: 0
            }
        }

        // 해당 라인의 가용 계획(PP) 추가
        map[row.lineId].items.push(row)

        // 만약 이 계획(PP)이 이미 특정 작업지시서(WO)에 포함되어 있다면
        if (row.hasWorkOrder && row.woId) {
            let wo = map[row.lineId].workOrders.find(w => w.id === row.woId)
            if (!wo) {
                wo = {
                    id: row.woId,
                    woCode: row.woCode || `WO-${row.woId}`,
                    createdAt: row.woCreatedAt,
                    items: [],
                    totalQty: 0
                }
                map[row.lineId].workOrders.push(wo)
            }
            wo.items.push({
                ppId: row.ppId,
                ppCode: row.ppCode,
                quantity: row.woPlannedQuantity,
                isEmergency: row.isEmergency || false
            })
            wo.totalQty += row.woPlannedQuantity
            map[row.lineId].totalOrdered += row.woPlannedQuantity
        }
    })

    return Object.values(map).map(line => ({
        ...line,
        totalUtilization: line.dailyCapacity > 0 ? Math.round((line.totalOrdered / line.dailyCapacity) * 100) : 0
    }))
})

// --- 스타일 및 시각화 헬퍼 ---
const utilizationColor = (rate) => {
    if (rate > 100) return 'text-amber-500 shadow-amber-100'
    if (rate >= 90) return 'text-emerald-500'
    return 'text-blue-600'
}

const progressColor = (rate) => {
    if (rate > 100) return 'bg-amber-500'
    if (rate >= 90) return 'bg-emerald-500'
    return 'bg-blue-600'
}

// --- 이벤트 핸들러 ---
const fetchData = async () => {
    try {
        const data = await getDailyPlanPreview(selectedDate.value)
        planPlans.value = data || []
    } catch (e) {
        console.error("데이터 로딩 실패", e)
    }
}

const openCreateModal = (line) => {
    // 깊은 복사로 원본 보호 및 지시 입력값 초기화
    selectedGroup.value = JSON.parse(JSON.stringify(line))
    selectedGroup.value.items.forEach(pp => {
        // 기본값: 남은 계획량 전체 (계획량 - 이미 지시된 양)
        pp.workQuantity = Math.max(0, pp.dailyPlannedQuantity - (pp.woPlannedQuantity || 0))
    })
    recalculateTotal()
    showCreateModal.value = true
}

const recalculateTotal = () => {
    createQuantity.value = selectedGroup.value.items.reduce((sum, p) => sum + (p.workQuantity || 0), 0)
}

const addEmergencyRow = () => {
    // 계획 외 긴급 생산 추가 (PP 연결 없이 지시서 아이템 추가)
    selectedGroup.value.items.push({
        ppId: null,
        ppCode: '긴급/특근작업',
        dailyPlannedQuantity: 0,
        woPlannedQuantity: 0,
        workQuantity: 0,
        isEmergency: true
    })
}

const handleCreateWorkOrder = async () => {
    try {
        // 필터링: 수량이 입력된 것만 서버로 전송
        const payload = {
            lineId: selectedGroup.value.lineId,
            workDate: selectedDate.value,
            items: selectedGroup.value.items
                .filter(pp => pp.workQuantity > 0)
                .map(pp => ({
                    ppId: pp.ppId, // null이면 계획 외 지시로 처리됨 (백엔드 스펙에 따름)
                    quantity: pp.workQuantity,
                    isEmergency: pp.isEmergency || false
                }))
        }

        await createWorkOrderApi(payload)
        showCreateModal.value = false
        fetchData()
    } catch (e) {
        alert("작업지시서 발행 중 오류가 발생했습니다.")
    }
}

const moveDate = (val) => {
    const d = new Date(selectedDate.value + 'T00:00:00')
    d.setDate(d.getDate() + val)
    selectedDate.value = getKSTDateString(d)
    fetchData()
}

const setToday = () => { selectedDate.value = today; fetchData() }
const formatQuantity = (v) => v?.toLocaleString() || '0'
const onPrint = (wo) => console.log("Printing WO Document:", wo)
const handlePlanClick = (ppId) => console.log("Redirecting to PP Detail:", ppId)

onMounted(fetchData)
</script>

<style scoped>
/* Industrial Dashboard 세부 스타일 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* 애니메이션 */
.animate-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>