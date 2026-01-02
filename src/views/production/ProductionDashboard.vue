<script setup>
import { ref, computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
    CategoryScale, LinearScale, BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement)

/* =========================
   필터 상태 관리
========================= */
const isMyTasksOnly = ref(false)
const searchQuery = ref('')

/* =========================
   생산 데이터 (manager 속성 추가)
========================= */
const productionKpiMock = {
    achievement: { title: '금일 생산 달성률', rate: 82.5, trend: '+2.4%', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
    production: { title: '양품 수량', completedQty: 9600, targetQty: 11500, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    defect: { title: '공정 불량률', rate: 1.2, status: 'warning', color: 'text-amber-600', bg: 'bg-amber-50/50' },
    lineUtilization: { title: '라인 가동률', rate: 94, runningLines: 3, totalLines: 4, color: 'text-rose-600', bg: 'bg-rose-50/50' }
}

const prRiskListMock = ref([
    {
        prId: 14, prCode: 'PR-20260102-014', clientName: '현대모비스', soCode: 'SO-20251228-003', dueDate: '2026-01-03', dDay: 1, isExpanded: true,
        items: [
            { id: 101, name: '구동모터 하우징', code: 'HM-HSG-01', line: 'LINE C', target: 1200, current: 400, material: '부족', status: '생산중', risk: 86, manager: 'me' },
            { id: 102, name: '코어 샤프트', code: 'HM-SHF-05', line: 'LINE B', target: 1200, current: 1200, material: '정상', status: '완료', risk: 10, manager: 'other' }
        ],
        summary: { totalItems: 2, maxRisk: 86, materialWarning: true, lines: ['LINE C', 'LINE B'] }
    },
    {
        prId: 11, prCode: 'PR-20260101-011', clientName: '현대트랜시스', soCode: 'SO-20251227-001', dueDate: '2026-01-04', dDay: 2, isExpanded: false,
        items: [
            { id: 201, name: 'BLDC 모터 코어', code: 'HT-COR-09', line: 'LINE A', target: 640, current: 300, material: '정상', status: '생산중', risk: 63, manager: 'other' }
        ],
        summary: { totalItems: 1, maxRisk: 63, materialWarning: false, lines: ['LINE A'] }
    }
])

const lineSummaryMock = [
    { label: '가동 중', count: 3, color: '#10b981', bg: 'bg-emerald-50' },
    { label: '일시 정지', count: 1, color: '#f59e0b', bg: 'bg-amber-50' },
    { label: '비가동', count: 0, color: '#ef4444', bg: 'bg-rose-50' }
]

/* =========================
   필터링 로직 (Computed)
========================= */
const filteredPrList = computed(() => {
    return prRiskListMock.value.filter(pr => {
        // 1. 내 담당 필터링 (아이템 중 하나라도 'me'인 경우)
        const matchesManager = !isMyTasksOnly.value || pr.items.some(item => item.manager === 'me');

        // 2. 검색어 필터링
        const matchesSearch = pr.prCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            pr.clientName.toLowerCase().includes(searchQuery.value.toLowerCase());

        return matchesManager && matchesSearch;
    });
});

/* =========================
   Chart 설정
========================= */
const lineChartData = {
    labels: lineSummaryMock.map(s => s.label),
    datasets: [{
        data: lineSummaryMock.map(s => s.count),
        backgroundColor: lineSummaryMock.map(s => s.color),
        cutout: '75%',
        borderWidth: 0
    }]
}

const riskChartData = computed(() => ({
    labels: filteredPrList.value.map(pr => pr.clientName),
    datasets: [{
        label: '리스크 점수',
        data: filteredPrList.value.map(pr => pr.summary.maxRisk),
        backgroundColor: filteredPrList.value.map(pr => pr.summary.maxRisk > 80 ? '#fb7185' : '#818cf8'),
        borderRadius: 4,
        barThickness: 15
    }]
}))

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }

const getRiskLevel = (score) => {
    if (score >= 80) return { label: '위험', class: 'bg-rose-100 text-rose-600' }
    if (score >= 50) return { label: '주의', class: 'bg-amber-100 text-amber-600' }
    return { label: '정상', class: 'bg-slate-100 text-slate-500' }
}

const toggleExpand = (pr) => { pr.isExpanded = !pr.isExpanded }
</script>

<template>
    <div class="p-6 bg-slate-50 min-h-screen space-y-6">

        <header class="flex justify-between items-end mb-4">
            <div>
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">생산 통합 관제</h1>
                <p class="text-sm text-slate-400 font-medium tracking-wide">Production Real-time Monitor</p>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span class="text-[11px] font-black text-slate-500 uppercase tracking-wider">내 담당 업무만</span>
                    <button @click="isMyTasksOnly = !isMyTasksOnly"
                        :class="isMyTasksOnly ? 'bg-indigo-600' : 'bg-slate-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none">
                        <span :class="isMyTasksOnly ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 mt-1 transform rounded-full bg-white shadow transition duration-200 ease-in-out" />
                    </button>
                </div>

                <div class="relative w-72">
                    <input v-model="searchQuery" type="text" placeholder="생산요청(PR) / 고객사 검색"
                        class="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
                </div>
            </div>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(kpi, key) in productionKpiMock" :key="key"
                class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
                <div class="flex justify-between items-start mb-3 relative z-10">
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{{ kpi.title }}</span>
                    <span v-if="kpi.trend"
                        class="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{{ kpi.trend
                        }}</span>
                </div>
                <div class="flex items-end gap-2 relative z-10 mb-4">
                    <span class="text-2xl font-black text-slate-900 tabular-nums">
                        {{ key === 'production' ? kpi.completedQty.toLocaleString() : kpi.rate + '%' }}
                    </span>
                    <span v-if="key === 'production'" class="text-xs font-bold text-slate-300 mb-1">/ {{
                        kpi.targetQty.toLocaleString() }} EA</span>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                        :style="{ width: (key === 'production' ? (kpi.completedQty / kpi.targetQty * 100) : kpi.rate) + '%' }">
                    </div>
                </div>
            </div>
        </section>

        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-8">
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                    <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                            <h2 class="font-bold text-slate-800">실시간 생산요청 상세 현황</h2>
                        </div>
                        <div class="flex items-center gap-3">
                            <span v-if="isMyTasksOnly"
                                class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">내 담당 필터
                                활성</span>
                            <span class="text-xs font-bold text-slate-400">총 {{ filteredPrList.length }} 건</span>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr
                                    class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                    <th class="py-3 px-6 text-left w-12"></th>
                                    <th class="py-3 text-left">생산요청(PR) 정보</th>
                                    <th class="py-3 text-left">고객사</th>
                                    <th class="py-3 text-center">납기일</th>
                                    <th class="py-3 text-center">납기 지연 위험도</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <template v-for="pr in filteredPrList" :key="pr.prId">
                                    <tr @click="toggleExpand(pr)"
                                        class="hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                                        <td class="px-6 text-slate-300 font-bold transition-transform duration-300"
                                            :class="pr.isExpanded ? 'rotate-90' : ''">
                                            ▶
                                        </td>
                                        <td class="py-4">
                                            <p
                                                class="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {{ pr.prCode }}
                                            </p>
                                            <p class="text-[10px] font-bold text-slate-400">품목 수: {{
                                                pr.summary.totalItems }}건</p>
                                        </td>
                                        <td class="font-bold text-slate-600 text-xs">{{ pr.clientName }}</td>
                                        <td class="text-center">
                                            <span class="px-3 py-1 rounded-lg text-[10px] font-black"
                                                :class="pr.dDay <= 1 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'">
                                                D-{{ pr.dDay }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="font-black text-xs"
                                                    :class="getRiskLevel(pr.summary.maxRisk).class.split(' ')[1]">
                                                    {{ pr.summary.maxRisk }}%
                                                </span>
                                                <div class="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div class="h-full bg-current opacity-60"
                                                        :style="{ width: pr.summary.maxRisk + '%' }"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="pr.isExpanded">
                                        <td colspan="5" class="bg-slate-50/50 p-6">
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div v-for="item in pr.items" :key="item.id"
                                                    class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                                    <div v-if="item.manager === 'me'"
                                                        class="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                                        내 담당</div>

                                                    <div class="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span
                                                                class="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded">
                                                                {{ item.line }}
                                                            </span>
                                                            <p class="font-bold text-slate-800 mt-1 text-sm">{{
                                                                item.name }}</p>
                                                        </div>
                                                        <span class="px-2 py-1 rounded text-[10px] font-black"
                                                            :class="item.material === '부족' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'">
                                                            자재 {{ item.material }}
                                                        </span>
                                                    </div>
                                                    <div class="space-y-1.5">
                                                        <div
                                                            class="flex justify-between text-[10px] font-bold text-slate-400">
                                                            <span>생산 진척률</span>
                                                            <span>{{ Math.round(item.current / item.target * 100)
                                                            }}%</span>
                                                        </div>
                                                        <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div class="h-full bg-indigo-500"
                                                                :style="{ width: (item.current / item.target * 100) + '%' }">
                                                            </div>
                                                        </div>
                                                        <p
                                                            class="text-right text-[10px] font-bold text-slate-300 tracking-tighter">
                                                            {{ item.current.toLocaleString() }} / {{
                                                                item.target.toLocaleString() }} EA
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                                <tr v-if="filteredPrList.length === 0">
                                    <td colspan="5" class="py-20 text-center text-slate-400 font-medium">
                                        검색 결과가 없거나 담당하신 업무가 없습니다.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <div class="col-span-12 lg:col-span-4 space-y-6">
                <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span> 라인 가동 현황
                    </h2>
                    <div class="flex flex-col items-center">
                        <div class="w-40 h-40 relative mb-6">
                            <Doughnut :data="lineChartData" :options="chartOptions" />
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span class="text-2xl font-black text-slate-800">75%</span>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">가동률</span>
                            </div>
                        </div>
                        <div class="w-full space-y-3">
                            <div v-for="status in lineSummaryMock" :key="status.label"
                                class="flex items-center justify-between p-3 rounded-xl border border-slate-50 transition-all hover:bg-slate-50">
                                <div class="flex items-center gap-3">
                                    <span class="w-2.5 h-2.5 rounded-full shadow-inner"
                                        :style="{ background: status.color }"></span>
                                    <span class="font-bold text-slate-600 text-xs">{{ status.label }}</span>
                                </div>
                                <span class="font-black text-slate-900 text-sm">{{ status.count }} 라인</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-rose-500 rounded-full"></span> 리스크 분석 (필터링 기준)
                    </h2>
                    <div class="h-40">
                        <Bar :data="riskChartData" :options="chartOptions" />
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

:deep(*) {
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.02em;
}

::-webkit-scrollbar {
    width: 5px;
}

::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>