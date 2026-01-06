<script setup>
import { ref, watch, computed } from 'vue'
import { getWorkOrderDetail } from '@/api/production/workOrder'

const props = defineProps({
    woId: { type: Number, required: true }
})

const emit = defineEmits(['close'])

const activeTab = ref('result')
const detail = ref(null)
const loading = ref(false)

const formatQty = (v) => (v != null ? v.toLocaleString() : '0')
const formatDate = (v) => (v ? v.slice(0, 16).replace('T', ' ') : '-')

// 생산 달성률 계산
const achievementRate = computed(() => {
    if (!detail.value || !detail.value.plannedQuantity) return 0
    return Math.min(Math.round((detail.value.goodQuantity / detail.value.plannedQuantity) * 100), 100)
})

const tabs = [
    { id: 'result', label: '생산 실적' },
    { id: 'items', label: '관련 생산계획 · 생산요청' },
    { id: 'materials', label: '투입 자재' },
    { id: 'history', label: '변경 이력' }
]

const fetchDetail = async () => {
    if (!props.woId) return
    loading.value = true
    try {
        detail.value = await getWorkOrderDetail(props.woId)
    } finally {
        loading.value = false
    }
}

watch(() => props.woId, fetchDetail, { immediate: true })
</script>

<template>
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">

            <div class="px-6 py-5 border-b bg-slate-50 flex justify-between items-start">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">작업지시</span>
                        <h2 class="text-xl font-extrabold text-slate-800">{{ detail?.woCode }}</h2>
                    </div>
                    <p class="text-sm text-slate-500">
                        <span class="font-medium text-slate-700">{{ detail?.lineName }}</span>
                        <span class="mx-2 text-slate-300">|</span>
                        담당자: {{ detail?.managerName || '미지정' }}
                    </p>
                </div>
                <button @click="emit('close')"
                    class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="flex px-6 border-b bg-white">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
                    'px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-[2px]',
                    activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                ]">
                    {{ tab.label }}
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-white">
                <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin">
                    </div>
                    <p class="text-slate-500 font-medium">데이터를 불러오는 중입니다...</p>
                </div>

                <div v-else-if="detail">
                    <div v-if="activeTab === 'result'" class="space-y-8 animate-in fade-in duration-300">
                        <div class="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-sm font-bold text-indigo-900">생산 달성률</span>
                                <span class="text-2xl font-black text-indigo-600">{{ achievementRate }}%</span>
                            </div>
                            <div class="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                <div class="bg-indigo-500 h-full transition-all duration-500"
                                    :style="{ width: achievementRate + '%' }"></div>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-4">
                            <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p class="text-xs font-bold text-slate-500 uppercase mb-1">계획 수량</p>
                                <p class="text-xl font-bold text-slate-800">{{ formatQty(detail.plannedQuantity) }}</p>
                            </div>
                            <div class="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p class="text-xs font-bold text-emerald-600 uppercase mb-1">양품 수량 (OK)</p>
                                <p class="text-xl font-bold text-emerald-700">{{ formatQty(detail.goodQuantity) }}</p>
                            </div>
                            <div class="p-4 bg-rose-50 rounded-lg border border-rose-100">
                                <p class="text-xs font-bold text-rose-600 uppercase mb-1">불량 수량 (NG)</p>
                                <p class="text-xl font-bold text-rose-700">{{ formatQty(detail.defectiveQuantity) }}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 border-t pt-6">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-400 font-bold">작업 소요 시간</p>
                                    <p class="text-sm font-semibold text-slate-700">{{ detail.workTime }}분</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 gap-1">
                                <p class="text-xs text-slate-400 font-bold uppercase">작업 기간</p>
                                <p class="text-sm text-slate-700">
                                    {{ formatDate(detail.startTime) }} ~ {{ formatDate(detail.endTime) }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="activeTab === 'items' || activeTab === 'materials'"
                        class="overflow-hidden border rounded-lg">
                        <table class="w-full text-sm">
                            <thead class="bg-slate-50 border-b">
                                <tr class="text-slate-600">
                                    <th v-if="activeTab === 'items'" class="p-4 text-left font-bold">품목 정보</th>
                                    <th v-else class="p-4 text-left font-bold">자재명</th>
                                    <th class="p-4 text-right font-bold">계획 수량</th>
                                    <th class="p-4 text-right font-bold">{{ activeTab === 'items' ? '생산 실적' : '실사용량' }}
                                    </th>
                                    <th v-if="activeTab === 'items'" class="p-4 text-center font-bold">관련 전표</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                <tr v-for="item in (activeTab === 'items' ? detail.items : detail.materials)"
                                    :key="item.id" class="hover:bg-slate-50 transition-colors">
                                    <td class="p-4 font-medium text-slate-800">{{ item.itemName || item.materialName }}
                                    </td>
                                    <td class="p-4 text-right text-slate-600 font-mono">{{
                                        formatQty(item.plannedQuantity) }}</td>
                                    <td class="p-4 text-right font-bold text-indigo-600 font-mono">{{
                                        formatQty(item.producedQuantity || item.actualQuantity) }}</td>
                                    <td v-if="activeTab === 'items'" class="p-4">
                                        <div class="flex items-center justify-center gap-2">
                                            <!-- PR -->
                                            <a v-if="item.prId" :href="`/production/requests/${item.prId}`"
                                                target="_blank" rel="noopener noreferrer"
                                                class="px-2 py-1 bg-slate-100 text-[11px] font-bold text-slate-600 rounded hover:bg-indigo-600 hover:text-white transition-colors">
                                                요청: {{ item.prCode }}
                                            </a>

                                            <!-- PP -->
                                            <a v-if="item.ppId" :href="`/production/plans/${item.ppId}`" target="_blank"
                                                rel="noopener noreferrer"
                                                class="px-2 py-1 bg-slate-100 text-[11px] font-bold text-slate-600 rounded hover:bg-emerald-600 hover:text-white transition-colors">
                                                계획: {{ item.ppCode }}
                                            </a>
                                        </div>

                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-else-if="activeTab === 'history'"
                        class="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        <div v-for="(h, i) in detail.histories" :key="i"
                            class="relative flex items-center justify-between pl-10">
                            <div class="absolute left-0 w-10 flex justify-center">
                                <div class="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                            </div>
                            <div
                                class="flex-1 bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-100">
                                <div>
                                    <span class="font-bold text-slate-800 mr-3">{{ h.action }}</span>
                                    <span class="text-slate-500 text-xs">{{ h.note || '메모 없음' }}</span>
                                </div>
                                <span class="text-[11px]  px-2 py-1 rounded">{{
                                    h.actedAt }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 border-t bg-slate-50 flex justify-end">
                <button @click="emit('close')"
                    class="px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    창 닫기
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 단순 애니메이션 효과 */
.animate-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>