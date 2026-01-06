<template>
    <div class="space-y-6">
        <header class="flex justify-between items-end mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 tracking-tight">생산 실적 관리</h1>
                <p class="text-sm text-gray-500 mt-1">라인별 생산 실적 및 불량 현황 이력을 조회합니다.</p>
            </div>
        </header>

        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-bold text-gray-600">작업 기간</label>
                <div class="flex items-center gap-2">
                    <input type="date" v-model="filter.startDate" class="form-input" />
                    <span class="text-gray-400">~</span>
                    <input type="date" v-model="filter.endDate" class="form-input" />
                </div>
            </div>

            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-bold text-gray-600">생산 라인</label>
                <select v-model="filter.line" class="form-select w-32">
                    <option value="all">전체 라인</option>
                    <option v-for="i in 4" :key="i" :value="i">{{ i }}라인</option>
                </select>
            </div>

            <div class="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label class="text-[13px] font-bold text-gray-600">통합 검색</label>
                <div class="relative">
                    <input type="text" placeholder="지시번호 또는 품목명을 입력하세요" class="form-input w-full pl-10" />
                    <svg class="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <button @click="fetchData"
                class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                검색하기
            </button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center gap-2">
                    <h3 class="font-bold text-gray-800">조회 내역</h3>
                    <span class="bg-indigo-100 text-indigo-600 text-[12px] font-bold px-2 py-0.5 rounded-full">
                        {{ listData.length }}건
                    </span>
                </div>
                <div class="flex gap-4 text-[12px] font-bold text-gray-500">
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 생산 완료
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-indigo-500"></span> 진행 중
                    </span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead
                        class="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold uppercase tracking-wider">
                        <tr>
                            <th class="px-6 py-4">No</th>
                            <th class="px-6 py-4">작업지시번호</th>
                            <th class="px-6 py-4">라인</th>
                            <th class="px-6 py-4">품목명</th>
                            <th class="px-6 py-4 text-center">생산/계획</th>
                            <th class="px-6 py-4 text-center">불량 수량</th>
                            <th class="px-6 py-4">작업 시작</th>
                            <th class="px-6 py-4">작업 종료</th>
                            <th class="px-6 py-4">담당자</th>
                            <th class="px-6 py-4 text-center">상세로그</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="(item, idx) in listData" :key="idx" class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4 text-gray-400">{{ idx + 1 }}</td>
                            <td
                                class="px-6 py-4 font-bold text-gray-700 underline underline-offset-4 decoration-gray-200 hover:text-indigo-600 cursor-pointer">
                                {{ item.code }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 bg-gray-100 rounded text-[12px] font-bold text-gray-600">
                                    {{ item.line }}라인
                                </span>
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-800">{{ item.itemName }}</td>
                            <td class="px-6 py-4 text-center">
                                <span :class="item.produced >= item.planned ? 'text-indigo-600' : 'text-rose-600'"
                                    class="font-bold">
                                    {{ formatQty(item.produced) }}
                                </span>
                                <span class="text-gray-400 mx-1">/</span>
                                <span class="text-gray-600 font-medium">{{ formatQty(item.planned) }}</span>
                            </td>
                            <td class="px-6 py-4 text-center text-rose-500 font-black">{{ item.defects }}</td>
                            <td class="px-6 py-4 text-gray-500 text-[13px] font-medium">{{ item.startTime || '-' }}</td>
                            <td class="px-6 py-4 text-gray-500 text-[13px] font-medium">{{ item.endTime || '-' }}</td>
                            <td class="px-6 py-4 font-medium text-gray-700">{{ item.manager }}</td>
                            <td class="px-6 py-4 text-center">
                                <button @click="viewLog(item)"
                                    class="p-2 hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-all group">
                                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="listData.length === 0"
                class="p-20 text-center flex flex-col items-center justify-center text-gray-400">
                <svg class="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p class="font-bold">조회된 실적 데이터가 없습니다.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const filter = reactive({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    line: 'all'
})

// 가공의 샘플 데이터 (현황 조회용)
const listData = ref([
    { code: 'WO-20251207-001', line: '1', itemName: '구동모터 A-Type (MC-A01)', planned: 1000, produced: 950, defects: 10, startTime: '2026-01-01 14:00', endTime: '2026-01-01 22:00', manager: '김작업', status: 'DONE' },
    { code: 'WO-20251207-002', line: '2', itemName: '소나타 DN8 범퍼', planned: 1000, produced: 1000, defects: 11, startTime: '2026-01-01 12:00', endTime: '2026-01-01 20:00', manager: '김생산', status: 'DONE' },
    { code: 'WO-20251207-003', line: '3', itemName: '모터코어 C', planned: 1000, produced: 750, defects: 5, startTime: '2026-01-02 09:00', endTime: '-', manager: '김반장', status: 'RUNNING' },
])

const formatQty = (v) => v?.toLocaleString() || '0'

const fetchData = () => {
    console.log('필터 기반 데이터 조회:', filter)
    // API 연동 로직
}

const viewLog = (item) => {
    console.log('상세 로그 보기:', item.code)
    // 상세 로그 팝업 또는 페이지 이동 로직
}

onMounted(fetchData)
</script>