<template>
  <div class="min-h-screen bg-gray-50 p-6 font-sans relative">
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
      </div>
    </div>

    <header class="mb-6">
      <h1 class="text-[28px] font-bold text-gray-900">고객사 관리</h1>
      <p class="text-sm text-gray-500 mt-1 font-medium">고객사 정보 및 거래 내역을 조회합니다.</p>
    </header>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead class="bg-gray-50 border-b-2 border-gray-200 text-center">
            <tr>
              <th class="w-[60px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">No</th>
              <th class="w-[180px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">회사명</th>
              <th class="w-[250px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">주소</th>
              <th class="w-[100px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">담당자</th>
              <th class="w-[150px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">연락처</th>
              <th class="w-[140px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">여신한도</th>
              <th class="w-[140px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">미수금</th>
              <th class="w-[140px] px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">주문가능금액</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(client, index) in clients"
              :key="client.id"
              @click="goToDetail(client.id)"
              class="cursor-pointer hover:bg-indigo-50/50 hover:scale-[1.001] transition-all duration-150"
            >
              <td class="px-4 py-4 text-center text-gray-500">{{ index + 1 }}</td>
              <td class="px-4 py-4 text-center">
                <span class="font-semibold hover:underline">{{ client.companyName }}</span>
              </td>
              <td class="px-4 py-4 text-gray-900 truncate max-w-[200px] text-center" :title="client.address">
                {{ client.address || '-' }}
              </td>
              <td class="px-4 py-4 text-center text-gray-900">{{ client.managerName || '-' }}</td>
              <td class="px-4 py-4 text-center text-gray-900">{{ client.managerContact || '-' }}</td>
              <td class="px-4 py-4 text-center font-medium text-gray-900">
                {{ formatNumber(client.creditLimit) }}
              </td>
              <td class="px-4 py-4 text-center font-medium text-gray-900">
                {{ formatNumber(client.receivables) }}
              </td>
              <td class="px-4 py-4 text-center">
                <span 
                  class="font-bold"
                  :class="client.unpaidAmount < 0 ? 'text-red-600' : 'text-gray-900'"
                >
                  {{ formatNumber(client.unpaidAmount) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!isLoading && clients.length === 0" class="py-20 text-center text-gray-400 font-medium">
          등록된 고객사가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClientList } from '@/api/client/client'

const router = useRouter()
const clients = ref([])
const isLoading = ref(false) // 로딩 상태 변수 추가

const loadClients = async () => {
    isLoading.value = true // 로딩 시작
    try {
        clients.value = await getClientList()
    } catch (error) {
        console.error('고객사 목록 조회 실패:', error)
        alert('고객사 목록을 불러오는데 실패했습니다.')
    } finally {
        isLoading.value = false // 로딩 종료
    }
}

const formatNumber = (value) => {
    if (value == null) return '-'
    return value.toLocaleString('ko-KR')
}

const goToDetail = (clientId) => {
    router.push(`/order/clients/${clientId}`)
}

onMounted(() => {
    loadClients()
})
</script>

<style scoped>
.font-sans {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}
</style>