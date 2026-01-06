<template>
    <div class="p-6 min-h-screen bg-gray-50 font-sans text-gray-800">

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

        <div class="space-y-6">
            <section v-for="line in lineDashboard" :key="line.lineId"
                class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="grid grid-cols-1 xl:grid-cols-[320px_1fr]">

                    <div class="p-6 bg-gray-50 border-r">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-gray-500 uppercase">
                                LINE {{ line.lineId }}
                            </span>
                            <span class="text-xs font-bold px-2 py-0.5 rounded"
                                :class="line.totalUtilization > 100 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'">
                                {{ line.totalUtilization > 100 ? '특근 가동' : '정상 가동' }}
                            </span>
                        </div>

                        <h2 class="text-lg font-bold text-gray-900">
                            {{ line.lineName }}
                        </h2>
                        <p class="text-sm text-gray-500 mb-4">
                            생산 품목: {{ line.materialName || '미지정' }}
                        </p>

                        <div class="mb-4">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-500 font-medium">지시 대비 가동률</span>
                                <span class="font-bold"
                                    :class="line.totalUtilization > 100 ? 'text-red-500' : 'text-indigo-600'">
                                    {{ line.totalUtilization }}%
                                </span>
                            </div>

                            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full transition-all duration-500"
                                    :class="line.totalUtilization > 100 ? 'bg-red-500' : 'bg-indigo-500'"
                                    :style="{ width: Math.min(line.totalUtilization, 100) + '%' }" />
                            </div>

                            <div class="flex justify-between text-[11px] text-gray-400 mt-1">
                                <span>총 지시량 {{ formatQuantity(line.totalOrdered) }}</span>
                                <span>CAPA {{ formatQuantity(line.dailyCapacity) }}</span>
                            </div>
                        </div>

                        <button @click="openCreateModal(line)" :disabled="isNotToday" class="w-full py-3 text-sm font-bold rounded-xl transition
                bg-indigo-600 text-white hover:bg-indigo-700
                disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-indigo-100">
                            신규 작업지시 생성
                        </button>
                    </div>

                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">
                                ISSUED WORK ORDERS
                            </h3>
                            <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {{ line.workOrders.length }}건
                            </span>
                        </div>

                        <div v-if="line.workOrders.length === 0"
                            class="h-40 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                            <span>해당 일자에 발행된 작업지시가 없습니다.</span>
                        </div>

                        <div v-else class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                            <div v-for="wo in line.workOrders" :key="wo.workOrderId"
                                class="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition bg-white relative group">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <div class="text-[13px] font-black text-gray-900 font-mono">
                                            {{ wo.workOrderCode }}
                                        </div>
                                        <div class="flex gap-2 items-center mt-1">
                                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                :class="getStatusClass(wo.workOrderStatus)">
                                                {{ wo.workOrderStatus }}
                                            </span>
                                            <span class="text-[10px] text-gray-400 font-medium">
                                                {{ wo.workOrderCreatedAt?.split('T')[1].substring(0, 5) || '--:--' }} 발행
                                            </span>
                                        </div>
                                    </div>
                                    <button @click="onPrint(wo)" class="text-gray-300 hover:text-indigo-600 transition">
                                        <span class="text-[11px] font-bold">PRINT</span>
                                    </button>
                                </div>

                                <div class="space-y-1.5">
                                    <div v-for="item in wo.items" :key="item.workOrderItemId"
                                        class="flex justify-between text-xs bg-slate-50 px-2.5 py-2 rounded-lg">
                                        <div class="flex items-center gap-1.5">
                                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                            <span class="font-mono text-gray-600">{{ item.ppCode || '긴급' }}</span>
                                        </div>
                                        <span class="font-black text-gray-800">
                                            {{ formatQuantity(item.plannedQuantity) }} <small class="text-gray-400">{{
                                                item.unit }}</small>
                                        </span>
                                    </div>
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
                        <h3 class="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Issue Work Order
                        </h3>
                        <p class="text-sm text-slate-500 font-medium mt-1">{{ selectedGroup.lineName }} | 일자: {{
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
                                    <th class="pb-3 px-2">Plan Code</th>
                                    <th class="pb-3 text-right">일일 계획</th>
                                    <th class="pb-3 text-right">기지시량</th>
                                    <th class="pb-3 text-right w-40 text-blue-600">신규 지시 수량</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <tr v-for="item in selectedGroup.items" :key="item.ppId">
                                    <td class="py-4 px-2">
                                        <span class="font-mono font-black text-slate-700">{{ item.ppCode }}</span>
                                    </td>
                                    <td class="py-4 text-right font-bold text-slate-400">{{
                                        formatQuantity(item.dailyPlannedQuantity) }}</td>
                                    <td class="py-4 text-right font-bold text-slate-300 italic">{{
                                        formatQuantity(item.assignedWoQuantity) }}</td>
                                    <td class="py-4 text-right">
                                        <input type="number" v-model.number="item.workQuantity"
                                            @input="recalculateTotal"
                                            class="w-32 text-right font-black border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:ring-0 transition-all text-blue-600 py-1.5" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-xl">
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total New
                                Instructions</p>
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
                                ⚠ Capa 초과 (특근 필요)
                            </div>
                            <div
                                class="flex items-center gap-1 justify-end text-[10px] font-bold text-slate-400 mb-1 uppercase">
                                Expected Load: {{ Math.round(((selectedGroup.totalOrdered + createQuantity) /
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
// API Import (작성하신 파일 경로에 맞게 확인하세요)
import { getDailyPlanPreview } from '@/api/production/productionPlan.js'
import { createWorkOrder as createWorkOrderApi, getDailyWorkOrders } from '@/api/production/workOrder.js'

// --- State ---
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const today = new Date().toISOString().slice(0, 10)
const isNotToday = computed(() => selectedDate.value !== today)

const previewPlans = ref([])    // PPQueryController.getDailyPlanPreview 결과
const currentWorkOrders = ref([]) // WOQueryController.getDaily 결과
const showCreateModal = ref(false)
const selectedGroup = ref(null)
const createQuantity = ref(0)

// --- 핵심: 계획 데이터와 지시 데이터를 라인별로 통합 계산 ---
const lineDashboard = computed(() => {
    // 1. 계획(daily-preview) 데이터를 기준으로 기본 맵 구성
    // previewPlans.value가 배열이 아닐 경우를 대비해 빈 배열로 처리
    const plans = Array.isArray(previewPlans.value) ? previewPlans.value : [];

    const dashboardMap = plans.reduce((acc, plan) => {
        if (!acc[plan.lineId]) {
            acc[plan.lineId] = {
                lineId: plan.lineId,
                lineName: plan.lineName,
                dailyCapacity: plan.dailyCapacity,
                materialName: plan.itemName,
                baseUnit: plan.unit,
                plans: [],
                workOrders: [],
                totalOrdered: 0
            }
        }
        acc[plan.lineId].plans.push(plan)
        return acc
    }, {})

    // 2. 이미 발행된 지시(daily) 데이터를 맵에 매핑
    // currentWorkOrders.value가 배열인지 확인 (에러 방지 핵심)
    const orders = Array.isArray(currentWorkOrders.value) ? currentWorkOrders.value : [];

    orders.forEach(lineOrder => {
        if (dashboardMap[lineOrder.lineId]) {
            // 백엔드 WorkOrderDailyResponseDTO 구조에 맞춰 데이터 할당
            dashboardMap[lineOrder.lineId].workOrders = lineOrder.workOrders || [];

            // 해당 라인의 실제 지시 합계 계산
            dashboardMap[lineOrder.lineId].totalOrdered = (lineOrder.workOrders || []).reduce((total, wo) => {
                const woSum = wo.items?.reduce((s, i) => s + i.plannedQuantity, 0) || 0;
                return total + woSum;
            }, 0);
        }
    });

    return Object.values(dashboardMap).map(line => ({
        ...line,
        totalUtilization: line.dailyCapacity > 0 ? Math.round((line.totalOrdered / line.dailyCapacity) * 100) : 0
    }));
})

const fetchData = async () => {
    try {
        const [plansRes, ordersRes] = await Promise.all([
            getDailyPlanPreview(selectedDate.value),
            getDailyWorkOrders(selectedDate.value)
        ])

        // Axios 응답 구조에 따라 수정 (보통 res.data에 데이터가 있음)
        // 만약 인터셉터에서 처리를 했다면 plansRes 자체가 데이터일 것입니다.
        previewPlans.value = plansRes.data || plansRes || [];
        currentWorkOrders.value = ordersRes.data || ordersRes || [];

        console.log("Plans:", previewPlans.value); // 데이터 구조 확인용
        console.log("Orders:", currentWorkOrders.value);
    } catch (e) {
        console.error("데이터 로딩 실패", e);
        previewPlans.value = [];
        currentWorkOrders.value = [];
    }
}

const openCreateModal = (line) => {
    selectedGroup.value = JSON.parse(JSON.stringify(line))
    selectedGroup.value.items = selectedGroup.value.plans.map(p => ({
        ...p,
        // 기본값: 일일 계획량 - 이미 지시된 양
        workQuantity: Math.max(0, p.dailyPlannedQuantity - (p.assignedWoQuantity || 0))
    }))
    recalculateTotal()
    showCreateModal.value = true
}

const recalculateTotal = () => {
    createQuantity.value = selectedGroup.value.items.reduce((sum, p) => sum + (Number(p.workQuantity) || 0), 0)
}

const addEmergencyRow = () => {
    selectedGroup.value.items.push({
        ppId: null,
        ppCode: '긴급/특근작업',
        dailyPlannedQuantity: 0,
        assignedWoQuantity: 0,
        workQuantity: 0,
        isEmergency: true
    })
}

const handleCreateWorkOrder = async () => {
    try {
        const payload = {
            lineId: selectedGroup.value.lineId,
            workDate: selectedDate.value,
            items: selectedGroup.value.items
                .filter(item => item.workQuantity > 0)
                .map(item => ({
                    ppId: item.ppId, // null이면 긴급/계획외 지시
                    quantity: item.workQuantity,
                    isEmergency: item.isEmergency || false
                }))
        }

        await createWorkOrderApi(payload)
        showCreateModal.value = false
        await fetchData() // 재조회 시 우측 리스트에 새로운 작업지시 카드 나타남
    } catch (e) {
        alert("작업지시서 발행 중 오류가 발생했습니다.")
    }
}

// Utility
const moveDate = (val) => {
    const d = new Date(selectedDate.value)
    d.setDate(d.getDate() + val)
    selectedDate.value = d.toISOString().slice(0, 10)
    fetchData()
}

const setToday = () => { selectedDate.value = today; fetchData() }
const formatQuantity = (v) => v?.toLocaleString() || '0'
const onPrint = (wo) => alert(`인쇄 준비: ${wo.workOrderCode}`)

const getStatusClass = (status) => {
    switch (status) {
        case 'STARTED': return 'bg-blue-100 text-blue-600';
        case 'COMPLETED': return 'bg-emerald-100 text-emerald-600';
        case 'PAUSED': return 'bg-amber-100 text-amber-600';
        default: return 'bg-gray-100 text-gray-500';
    }
}

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
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.animate-in {
    animation: fadeIn 0.25s ease-out;
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