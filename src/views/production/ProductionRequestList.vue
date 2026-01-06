<template>
 <div class="p-1 w-full text-sm">
        <div class="mb-5 flex justify-between items-end">
            <div>
                <h1 class="text-[28px] font-bold text-gray-900 mb-2">생산요청 목록</h1>
                <p class="text-sm text-gray-500">
                    확정된 생산요청 내역을 조회하고 담당자를 확인할 수 있습니다.
                </p>
            </div>
            <div>
                <button class="bg-[#4C4CDD] hover:bg-[#3d3dbb] text-white rounded-lg px-[18px] py-2.5 text-sm font-semibold transition-colors" @click="openDraftModal">
                    + 생산요청 등록
                </button>
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h2 class="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
                필터 및 검색
            </h2>
            <div class="flex flex-wrap items-end gap-4">
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700">생산 요청일</label>
                    <input type="date" v-model="requestedDate" class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] min-w-[140px]" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700">생산 마감일</label>
                    <input type="date" v-model="dueDate" class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] min-w-[140px]" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-semibold text-gray-700">상태</label>
                    <select v-model="selectedStatus" class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] min-w-[140px] bg-white cursor-pointer">
                        <option v-for="s in statusFilters" :key="s.value" :value="s.value">
                            {{ s.label }}
                        </option>
                    </select>
                </div>

                <div class="flex flex-col gap-1.5 flex-1">
                    <label class="text-sm font-semibold text-gray-700">검색</label>
                    <input type="text" v-model="searchKeyword" placeholder="요청번호 / 주문번호 / 품목명 / 담당자명" 
                        class="h-9 px-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4C4CDD] w-full" />
                </div>

                <div class="flex gap-2 h-9">
                    <button class="px-6 bg-[#4C4CDD] hover:bg-[#3d3dbb] text-white rounded-md text-sm font-semibold transition-all" @click="fetchPRList">검색</button>
                    <button class="px-5 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-all" @click="resetFilters">초기화</button>
                </div>
            </div>
        </div>

        <div class="relative bg-white border border-gray-200 rounded-lg p-6 overflow-hidden min-h-[400px]">
            
            <div v-if="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-opacity">
                <div class="flex flex-col items-center gap-3">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C4CDD]"></div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse table-fixed">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr class="font-semibold text-gray-700">
                            <th class="p-3 text-sm w-[50px] text-center align-middle">No</th>
                            <th class="p-3 text-sm w-[160px] text-center align-middle">생산요청번호</th>
                            <th class="p-3 text-sm w-[160px] text-center align-middle">주문번호</th>
                            <th class="p-3 text-sm w-[200px] text-center align-middle">품목명</th>
                            <th class="p-3 text-sm w-[100px] text-center align-middle">총 수량</th>
                            <th class="p-3 text-sm w-[140px] text-center align-middle">생산요청일</th>
                            <th class="p-3 text-sm w-[140px] text-center align-middle">생산마감일</th>
                            <th class="p-3 text-sm w-[110px] text-center align-middle">요청자</th>
                            <th class="p-3 text-sm w-[110px] text-center align-middle">담당자</th>
                            <th class="p-3 text-sm w-[110px] text-center align-middle">상태</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200 text-sm">
                        <tr v-for="(pr, index) in prList" :key="pr.prId" class="hover:bg-indigo-50/30 transition-colors">
                            <td class="p-4 text-gray-900 text-center align-middle">{{ index + 1 }}</td>
                            <td class="p-4 font-semibold text-slate-900 cursor-pointer hover:underline text-center align-middle" @click="goDetail(pr.prId)">
                                {{ pr.prCode }}
                            </td>
                            <td class="p-4 text-gray-900 text-center align-middle">{{ pr.soCode }}</td>
                            <td class="p-4 text-gray-900 truncate text-center align-middle" :title="pr.mainItemName">
                                <div class="inline-block">
                                    {{ pr.mainItemName }}
                                    <span v-if="pr.itemTypeCount > 1" class="text-slate-500 text-xs ml-1">
                                        외 {{ pr.itemTypeCount - 1 }}건
                                    </span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-900 font-medium text-center align-middle">
                                {{ formatQuantity(pr.totalQuantity) }}
                            </td>
                            <td class="p-4 text-gray-900 text-center align-middle">{{ formatDate(pr.requestedAt) }}</td>
                            <td class="p-4 text-gray-900 text-center align-middle">{{ formatDate(pr.dueAt) }}</td>
                            <td class="p-4 text-gray-900 text-center align-middle">{{ pr.drafterName }}</td>
                            <td class="p-4 text-gray-900 text-center align-middle">{{ pr.managerName || '-' }}</td>
                            <td class="p-4 text-center align-middle">
                                <span :class="['inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap', getStatusClass(pr.status)]">
                                    {{ getStatusLabel(pr.status) }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <DraftPRModal v-if="showDraftModal" @close="showDraftModal = false" @select="handleSelectDraft" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPRList } from '@/api/production/productionRequest.js'
import DraftPRModal from '@/components/production/DraftPRModal.vue'

const router = useRouter()

const requestedDate = ref('')
const dueDate = ref('')
const managerId = ref('')
const searchKeyword = ref('')
const selectedStatus = ref('')
const prList = ref([])
const isLoading = ref(false);


const statusFilters = [
    { label: '전체', value: '' },
    { label: '주문검토', value: 'PR_RVW' },
    { label: '결재중', value: 'PR_APPR_PEND' },
    { label: '결재승인', value: 'PR_APPR_DONE' },
    { label: '결재반려', value: 'PR_APPR_RJCT' },
    { label: '계획수립', value: 'PR_PLANNED' },
    { label: '생산중', value: 'PR_PRODUCING' },
    { label: '생산완료', value: 'PR_DONE' },
    { label: '취소', value: 'PR_CANCEL' }
]

const resetFilters = () => {
    requestedDate.value = ''
    dueDate.value = ''
    managerId.value = ''
    searchKeyword.value = ''
    selectedStatus.value = ''

    fetchPRList()
}


const fetchPRList = async () => {
    const params = {}
    try{
        isLoading.value = true;

        if (searchKeyword.value) params.keyword = searchKeyword.value
        if (selectedStatus.value) params.status = selectedStatus.value
        if (managerId.value) params.managerId = managerId.value
        if (requestedDate.value) params.requestedDate = requestedDate.value
        if (dueDate.value) params.dueDate = dueDate.value

        prList.value = await getPRList(params)
    } catch (error) {
    console.error('API Error:', error);
  } finally {
    isLoading.value = false;
  }
   
}


const showDraftModal = ref(false)

const openDraftModal = () => {
    showDraftModal.value = true
}

const handleSelectDraft = (draft) => {
    showDraftModal.value = false
    router.push(`/production/requests/drafts/${draft.prId}`)
}

const goDetail = (prId) => {
    router.push(`/production/requests/${prId}`)
}

const formatDate = (value) => {
    if (!value) return '-'
    return value.slice(0, 10)
}

const formatQuantity = (qty) => {
    return qty != null ? qty.toLocaleString() : '-'
}

const getStatusLabel = (status) => ({
    PR_RVW: '주문검토',
    PR_APPR_PEND: '결재중',
    PR_APPR_DONE: '결재승인',
    PR_APPR_RJCT: '결재반려',
    PR_PLANNED: '계획수립',
    PR_PRODUCING: '생산중',
    PR_DONE: '생산완료',
    PR_CANCEL: '취소'
}[status] || status)

const getStatusClass = (status) => ({
    PR_RVW: 'bg-[#fff7ed] text-[#c2410c]', 
    PR_APPR_PEND: 'bg-[#fff7ed] text-[#c2410c]', 
    PR_APPR_DONE: 'bg-[#e0f2fe] text-[#0369a1]', 
    PR_APPR_RJCT: 'bg-[#fee2e2] text-[#991b1b]', 
    PR_PLANNED: 'bg-[#fef3c7] text-[#92400e]', 
    PR_PRODUCING: 'bg-[#ede9fe] text-[#5b21b6]', 
    PR_DONE: 'bg-[#e0e7ff] text-[#3730a3]', 
    PR_CANCEL: 'bg-[#f3f4f6] text-[#374151]'
}[status] || 'bg-gray-100 text-gray-600')
onMounted(fetchPRList)
</script>
