<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { useRouter } from 'vue-router'
import {
    Chart as ChartJS, Title, Tooltip, Legend,
    ArcElement, CategoryScale, LinearScale,
    BarElement, PointElement, LineElement
} from 'chart.js'

import {
    getDashboardSummary,
    getLineStatus,
    getLineCapa,
    getMonthlyTrend,
    getPrRiskList
} from '@/api/production/productionDashboard'

ChartJS.register(
    Title, Tooltip, Legend,
    ArcElement, CategoryScale, LinearScale,
    BarElement, PointElement, LineElement
)

const isMyTasksOnly = ref(false)
const searchQuery = ref('')
const productionKpiRaw = ref(null)
const prRiskRawList = ref([])

const lineChartData = ref({ labels: [], datasets: [{ data: [] }] })
const capaChartData = ref({ labels: [], datasets: [{ data: [] }] })
const monthlyTrendData = ref({ labels: [], datasets: [] })
const riskChartData = ref({ labels: [], datasets: [{ data: [] }] })
const lineUtilizationRate = ref(0)

onMounted(async () => {
    try {
        const [summary, rawRiskList, lineStatus, lines, trend] = await Promise.all([
            getDashboardSummary(),
            getPrRiskList(),
            getLineStatus(),
            getLineCapa(),
            getMonthlyTrend()
        ])

        // 1. 일반 데이터 저장
        productionKpiRaw.value = summary
        prRiskRawList.value = rawRiskList.map(pr => ({ ...pr, isExpanded: false }))

        // 2. 실시간 라인 가동 상태 (Doughnut)
        lineChartData.value = {
            labels: ['가동 중', '일시 정지', '비가동'],
            datasets: [{
                data: [lineStatus.running, lineStatus.paused, lineStatus.stopped],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                cutout: '75%',
                borderWidth: 0
            }]
        }

        const totalLines = lineStatus.running + lineStatus.paused + lineStatus.stopped
        lineUtilizationRate.value = totalLines > 0
            ? Math.round((lineStatus.running / totalLines) * 100)
            : 0

        // 3. 라인별 CAPA 부하 (Bar)
        capaChartData.value = {
            labels: lines.map(l => l.lineName),
            datasets: [{
                label: '부하율 (%)',
                data: lines.map(l => l.loadRate),
                backgroundColor: lines.map(l => l.loadRate > 100 ? '#fb7185' : '#818cf8'),
                borderRadius: 4,
                barThickness: 20
            }]
        }

        // 4. 월간 생산 트렌드 (Line + Bar Mix)
        monthlyTrendData.value = {
            labels: trend.labels,
            datasets: [
                {
                    type: 'line',
                    label: '목표 수량',
                    data: trend.target,
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1',
                    fill: false,
                    tension: 0.4
                },
                {
                    type: 'bar',
                    label: '실제 생산량',
                    data: trend.actual,
                    backgroundColor: '#e2e8f0',
                    hoverBackgroundColor: '#94a3b8',
                    borderRadius: 6
                }
            ]
        }

        // 5. 고객사별 리스크 (Bar)
        riskChartData.value = {
            labels: rawRiskList.map(r => r.prCode),
            datasets: [{
                label: '리스크 지수',
                data: rawRiskList.map(r => r.summary.maxRisk),
                backgroundColor: '#fb7185',
                borderRadius: 4,
            }]
        }
    } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error)
    }
})

const getRiskLevel = (risk) => {
    if (risk >= 80) return { class: 'text-rose-600 bg-rose-50' }
    if (risk >= 50) return { class: 'text-amber-600 bg-amber-50' }
    return { class: 'text-emerald-600 bg-emerald-50' }
}
const riskChartDataByClient = computed(() => {
    if (prRiskRawList.value.length === 0) return { labels: [], datasets: [] };

    // 1. 고객사별로 데이터 그룹화
    const clientMap = prRiskRawList.value.reduce((acc, curr) => {
        if (!acc[curr.clientName]) {
            acc[curr.clientName] = [];
        }
        acc[curr.clientName].push(curr.summary.maxRisk);
        return acc;
    }, {});

    // 2. 고객사별 리스크 평균값 계산 (또는 Math.max로 최대값 추출 가능)
    const labels = Object.keys(clientMap);
    const data = labels.map(client => {
        const risks = clientMap[client];
        const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
        return Math.round(avgRisk);
    });

    return {
        labels: labels,
        datasets: [{
            label: '평균 리스크 지수',
            data: data,
            backgroundColor: '#fb7185',
            borderRadius: 6,
            barThickness: 25 // 막대 두께 조정
        }]
    };
});

const toggleExpand = pr => {
    pr.isExpanded = !pr.isExpanded
}

const filteredPrList = computed(() => {
    return prRiskRawList.value.filter(pr =>
        pr.prCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        pr.clientName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const productionKpiMock = computed(() => {
    if (!productionKpiRaw.value) return {}
    return {
        achievement: { title: '금일 생산 달성률', rate: productionKpiRaw.value.achievementRate },
        production: {
            title: '양품 수량',
            completedQty: productionKpiRaw.value.completedQty,
            targetQty: productionKpiRaw.value.targetQty
        },
        defect: { title: '공정 불량률', rate: productionKpiRaw.value.defectRate },
        lineUtilization: { title: '라인 가동성', rate: productionKpiRaw.value.lineUtilizationRate }
    }
})

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
}

const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true, grid: { display: false } }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: { boxWidth: 10, font: { size: 10 } }
        }
    }
}

const router = useRouter()

const goToDetail = (prId) => {
    router.push(`/production/requests/${prId}`)
}
</script>

<template>
    <div class=" min-h-screen space-y-6">
        <header class="flex justify-between items-end mb-4">
            <div>
                <h1 class="text-[28px] font-bold text-[#111827] mb-2 tracking-tight">
                    생산 통합 관제
                </h1>
                <p class="text-[14px] text-[#6b7280] font-medium tracking-wide">
                    Production Intelligence & Analysis
                </p>
            </div>

            <div class="flex items-center gap-6">
                <div class="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <span class="text-[13px] font-black text-slate-500 uppercase tracking-wider">내 담당 업무만</span>
                    <button @click="isMyTasksOnly = !isMyTasksOnly"
                        :class="isMyTasksOnly ? 'bg-indigo-600' : 'bg-slate-200'"
                        class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none">
                        <span :class="isMyTasksOnly ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-5 w-5 mt-1 transform rounded-full bg-white shadow transition duration-200" />
                    </button>
                </div>
                <div class="relative w-80">
                    <input v-model="searchQuery" type="text" placeholder="생산요청(PR) / 고객사 검색"
                        class="w-full px-5 py-3 text-base rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
                </div>
            </div>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div v-for="(kpi, key) in productionKpiMock" :key="key"
                class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
                <div
                    class="flex justify-between items-start mb-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    {{ kpi.title }}
                </div>
                <div class="text-4xl font-black text-slate-700 mb-4 tabular-nums">
                    {{ key === 'production' ? kpi.completedQty?.toLocaleString() : kpi.rate + '%' }}
                    <span v-if="key === 'production'" class="text-sm font-bold text-slate-300 ml-1">/ {{
                        kpi.targetQty?.toLocaleString() }} </span>
                </div>
                <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                        :style="{ width: (key === 'production' ? (kpi.completedQty / kpi.targetQty * 100) : kpi.rate) + '%' }">
                    </div>
                </div>
            </div>
        </section>

        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-8 space-y-8">
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex items-center gap-3">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span>
                        <h2 class="text-lg font-bold text-slate-800 tracking-tight">실시간 생산요청 상세 현황</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-[15px]">
                            <thead>
                                <tr
                                    class="bg-slate-50/50 text-slate-500 text-[12px] uppercase tracking-widest font-bold">
                                    <th class="py-4 px-6 text-left w-14"></th>
                                    <th class="py-4 text-left">PR 정보</th>
                                    <th class="py-4 text-left">고객사</th>
                                    <th class="py-4 text-center">납기일</th>
                                    <th class="py-4 text-center">리스크</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <template v-for="pr in filteredPrList" :key="pr.prId">
                                    <tr @click="toggleExpand(pr)"
                                        class="hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                                        <td class="px-6 text-slate-300 font-bold transition-transform duration-300 text-base"
                                            :class="pr.isExpanded ? 'rotate-90' : ''">▶</td>
                                        <td class="py-5">
                                            <p class="text-lg font-black text-slate-800 group-hover:text-indigo-600">{{
                                                pr.prCode }}</p>
                                            <p class="text-[12px] font-bold text-slate-400 mt-0.5">품목 수: {{
                                                pr.summary.totalItems }}건</p>
                                        </td>
                                        <td class="font-bold text-slate-600">{{ pr.clientName }}</td>
                                        <td class="text-center">
                                            <span class="px-4 py-1.5 rounded-lg text-xs font-black"
                                                :class="pr.dDay <= 1 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'">D-{{
                                                    pr.dDay }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span v-if="pr.summary" class="font-black text-sm px-3 py-1.5 rounded"
                                                :class="getRiskLevel(pr.summary.maxRisk).class">
                                                {{ pr.summary.maxRisk }}%
                                            </span>
                                        </td>
                                    </tr>
                                    <tr v-if="pr.isExpanded">
                                        <td colspan="5" class="bg-slate-50/50 p-8">
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div v-for="item in pr.items" :key="item.itemId"
                                                    class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                                                    <div class="flex justify-between items-start mb-4">
                                                        <div>
                                                            <span
                                                                class="text-[11px] font-black text-indigo-500 uppercase px-2 py-1 bg-indigo-50 rounded">
                                                                {{ item.lineName }} </span>
                                                            <p class="font-bold text-slate-800 mt-2 text-base"> {{
                                                                item.itemName }} </p>
                                                        </div>
                                                        <span
                                                            class="px-2.5 py-1 rounded text-xs font-black bg-slate-100 text-slate-500">
                                                            목표: {{ item.targetQty }}
                                                        </span>
                                                    </div>
                                                    <div class="space-y-2">
                                                        <div
                                                            class="flex justify-between text-[12px] font-bold text-slate-400">
                                                            <span>생산 진척률 ({{ item.producedQty }} / {{ item.targetQty
                                                                }})</span>
                                                            <span class="text-indigo-600">{{
                                                                Math.round((item.producedQty / item.targetQty) * 100) ||
                                                                0 }}%</span>
                                                        </div>
                                                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div class="h-full bg-indigo-500"
                                                                :style="{ width: ((item.producedQty / item.targetQty) * 100) + '%' }">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex justify-end pt-2 border-t border-slate-50">
                                                <span @click="goToDetail(pr.prId)"
                                                    class="text-[13px] font-bold text-[#4C4CDD] cursor-pointer hover:underline">
                                                    생산요청 상세 바로가기 →
                                                </span>
                                            </div>
                                        </td>

                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3 mb-8">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span>
                        <h2 class="text-lg font-bold text-slate-800 tracking-tight">최근 12개월 목표 대비 생산량</h2>
                    </div>
                    <div class="h-80">
                        <Bar :data="monthlyTrendData" :options="trendOptions" />
                    </div>
                </section>
            </div>

            <div class="col-span-12 lg:col-span-4 space-y-8">
                <section class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-base font-bold text-slate-800 mb-8 flex items-center gap-3">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span> 라인별 CAPA 부하 분석
                    </h2>
                    <div class="h-56">
                        <Bar :data="capaChartData" :options="commonOptions" />
                    </div>
                    <p class="text-[12px] text-slate-400 mt-6 leading-relaxed font-medium">
                        * 100% 초과 시 초과 부하(Overload) 상태입니다. 라인 배정 조정이 권장됩니다.
                    </p>
                </section>

                <section class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-base font-bold text-slate-800 mb-8 flex items-center gap-3">
                        <span class="w-2 h-5 bg-emerald-500 rounded-full"></span> 실시간 라인 가동 상태
                    </h2>
                    <div class="flex flex-col items-center">
                        <div class="w-52 h-52 relative mb-6">
                            <Doughnut :data="lineChartData" :options="commonOptions" />
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span class="text-3xl font-black text-slate-800">
                                    {{ lineUtilizationRate }}%
                                </span>
                                <span class="text-[12px] font-bold text-slate-400 uppercase mt-1">생산 가동률</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-base font-bold text-slate-800 mb-8 flex items-center gap-3">
                        <span class="w-2 h-5 bg-rose-500 rounded-full"></span> 고객사별 종합 리스크
                    </h2>
                    <div class="h-52">
                        <Bar :data="riskChartDataByClient" :options="commonOptions" />
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