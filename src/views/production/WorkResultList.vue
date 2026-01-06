<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWorkOrderResults } from '@/api/production/workOrder'

const router = useRouter()

const filter = reactive({
    startDate: null,
    endDate: null,
    line: 'all',
    keyword: ''
})


const listData = ref([])
const loading = ref(false)
const formatQty = (v) => (v != null ? v.toLocaleString() : '-')
const formatDate = (v) => (v ? v.slice(0, 16).replace('T', ' ') : '-')

const fetchData = async () => {
    try {
        loading.value = true
        const res = await getWorkOrderResults({
            startDate: filter.startDate || null,
            endDate: filter.endDate || null,
            lineId: filter.line === 'all' ? null : Number(filter.line),
            keyword: filter.keyword?.trim() || null
        })
        listData.value = res.data
    } catch (e) {
        console.error(e)
        listData.value = []
    } finally {
        loading.value = false
    }
}

const today = async () => {
    const d = new Date().toISOString().slice(0, 10)
    filter.startDate = d
    filter.endDate = d
    await fetchData()
}

const resetFilter = async () => {
    filter.startDate = null
    filter.endDate = null
    filter.line = 'all'
    filter.keyword = ''
    await fetchData()
}

const goDetail = (item) => {
    router.push(`/production/work-orders/${item.woId}`)
}

onMounted(fetchData)
</script>

<template>
    <div class="p-1 w-full text-sm">
        <!-- HEADER -->
        <div class="mb-5">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">생산 실적 관리</h1>
            <p class="text-sm text-gray-500">
                작업지시 기준 생산 실적 및 불량 현황을 조회합니다.
            </p>
        </div>

        <!-- FILTER -->
        <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h2 class="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
                필터 및 검색
            </h2>

            <div class="flex flex-wrap items-end gap-4">
                <!-- 기간 -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700">작업 시작일</label>
                    <input type="date" v-model="filter.startDate"
                        class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] min-w-[140px]" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700">작업 종료일</label>
                    <input type="date" v-model="filter.endDate"
                        class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] min-w-[140px]" />
                </div>

                <!-- 라인 -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700">생산 라인</label>
                    <select v-model="filter.line"
                        class="h-9 px-2.5 border border-gray-300 rounded-md text-sm bg-white cursor-pointer min-w-[140px] focus:outline-none focus:border-[#4C4CDD]">
                        <option value="all">전체 라인</option>
                        <option v-for="i in 5" :key="i" :value="i">
                            {{ i }}라인
                        </option>
                    </select>
                </div>

                <!-- 검색 -->
                <div class="flex flex-col gap-1.5 flex-1">
                    <label class="text-sm font-semibold text-gray-700">검색</label>
                    <input type="text" v-model="filter.keyword" placeholder="작업지시번호 / 품목명"
                        class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] w-full" />
                </div>

                <!-- 버튼 -->
                <div class="flex gap-2 h-9">
                    <button @click="today"
                        class="px-4 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50">
                        오늘
                    </button>
                    <button @click="resetFilter"
                        class="px-5 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50">
                        초기화
                    </button>
                    <button @click="fetchData"
                        class="px-6 bg-[#4C4CDD] hover:bg-[#3d3dbb] text-white rounded-md text-sm font-semibold transition-all">
                        검색
                    </button>
                </div>
            </div>
        </div>

        <!-- TABLE -->
        <div class="relative bg-white border border-gray-200 rounded-lg p-6 overflow-hidden min-h-[400px]">
            <!-- 로딩 -->
            <div v-if="loading"
                class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C4CDD]"></div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse table-fixed">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr class="font-semibold text-gray-700">
                            <th class="p-3 w-[50px] text-center">No</th>
                            <th class="p-3 w-[160px] text-center">작업지시번호</th>
                            <th class="p-3 w-[120px] text-center">라인</th>
                            <th class="p-3 w-[220px] text-center">품목명</th>
                            <th class="p-3 w-[140px] text-center">생산 / 계획</th>
                            <th class="p-3 w-[100px] text-center">불량</th>
                            <th class="p-3 w-[150px] text-center">작업 시작</th>
                            <th class="p-3 w-[150px] text-center">작업 종료</th>
                            <th class="p-3 w-[120px] text-center">담당자</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200 text-sm">
                        <tr v-for="(item, index) in listData" :key="item.woId"
                            class="hover:bg-indigo-50/30 transition-colors">
                            <td class="p-4 text-center">{{ index + 1 }}</td>
                            <td class="p-4 font-semibold text-slate-900 text-center cursor-pointer hover:underline"
                                @click="goDetail(item)">
                                {{ item.woCode }}
                            </td>
                            <td class="p-4 text-center">{{ item.lineName }}</td>
                            <td class="p-4 text-center truncate" :title="item.itemName">
                                {{ item.itemName }}
                            </td>
                            <td class="p-4 text-center font-medium">
                                {{ formatQty(item.producedQuantity) }}
                                /
                                {{ formatQty(item.plannedQuantity) }}
                            </td>
                            <td class="p-4 text-center text-rose-600 font-bold">
                                {{ item.defectiveQuantity }}
                            </td>
                            <td class="p-4 text-center">{{ formatDate(item.startTime) }}</td>
                            <td class="p-4 text-center">{{ formatDate(item.endTime) }}</td>
                            <td class="p-4 text-center">{{ item.workerName }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading && listData.length === 0" class="p-20 text-center text-gray-400 font-bold">
                조회된 실적 데이터가 없습니다.
            </div>
        </div>
    </div>
</template>
