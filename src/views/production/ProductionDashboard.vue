<script setup>
import { ref, computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js'

// 모든 필요한 차트 모듈 등록
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

/* =========================
   필터 상태 관리
========================= */
const isMyTasksOnly = ref(false)
const searchQuery = ref('')

/* =========================
   [NEW] 생산 통계 및 리스크 데이터
========================= */
// 1. 자재 부족 현황 (warehouse_stock 데이터 기반)
const shortMaterials = ref([
    { code: 'HM-HSG-01', name: '구동모터 하우징', stock: 45, safety: 100 },
    { code: 'HM-SHF-05', name: '코어 샤프트', stock: 120, safety: 500 }
])

// 2. 최근 6개월 생산 목표 대비 실적 (월별 합계)
const monthlyTrendData = {
    labels: ['8월', '9월', '10월', '11월', '12월', '1월'],
    datasets: [
        {
            type: 'line',
            label: '목표 수량',
            data: [12000, 12500, 11800, 13000, 14000, 11500],
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            fill: false,
            tension: 0.4
        },
        {
            type: 'bar',
            label: '실제 생산량',
            data: [11500, 12800, 11000, 12900, 13500, 9600],
            backgroundColor: '#e2e8f0',
            hoverBackgroundColor: '#94a3b8',
            borderRadius: 6,
        }
    ]
}

// 3. 라인별 CAPA 부하 (production_line 기반)
const lineCapaData = [
    { name: 'LINE A', load: 850, capacity: 1000 },
    { name: 'LINE B', load: 420, capacity: 1000 },
    { name: 'LINE C', load: 950, capacity: 800 }, // 과부하
    { name: 'LINE D', load: 600, capacity: 1200 }
]

/* =========================
   기존 생산 데이터 (KPI, PR 리스트)
========================= */
const productionKpiMock = {
    achievement: { title: '금일 생산 달성률', rate: 82.5, trend: '+2.4%' },
    production: { title: '양품 수량', completedQty: 9600, targetQty: 11500 },
    defect: { title: '공정 불량률', rate: 1.2 },
    lineUtilization: { title: '라인 가동률', rate: 94 }
}

const prRiskListMock = ref([
    {
        prId: 14, prCode: 'PR-20260102-014', clientName: '현대모비스', dueDate: '2026-01-03', dDay: 1, isExpanded: true,
        isDelayExpected: true, // 납기 지연 예측
        items: [
            { id: 101, name: '구동모터 하우징', code: 'HM-HSG-01', line: 'LINE C', target: 1200, current: 400, material: '부족', risk: 86, manager: 'me' },
            { id: 102, name: '코어 샤프트', code: 'HM-SHF-05', line: 'LINE B', target: 1200, current: 1200, material: '정상', risk: 10, manager: 'other' }
        ],
        summary: { totalItems: 2, maxRisk: 86 }
    },
    {
        prId: 11, prCode: 'PR-20260101-011', clientName: '현대트랜시스', dueDate: '2026-01-04', dDay: 2, isExpanded: false,
        isDelayExpected: false,
        items: [
            { id: 201, name: 'BLDC 모터 코어', code: 'HT-COR-09', line: 'LINE A', target: 640, current: 300, material: '정상', risk: 63, manager: 'other' }
        ],
        summary: { totalItems: 1, maxRisk: 63 }
    }
])

/* =========================
   필터링 및 차트 설정 로직
========================= */
const filteredPrList = computed(() => {
    return prRiskListMock.value.filter(pr => {
        const matchesManager = !isMyTasksOnly.value || pr.items.some(item => item.manager === 'me');
        const matchesSearch = pr.prCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            pr.clientName.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesManager && matchesSearch;
    });
});

const lineChartData = {
    labels: ['가동 중', '일시 정지', '비가동'],
    datasets: [{ data: [3, 1, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], cutout: '75%', borderWidth: 0 }]
}

const capaChartData = {
    labels: lineCapaData.map(l => l.name),
    datasets: [{
        label: '부하율 (%)',
        data: lineCapaData.map(l => Math.round(l.load / l.capacity * 100)),
        backgroundColor: lineCapaData.map(l => (l.load > l.capacity ? '#fb7185' : '#818cf8')),
        borderRadius: 4,
        barThickness: 20
    }]
}

const riskChartData = computed(() => ({
    labels: filteredPrList.value.map(pr => pr.clientName),
    datasets: [{
        label: '리스크 점수',
        data: filteredPrList.value.map(pr => pr.summary.maxRisk),
        backgroundColor: filteredPrList.value.map(pr => pr.summary.maxRisk > 80 ? '#fb7185' : '#6366f1'),
        borderRadius: 4,
        barThickness: 15
    }]
}))

const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
const trendOptions = { ...commonOptions, plugins: { legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } } } }

const getRiskLevel = (score) => {
    if (score >= 80) return { label: '위험', class: 'bg-rose-100 text-rose-600' }
    return { label: '정상', class: 'bg-slate-100 text-slate-500' }
}

const toggleExpand = (pr) => { pr.isExpanded = !pr.isExpanded }
</script>

<template>
    <div class="bg-slate-50 min-h-screen space-y-6 p-6">

        <header class="flex justify-between items-end mb-4">
            <div>
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">생산 통합 관제</h1>
                <p class="text-sm text-slate-400 font-medium tracking-wide">Production Intelligence & Analysis</p>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span class="text-[11px] font-black text-slate-500 uppercase tracking-wider">내 담당 업무만</span>
                    <button @click="isMyTasksOnly = !isMyTasksOnly"
                        :class="isMyTasksOnly ? 'bg-indigo-600' : 'bg-slate-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none">
                        <span :class="isMyTasksOnly ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 mt-1 transform rounded-full bg-white shadow transition duration-200" />
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
                <div
                    class="flex justify-between items-start mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {{ kpi.title }}
                    <span v-if="kpi.trend"
                        class="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{{ kpi.trend
                        }}</span>
                </div>
                <div class="text-2xl font-black text-slate-900 mb-4 tabular-nums">
                    {{ key === 'production' ? kpi.completedQty.toLocaleString() : kpi.rate + '%' }}
                    <span v-if="key === 'production'" class="text-xs font-bold text-slate-300">/ {{
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
            <div class="col-span-12 lg:col-span-8 space-y-6">
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-5 border-b border-slate-100 flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                        <h2 class="font-bold text-slate-800 tracking-tight">실시간 생산요청 상세 현황</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr
                                    class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                    <th class="py-3 px-6 text-left w-12"></th>
                                    <th class="py-3 text-left">PR 정보</th>
                                    <th class="py-3 text-left">고객사</th>
                                    <th class="py-3 text-center">납기일</th>
                                    <th class="py-3 text-center">리스크</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <template v-for="pr in filteredPrList" :key="pr.prId">
                                    <tr @click="toggleExpand(pr)" :class="pr.isDelayExpected ? 'delay-alert' : ''"
                                        class="hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                                        <td class="px-6 text-slate-300 font-bold transition-transform duration-300"
                                            :class="pr.isExpanded ? 'rotate-90' : ''">▶</td>
                                        <td class="py-4">
                                            <p class="font-black text-slate-800 group-hover:text-indigo-600">{{
                                                pr.prCode }}</p>
                                            <p class="text-[10px] font-bold text-slate-400">품목 수: {{
                                                pr.summary.totalItems }}건</p>
                                        </td>
                                        <td class="font-bold text-slate-600 text-xs">{{ pr.clientName }}</td>
                                        <td class="text-center">
                                            <span class="px-3 py-1 rounded-lg text-[10px] font-black"
                                                :class="pr.dDay <= 1 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'">D-{{
                                                    pr.dDay }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span class="font-black text-xs"
                                                :class="getRiskLevel(pr.summary.maxRisk).class.split(' ')[1]">{{
                                                    pr.summary.maxRisk }}%</span>
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
                                                                class="text-[9px] font-black text-indigo-500 uppercase px-1.5 py-0.5 bg-indigo-50 rounded">{{
                                                                    item.line }}</span>
                                                            <p class="font-bold text-slate-800 mt-1 text-sm">{{
                                                                item.name }}</p>
                                                        </div>
                                                        <span class="px-2 py-1 rounded text-[10px] font-black"
                                                            :class="item.material === '부족' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'">자재
                                                            {{ item.material }}</span>
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
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-2">
                            <span class="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                            <h2 class="font-bold text-slate-800 tracking-tight">최근 6개월 목표 대비 생산량</h2>
                        </div>
                    </div>
                    <div class="h-64">
                        <Bar :data="monthlyTrendData" :options="trendOptions" />
                    </div>
                </section>
            </div>

            <div class="col-span-12 lg:col-span-4 space-y-6">
                <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span> 실시간 라인 가동 상태
                    </h2>
                    <div class="flex flex-col items-center">
                        <div class="w-40 h-40 relative mb-4">
                            <Doughnut :data="lineChartData" :options="commonOptions" />
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span class="text-2xl font-black text-slate-800">75%</span>
                                <span class="text-[10px] font-bold text-slate-400 uppercase">가동률</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-indigo-500 rounded-full"></span> 라인별 CAPA 부하 분석
                    </h2>
                    <div class="h-44">
                        <Bar :data="capaChartData" :options="commonOptions" />
                    </div>
                    <p class="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                        * 100% 초과 시 초과 부하(Overload) 상태입니다. 라인 배정 조정이 권장됩니다.
                    </p>
                </section>

                <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-4 bg-rose-500 rounded-full"></span> 고객사별 종합 리스크
                    </h2>
                    <div class="h-40">
                        <Bar :data="riskChartData" :options="commonOptions" />
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

/* 롤링 배너 애니메이션 */
.animate-marquee {
    display: inline-block;
    padding-left: 100%;
    animation: marquee 30s linear infinite;
}

@keyframes marquee {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(-100%, 0);
    }
}

::-webkit-scrollbar {
    width: 5px;
}

::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>