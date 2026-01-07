<template>
    <div class="p-1.5 w-full h-screen flex flex-col font-sans bg-gray-50">
        <div class="mb-5 flex justify-between items-end px-1">
            <div>
                <h1 class="text-[28px] font-bold text-gray-900 mb-2">공정 흐름 관리</h1>
                <p class="text-sm text-gray-500">생산 라인별 품목의 상세 공정 단계를 관리합니다.</p>
            </div>
        </div>

        <div class="flex flex-1 gap-5 overflow-hidden h-[calc(100vh-180px)]">

            <div class="w-[400px] bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                <div class="p-5 border-b border-gray-200">
                    <h2 class="text-18 font-semibold text-gray-900 mb-3">품목 목록</h2>
                    <div class="relative">
                        <input type="text" placeholder="품목 코드 또는 명칭 검색"
                            class="w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-600 placeholder:text-gray-400" />
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    <ul class="space-y-1">
                        <li v-for="item in lineMaterialList" :key="item.lineMaterialId"
                            @click="selectLineMaterial(item)" :class="[
                                'flex items-center p-3 rounded-md cursor-pointer transition-all duration-150 border group',
                                selectedLineMaterial?.lineMaterialId === item.lineMaterialId
                                    ? 'bg-blue-50 border-indigo-600'
                                    : 'border-transparent hover:bg-gray-50'
                            ]">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[13px] font-semibold text-indigo-600">{{ item.materialCode
                                    }}</span>
                                    <span class="text-sm font-semibold text-gray-900 truncate">{{ item.materialName
                                    }}</span>
                                </div>
                                <div class="text-xs text-gray-500 truncate">
                                    {{ item.lineName }}
                                </div>
                            </div>
                            <div class="ml-2 flex-shrink-0">
                                <span
                                    :class="['text-[8px]', selectedLineMaterial?.lineMaterialId === item.lineMaterialId ? 'text-emerald-500' : 'text-gray-300']">●</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                <div class="p-5 px-6 border-b border-gray-200 flex justify-between items-center bg-white">
                    <h2 class="text-18 font-semibold text-gray-900">공정 단계</h2>
                </div>

                <!-- 공정 요약 바 -->
                <div v-if="selectedLineMaterial"
                    class="mx-6 mt-4 mb-5 p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <!-- 좌측: 제품 정보 -->
                    <div>
                        <div class="text-sm font-semibold text-gray-900">
                            {{ selectedLineMaterial.materialName }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                            {{ selectedLineMaterial.materialCode }} · {{ selectedLineMaterial.lineName }}
                        </div>
                    </div>

                    <!-- 우측: 요약 지표 -->
                    <div class="flex gap-6 text-sm">
                        <div class="text-center">
                            <div class="text-gray-400 text-xs mb-0.5">총 단계</div>
                            <div class="font-bold text-gray-900">
                                {{ totalSteps }}단계
                            </div>
                        </div>
                        <div class="w-px bg-gray-300"></div>
                        <div class="text-center">
                            <div class="text-gray-400 text-xs mb-0.5">총 소요시간</div>
                            <div class="font-bold text-indigo-600">
                                {{ totalTimeLabel }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!selectedLineMaterial"
                    class="flex-1 flex flex-col justify-center items-center text-gray-400">
                    <div class="text-5xl mb-3 opacity-50">📋</div>
                    <p class="text-sm">좌측에서 품목을 선택해주세요</p>
                </div>

                <div v-else class="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div class="space-y-4">
                        <div v-for="process in processList" :key="process.processId"
                            class="border-b border-gray-100 last:border-0 pb-4 last:pb-0 hover:bg-gray-50 transition-colors p-3 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-3">
                                    <span
                                        class="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                                        {{ process.processOrder }}
                                    </span>
                                    <h3 class="text-[15px] font-bold text-gray-900">{{ process.processName }}</h3>
                                </div>
                                <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{
                                    process.lineName }}</span>
                            </div>

                            <div class="flex gap-4 ml-9">
                                <div
                                    class="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span class="text-gray-400 font-medium">표준시간</span>
                                    <span class="font-semibold text-indigo-600">{{ process.standardTime }}</span>
                                    <span class="text-[11px] text-gray-400">분</span>
                                </div>
                                <div
                                    class="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span class="text-gray-400 font-medium">투입인원</span>
                                    <span class="font-semibold text-indigo-600">{{ process.headCount }}</span>
                                    <span class="text-[11px] text-gray-400">명</span>
                                </div>
                            </div>

                            <div v-if="process.note" class="mt-3 ml-9 text-xs text-gray-600 flex items-center gap-2">
                                <span class="px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-medium">
                                    NOTE
                                </span>
                                <span>{{ process.note }}</span>
                            </div>

                        </div>

                        <div v-if="processList.length === 0" class="py-10 text-center text-gray-400 text-sm">
                            등록된 공정 정보가 없습니다.
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getLineMaterialList, getProductionProcessList } from '@/api/production/productionProcess'

const lineMaterialList = ref([])
const selectedLineMaterial = ref(null)
const processList = ref([])

onMounted(async () => {
    try {
        const res = await getLineMaterialList()
        lineMaterialList.value = res.data
    } catch (error) {
        console.error('데이터 로드 실패', error)
    }
})

const selectLineMaterial = async (item) => {
    selectedLineMaterial.value = item
    try {
        const res = await getProductionProcessList(item.lineMaterialId)
        processList.value = res.data
    } catch (error) {
        console.error('공정 정보 로드 실패', error)
    }
}

const totalSteps = computed(() => processList.value.length)

const totalTime = computed(() =>
    processList.value.reduce(
        (sum, p) => sum + (p.standardTime || 0),
        0
    )
)

const totalTimeLabel = computed(() => {
    const min = totalTime.value
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`
})

</script>

<style scoped>
/* 스크롤바 커스텀 */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f9fafb;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

/* 폰트 적용 (Pretendard 추천) */
.font-sans {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}
</style>