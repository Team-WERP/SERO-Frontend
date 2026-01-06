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
                    <button @click="moveDate(-1)"
                        class="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900">◀</button>
                    <input type="date" v-model="selectedDate" @change="fetchData"
                        class="border-none focus:ring-0 text-sm font-bold bg-transparent" />
                    <button @click="moveDate(1)"
                        class="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900">▶</button>
                </div>
            </div>
        </header>

        <div class="space-y-6">
            <section v-for="line in lineDashboard" :key="line.lineId"
                class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="grid grid-cols-1 xl:grid-cols-[320px_1fr]">

                    <div class="p-6 bg-gray-50/50 border-r border-gray-100">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                라인 {{ line.lineId }}
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

                        <div class="mb-6">
                            <div class="flex justify-between text-xs mb-1.5">
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

                            <div class="flex justify-between text-[11px] text-gray-400 mt-2">
                                <span>총 지시량 {{ formatQuantity(line.totalOrdered) }}</span>
                                <span>생산능력 {{ formatQuantity(line.dailyCapacity) }}</span>
                            </div>
                        </div>

                        <button @click="openCreateModal(line)" :disabled="isNotToday"
                            class="w-full py-3 text-sm font-bold rounded-xl transition-all
                            bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]
                            disabled:bg-gray-200 disabled:text-gray-400 disabled:transform-none shadow-md shadow-indigo-100">
                            신규 작업지시 생성
                        </button>
                    </div>

                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xs font-bold text-gray-400">
                                발행된 작업지시 현황
                            </h3>
                            <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                총 {{ line.workOrders.length }}건
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
                                        <div class="text-[13px] font-bold text-gray-900">
                                            {{ wo.workOrderCode }}
                                        </div>
                                        <div class="flex gap-2 items-center mt-1">
                                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                :class="getStatusClass(wo.workOrderStatus)">
                                                {{ getStatusLabel(wo.workOrderStatus) }}
                                            </span>
                                            <span class="text-[10px] text-gray-400 font-medium">
                                                {{ wo.workOrderCreatedAt?.split('T')[1].substring(0, 5) || '--:--' }} 발행
                                            </span>
                                        </div>
                                    </div>
                                    <button @click="onPrint(wo)"
                                        class="text-gray-400 hover:text-indigo-600 transition flex items-center gap-1">
                                        <span class="text-[12px]">출력</span>
                                    </button>
                                </div>

                                <div class="space-y-1.5">
                                    <div v-for="item in wo.items" :key="item.workOrderItemId"
                                        class="flex justify-between text-xs bg-gray-50 px-2.5 py-2 rounded-lg border border-gray-100">
                                        <div class="flex items-center gap-1.5">
                                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                            <span class="text-gray-600">{{ item.ppCode || '긴급건' }}</span>
                                        </div>
                                        <span class="font-bold text-gray-800">
                                            {{ formatQuantity(item.plannedQuantity) }} <small
                                                class="text-gray-400 font-normal">{{
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
            class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
                class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">

                <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">작업지시 발행</h3>
                        <p class="text-sm text-gray-500 mt-1">{{ selectedGroup.lineName }} | 일자: {{ selectedDate }}</p>
                    </div>
                    <button @click="showCreateModal = false"
                        class="text-gray-400 hover:text-gray-900 text-2xl transition-colors">✕</button>
                </div>

                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">배정 가능 생산계획</h4>
                        <button @click="addEmergencyRow"
                            class="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-all">
                            + 긴급 작업 추가
                        </button>
                    </div>

                    <div class="max-h-60 overflow-y-auto mb-6 border border-gray-100 rounded-xl custom-scrollbar">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 sticky top-0 z-10">
                                <tr
                                    class="text-left text-gray-500 font-bold text-[11px] uppercase border-b border-gray-100">
                                    <th class="py-3 px-4">계획 코드</th>
                                    <th class="py-3 text-right">일일 계획</th>
                                    <th class="py-3 text-right">기지시량</th>
                                    <th class="py-3 text-right px-4 text-indigo-600">신규 지시 수량</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="item in selectedGroup.items" :key="item.ppId" class="hover:bg-gray-50/50">
                                    <td class="py-3 px-4">
                                        <span class="font-medium text-gray-700">{{ item.ppCode }}</span>
                                    </td>
                                    <td class="py-3 text-right text-gray-500">{{
                                        formatQuantity(item.dailyPlannedQuantity) }}</td>
                                    <td class="py-3 text-right text-gray-400 italic">{{
                                        formatQuantity(item.assignedWoQuantity) }}</td>
                                    <td class="py-3 text-right px-4">
                                        <input type="number" v-model.number="item.workQuantity"
                                            @input="recalculateTotal"
                                            class="w-28 text-right font-bold border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all py-1.5" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bg-gray-50 border border-gray-100 rounded-xl p-5 flex justify-between items-center">
                        <div class="space-y-1">
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">신규 지시 합계</p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-3xl font-bold text-indigo-600">{{ formatQuantity(createQuantity)
                                    }}</span>
                                <span class="text-xs font-medium text-gray-400">/ 생산능력 {{
                                    formatQuantity(selectedGroup.dailyCapacity) }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div v-if="(selectedGroup.totalOrdered + createQuantity) > selectedGroup.dailyCapacity"
                                class="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[11px] font-bold mb-2 inline-block">
                                ⚠ 생산능력 초과 (특근 검토 필요)
                            </div>
                            <div class="flex items-center gap-1 justify-end text-[11px] font-bold text-gray-400 mb-1.5">
                                예상 가동률: {{ Math.round(((selectedGroup.totalOrdered + createQuantity) /
                                    selectedGroup.dailyCapacity) * 100) }}%
                            </div>
                            <div class="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full transition-all duration-500"
                                    :class="(selectedGroup.totalOrdered + createQuantity) > selectedGroup.dailyCapacity ? 'bg-red-500' : 'bg-indigo-500'"
                                    :style="{ width: Math.min(((selectedGroup.totalOrdered + createQuantity) / selectedGroup.dailyCapacity) * 100, 100) + '%' }">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                    <button @click="showCreateModal = false"
                        class="px-6 py-2.5 text-gray-500 font-bold hover:text-gray-700 text-sm">취소</button>
                    <button @click="handleCreateWorkOrder" :disabled="createQuantity <= 0"
                        class="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-indigo-100 transition-all">
                        작업지시 발행
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/* 스크립트 로직은 동일하게 유지하되, 상태값 텍스트 처리만 추가합니다 */
import { ref, computed, onMounted } from 'vue'
import { getDailyPlanPreview } from '@/api/production/productionPlan.js'
import { createWorkOrder as createWorkOrderApi, getDailyWorkOrders } from '@/api/production/workOrder.js'

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const today = new Date().toISOString().slice(0, 10)
const isNotToday = computed(() => selectedDate.value !== today)

const previewPlans = ref([])
const currentWorkOrders = ref([])
const showCreateModal = ref(false)
const selectedGroup = ref(null)
const createQuantity = ref(0)

const lineDashboard = computed(() => {
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

    const orders = Array.isArray(currentWorkOrders.value) ? currentWorkOrders.value : [];
    orders.forEach(lineOrder => {
        if (dashboardMap[lineOrder.lineId]) {
            dashboardMap[lineOrder.lineId].workOrders = lineOrder.workOrders || [];
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
        previewPlans.value = plansRes.data || plansRes || [];
        currentWorkOrders.value = ordersRes.data || ordersRes || [];
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
                    ppId: item.ppId,
                    quantity: item.workQuantity,
                    isEmergency: item.isEmergency || false
                }))
        }
        await createWorkOrderApi(payload)
        showCreateModal.value = false
        await fetchData()
    } catch (e) {
        alert("작업지시서 발행 중 오류가 발생했습니다.")
    }
}

const moveDate = (val) => {
    const d = new Date(selectedDate.value)
    d.setDate(d.getDate() + val)
    selectedDate.value = d.toISOString().slice(0, 10)
    fetchData()
}

const setToday = () => { selectedDate.value = today; fetchData() }
const formatQuantity = (v) => v?.toLocaleString() || '0'
const onPrint = (wo) => alert(`인쇄 준비: ${wo.workOrderCode}`)

// 상태 한글 변환 함수 추가
const getStatusLabel = (status) => {
    const labels = {
        'PENDING': '대기중',
        'STARTED': '진행중',
        'COMPLETED': '완료',
        'PAUSED': '일시정지'
    };
    return labels[status] || status;
}

const getStatusClass = (status) => {
    switch (status) {
        case 'STARTED': return 'bg-blue-50 text-blue-600';
        case 'COMPLETED': return 'bg-emerald-50 text-emerald-600';
        case 'PAUSED': return 'bg-amber-50 text-amber-600';
        default: return 'bg-gray-100 text-gray-500';
    }
}

onMounted(fetchData)
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.animate-in {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>