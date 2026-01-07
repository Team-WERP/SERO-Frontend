<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { useRouter } from 'vue-router'
import {
    Chart as ChartJS, Title, Tooltip, Legend,
    ArcElement, CategoryScale, LinearScale,
    BarElement, PointElement, LineElement, LineController
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
    BarElement, PointElement, LineElement, LineController
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
const isLoading = ref(true);

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
                    backgroundColor: '#6366f1',
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
    } finally {
        isLoading.value = false;
    }
})

const getRiskLevel = (risk) => {
    if (risk >= 80) return { class: 'text-rose-600 bg-rose-50' }
    if (risk >= 50) return { class: 'text-amber-600 bg-amber-50' }
    return { class: 'text-emerald-600 bg-emerald-50' }
}

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
        achievement: { title: '라인 가동 달성률', rate: productionKpiRaw.value.achievementRate },
        production: {
            title: '양품 수량',
            completedQty: productionKpiRaw.value.completedQty,
            targetQty: productionKpiRaw.value.targetQty
        },
        defect: { title: '공정 불량률', rate: productionKpiRaw.value.defectRate },
        lineUtilization: { title: '작업지시 가동률', rate: productionKpiRaw.value.lineUtilizationRate }
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
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: true
        }
    },
    cutout: '75%'
}


const router = useRouter()

const goToDetail = (prId) => {
    router.push(`/production/requests/${prId}`)
}
</script>

<template>
    <div class="min-h-screen space-y-6">
        <!-- ================= HEADER ================= -->
        <header class="flex justify-between items-end mb-4">
            <div>
                <h1 class="text-[28px] font-bold mb-2 tracking-tight">
                    생산 대시보드
                </h1>
                <p class="text-slate-500 text-sm mt-1">
                    실시간 생산 현황 및 라인 가동 상태를 한눈에 확인합니다.
                </p>
            </div>

            <div class="flex items-center gap-6">
                <div class="relative w-80">
                    <input v-model="searchQuery" type="text" placeholder="생산요청(PR) 코드 또는 고객사명으로 검색" class="w-full px-5 py-3 text-sm rounded-xl border border-slate-200
                   focus:ring-4 focus:ring-indigo-500/10 outline-none" />
                </div>
            </div>
        </header>

        <!-- ================= LOADING ================= -->
        <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
        </div>

        <!-- ================= KPI ================= -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div v-for="(kpi, key) in productionKpiMock" :key="key"
                class="bg-white p-6 rounded-2xl border border-slate-200">
                <div
                    class="mb-4 flex items-center gap-2 text-[15px] font-medium text-slate-600 uppercase tracking-widest">
                    <span>{{ kpi.title }}</span>

                    <!-- INFO ICON -->
                    <div class="relative group">
                        <span class="w-4 h-4 flex items-center justify-center rounded-full
             text-[11px] font-bold text-slate-400 border border-slate-300
             cursor-help">
                            i
                        </span>

                        <!-- TOOLTIP -->
                        <div class="absolute z-20 hidden group-hover:block
             w-64 p-3 text-[13px] text-slate-700 bg-white border border-slate-200
             rounded-lg shadow-lg top-6 left-1/2 -translate-x-1/2">
                            <template v-if="key === 'achievement'">
                                생산라인이 하루 동안 만들 수 있는 최대 생산능력(CAPA) 대비 실제 양품 생산 실적 비율입니다.<br />
                                <span class="text-slate-400">※ 생산계획 대비 지표가 아닙니다.</span>
                            </template>

                            <template v-else-if="key === 'production'">
                                금일 작업지시 기준으로<br />
                                실제 생산 완료된 양품의 총 수량입니다.
                            </template>

                            <template v-else-if="key === 'defect'">
                                금일 전체 생산 수량 대비<br />
                                불량 발생 비율을 의미합니다.
                            </template>

                            <template v-else-if="key === 'lineUtilization'">
                                금일 생성된 작업지시 중<br />
                                현재 가동(RUN) 상태인 비율입니다.
                            </template>
                        </div>
                    </div>
                </div>


                <!-- KPI VALUE -->
                <div class="text-[20px] font-black text-slate-800 mb-3 tabular-nums">
                    <template v-if="key === 'production'">
                        {{ kpi.completedQty?.toLocaleString() }}
                        <span class="text-sm font-bold text-slate-300 ml-1">
                            EA
                        </span>
                    </template>
                    <template v-else>
                        {{ kpi.rate }}%
                    </template>
                </div>

                <!-- KPI BAR -->
                <template v-if="key !== 'production'">
                    <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 rounded-full transition-all duration-700"
                            :style="{ width: Math.min(100, kpi.rate) + '%' }" />
                    </div>
                </template>

                <!-- production KPI 설명 -->
                <template v-else>
                    <p class="text-xs text-slate-400 mt-1">
                        금일 생산 완료된 양품 수량
                    </p>
                </template>
            </div>
        </section>

        <!-- ================= MAIN GRID ================= -->
        <div class="grid grid-cols-12 gap-8">
            <!-- ===== LEFT ===== -->
            <div class="col-span-12 lg:col-span-8 space-y-8">
                <!-- ===== PR LIST ===== -->
                <section class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex items-center gap-3">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span>
                        <h2 class="text-lg font-bold tracking-tight">
                            실시간 생산요청 상세 현황
                        </h2>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr
                                    class="bg-slate-50/50 text-slate-500 text-sm text-center uppercase tracking-widest font-bold">
                                    <th class="py-4 px-6 w-14"></th>
                                    <th class="py-4 w-64">PR 정보</th>
                                    <th class="py-4">고객사</th>
                                    <th class="py-4">납기일</th>
                                    <th class="py-4">리스크</th>
                                </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-100">
                                <template v-for="pr in filteredPrList" :key="pr.prId">
                                    <tr @click="toggleExpand(pr)"
                                        class="hover:bg-indigo-50/30 cursor-pointer transition-colors">
                                        <td class="px-6 text-slate-300" :class="pr.isExpanded ? 'rotate-90' : ''">
                                            ▶
                                        </td>
                                        <td class="py-5 text-center">
                                            <p class="text-sm font-semibold text-slate-900">
                                                {{ pr.prCode }}
                                            </p>
                                            <p class="text-xs text-slate-600 mt-0.5">
                                                품목 수 {{ pr.summary.totalItems }}건
                                            </p>
                                        </td>
                                        <td class="text-sm font-medium text-center">
                                            {{ pr.clientName }}
                                        </td>
                                        <td class="text-center">
                                            <span class="px-4 py-1.5 rounded-lg text-xs font-semibold" :class="pr.dDay <= 1
                                                ? 'bg-rose-50 text-rose-600'
                                                : 'bg-slate-100 text-slate-500'">
                                                D-{{ pr.dDay }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <span class="font-semibold text-xs px-3 py-1.5 rounded"
                                                :class="getRiskLevel(pr.summary.maxRisk).class">
                                                {{ pr.summary.maxRisk }}%
                                            </span>
                                        </td>
                                    </tr>

                                    <!-- EXPAND -->
                                    <tr v-if="pr.isExpanded">
                                        <td colspan="5" class="bg-slate-50/50 p-8">
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div v-for="item in pr.items" :key="item.itemId"
                                                    class="bg-white p-5 rounded-xl border border-slate-200">
                                                    <div class="flex justify-between items-start mb-4">
                                                        <div>
                                                            <span
                                                                class="text-sm font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                                                                {{ item.lineName }}
                                                            </span>
                                                            <p class="font-semibold text-slate-800 mt-2 text-sm">
                                                                {{ item.itemName }}
                                                            </p>
                                                        </div>
                                                        <span class="text-xs font-bold text-slate-500">
                                                            목표 {{ item.targetQty }}
                                                        </span>
                                                    </div>

                                                    <div class="space-y-2">
                                                        <div
                                                            class="flex justify-between text-sm font-semibold text-slate-500">
                                                            <span>
                                                                생산 진척률 ({{ item.producedQty }} / {{ item.targetQty }})
                                                            </span>
                                                            <span class="text-indigo-600">
                                                                {{ item.targetQty > 0
                                                                    ? Math.round((item.producedQty / item.targetQty) * 100)
                                                                    : 0 }}%
                                                            </span>
                                                        </div>
                                                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div class="h-full bg-indigo-500" :style="{
                                                                width: item.targetQty > 0
                                                                    ? Math.min(100, (item.producedQty / item.targetQty) * 100) + '%'
                                                                    : '0%'
                                                            }" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex justify-end pt-4">
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

                <!-- ===== MONTHLY TREND ===== -->
                <section class="bg-white p-8 rounded-2xl border border-slate-200">
                    <div class="flex items-center gap-3 mb-8">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span>
                        <h2 class="text-lg font-bold text-slate-800 tracking-tight">
                            최근 12개월 계획 대비 생산 실적
                        </h2>
                    </div>
                    <div class="h-80">
                        <Bar :data="monthlyTrendData" :options="trendOptions" />
                    </div>
                </section>
            </div>

            <!-- ===== RIGHT ===== -->
            <div class="col-span-12 lg:col-span-4 space-y-8">
                <!-- CAPA -->
                <section class="bg-white p-8 rounded-2xl border border-slate-200">
                    <h2 class="text-lg font-bold mb-8 flex items-center gap-3">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span>
                        라인별 CAPA 부하 분석
                    </h2>
                    <div class="h-56">
                        <Bar :data="capaChartData" :options="commonOptions" />
                    </div>
                    <p class="text-[12px] text-slate-400 mt-6">
                        * 100% 초과 시 초과 부하(Overload) 상태입니다.
                    </p>
                </section>

                <!-- LINE STATUS -->
                <section class="bg-white p-8 rounded-2xl border border-slate-200">
                    <h2 class="text-base font-bold mb-8 flex items-center gap-3">
                        <span class="w-2 h-5 bg-indigo-500 rounded-full"></span>
                        실시간 라인 가동 상태
                    </h2>

                    <div class="flex flex-col items-center">
                        <div class="w-52 h-52 relative mb-6">
                            <Doughnut :data="lineChartData" :options="trendOptions" />
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-3xl font-black text-slate-800">
                                    {{ lineUtilizationRate }}%
                                </span>
                                <span class="text-[12px] font-bold text-slate-400">
                                    라인 가동률
                                </span>
                            </div>
                        </div>

                        <div class="flex flex-wrap justify-center gap-4 w-full">
                            <div v-for="(label, index) in lineChartData.labels" :key="index"
                                class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full"
                                    :style="{ backgroundColor: lineChartData.datasets[0].backgroundColor[index] }" />
                                <span class="text-xs font-semibold text-slate-600">
                                    {{ label }}
                                </span>
                            </div>
                        </div>
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