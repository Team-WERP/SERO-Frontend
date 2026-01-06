<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getWorkOrderResults } from '@/api/production/workOrder'
import { useRouter } from 'vue-router'

const router = useRouter()

const filter = reactive({
    startDate: null,
    endDate: null,
    line: 'all',
    keyword: ''
})

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

const listData = ref([])
const loading = ref(false)
const formatQty = (v) => v?.toLocaleString() || '0'

const fetchData = async () => {
    loading.value = true
    try {
        const res = await getWorkOrderResults({
            startDate: filter.startDate || null,
            endDate: filter.endDate || null,
            lineId: filter.line === 'all' ? null : Number(filter.line),
            keyword: filter.keyword?.trim() || null
        })
        listData.value = res.data
    } catch (e) {
        console.error('작업지시 실적 조회 실패', e)
        listData.value = []
    } finally {
        loading.value = false
    }
}

const viewLog = (item) => {
    router.push(`/production/work-orders/${item.woId}`)
}

onMounted(fetchData)
</script>

<template>
    <div class="space-y-6">
        <!-- HEADER -->
        <header class="flex justify-between items-end mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
                    생산 실적 관리
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                    라인별 생산 실적 및 불량 현황 이력을 조회합니다.
                </p>
            </div>
        </header>

        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
            <!-- 기간 -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-bold text-gray-600">작업 기간</label>
                <div class="flex items-center gap-2">
                    <input type="date" v-model="filter.startDate" class="form-input" />
                    <span class="text-gray-400">~</span>
                    <input type="date" v-model="filter.endDate" class="form-input" />
                </div>
            </div>

            <!-- 라인 -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-bold text-gray-600">생산 라인</label>
                <select v-model="filter.line" class="form-select w-32">
                    <option value="all">전체 라인</option>
                    <option v-for="i in 5" :key="i" :value="i">{{ i }}라인</option>
                </select>
            </div>

            <!-- 검색 -->
            <div class="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label class="text-[13px] font-bold text-gray-600">통합 검색</label>
                <input type="text" v-model="filter.keyword" placeholder="지시번호 또는 품목명을 입력하세요"
                    class="form-input w-full" />
            </div>

            <!-- 버튼 -->
            <div class="flex gap-2">
                <button @click="today" class="px-4 py-2 text-sm font-bold rounded-xl border">
                    오늘
                </button>
                <button @click="resetFilter" class="px-4 py-2 text-sm font-bold rounded-xl border">
                    초기화
                </button>
                <button @click="fetchData" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl">
                    검색하기
                </button>
            </div>
        </div>

        <!-- TABLE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="font-bold text-gray-800">
                    조회 내역
                    <span class="ml-2 text-indigo-600 text-sm font-bold">
                        {{ listData.length }}건
                    </span>
                </h3>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="border-b text-gray-500 font-bold">
                        <tr>
                            <th class="px-6 py-4">No</th>
                            <th class="px-6 py-4">작업지시번호</th>
                            <th class="px-6 py-4">라인</th>
                            <th class="px-6 py-4">품목명</th>
                            <th class="px-6 py-4 text-center">생산/계획</th>
                            <th class="px-6 py-4 text-center">불량</th>
                            <th class="px-6 py-4">작업 시작</th>
                            <th class="px-6 py-4">작업 종료</th>
                            <th class="px-6 py-4">담당자</th>
                        </tr>
                    </thead>

                    <tbody v-if="listData.length">
                        <tr v-for="(item, idx) in listData" :key="item.woId" class="hover:bg-gray-50">
                            <td class="px-6 py-4">{{ idx + 1 }}</td>
                            <td class="px-6 py-4 font-bold text-indigo-600 cursor-pointer">
                                {{ item.woCode }}
                            </td>
                            <td class="px-6 py-4">{{ item.lineName }}</td>
                            <td class="px-6 py-4">{{ item.itemName }}</td>
                            <td class="px-6 py-4 text-center">
                                <span class="font-bold">
                                    {{ formatQty(item.producedQuantity) }}
                                </span>
                                /
                                {{ formatQty(item.plannedQuantity) }}
                            </td>
                            <td class="px-6 py-4 text-center text-rose-600 font-bold">
                                {{ item.defectiveQuantity }}
                            </td>
                            <td class="px-6 py-4">{{ item.startTime }}</td>
                            <td class="px-6 py-4">{{ item.endTime }}</td>
                            <td class="px-6 py-4">{{ item.workerName }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!listData.length && !loading" class="p-20 text-center text-gray-400 font-bold">
                조회된 실적 데이터가 없습니다.
            </div>
        </div>
    </div>
</template>
