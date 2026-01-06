<template>
    <div class="p-2 w-full font-sans text-sm">
      <div class="mb-5 flex justify-between items-end">
        <div>
          <h1 class="text-[30px] font-bold text-gray-900 mb-2">출고지시 관리</h1>
          <p class="text-sm text-gray-500">확정된 출고지시서를 조회합니다.</p>
        </div>
        <div class="flex gap-3 items-end">
          <button v-if="canCreate" 
            class="bg-[#4C4CDD] text-white border-none rounded-lg px-[18px] py-2.5 text-sm font-bold whitespace-nowrap hover:bg-[#3d3dbb] transition-colors" 
            @click="openCreateModal"
          >
            + 출고지시 등록
          </button>
        </div>
      </div>
  
      <div class="bg-white p-6 rounded-xl border border-gray-200 mb-8">
        <h2 class="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
          필터 및 검색
        </h2>
  
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end text-sm">
            <div class="lg:col-span-2">
                <label class="block mb-2 text-gray-600 font-semibold uppercase tracking-wide text-[13px]">납기일</label>
                <div class="flex items-center gap-2">
                <input type="date" v-model="startDate" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white" />
                <span class="text-gray-400 font-bold">~</span>
                <input type="date" v-model="endDate" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white" />
                </div>
            </div>

            <div>
                <label class="block mb-2 text-gray-600 font-semibold uppercase tracking-wide text-[13px]">창고</label>
                <select v-model="warehouseId" @change="fetchGIList"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white cursor-pointer">
                <option value="">전체</option>
                <option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.warehouseName }}</option>
                </select>
            </div>

            <div>
                <label class="block mb-2 text-gray-600 font-semibold uppercase tracking-wide text-[13px]">상태</label>
                <select v-model="selectedStatus" @change="fetchGIList"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white cursor-pointer">
                <option value="">전체</option>
                <option v-for="s in statusFilters" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
            </div>

            <div>
                <label class="block mb-2 text-gray-600 font-semibold uppercase tracking-wide text-[13px]">출고지시번호</label>
                <input type="text" v-model="searchKeyword" placeholder="GI-xxxx" @keyup.enter="fetchGIList"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all" />
            </div>

            <div>
                <label class="block mb-2 text-gray-600 font-semibold uppercase tracking-wide text-[13px]">요청자 필터</label>
                <button @click="toggleMyGI"
                :class="[
                    'w-full py-2 px-2 rounded-lg text-sm transition-all border outline-none whitespace-nowrap',
                    showOnlyMyGI ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                ]">
                {{ showOnlyMyGI ? '내가 작성한 건' : '모든 담당자 건' }}
                </button>
            </div>

            <div class="flex gap-2 h-[42px]">
                <button @click="fetchGIList" 
                class="flex-1 bg-indigo-700 text-white px-3 py-2 rounded-lg font-bold hover:bg-indigo-800 transition-all text-sm whitespace-nowrap">
                검색
                </button>
                <button @click="resetFilters" 
                class="flex-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold hover:bg-gray-200 border border-gray-300 transition-all text-sm whitespace-nowrap">
                초기화
                </button>
            </div>
            </div>
      </div>
  
      <div class="relative bg-white border border-gray-200 rounded-lg p-6">
        <div v-if="isLoading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
        </div>
        
        <div class="mb-3 text-sm text-gray-600">
          총 <span class="text-indigo-600 font-bold mx-1">{{ giList.length }}</span>건
        </div>
  
        <table class="w-full border-collapse">
          <thead class="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[50px]">No</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[140px]">출고지시 번호</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[140px]">납품서 번호</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[180px]">품목명</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[160px]">창고</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[110px]">출고지시일</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[110px]">납기일</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[100px]">요청자</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[100px]">담당자</th>
              <th class="p-3 text-[13px] font-bold text-gray-700 text-center w-[90px]">상태</th>
            </tr>
          </thead>
  
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(gi, index) in giList" :key="gi.id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4 text-center text-[13px]">{{ index + 1 }}</td>
              <td class="p-4 text-center text-[13px] font-bold cursor-pointer hover:underline text-gray-900" @click="goDetail(gi.id)">
                {{ gi.giCode }}
              </td>
              <td class="p-4 text-center text-[13px] text-gray-900">{{ gi.doCode }}</td>
              <td class="p-4 text-center text-[13px] max-w-[200px] truncate" :title="gi.itemName">
                {{ gi.itemName }}
                <span v-if="gi.itemCount > 1" class="text-gray-400 text-[12px] ml-1">외 {{ gi.itemCount - 1 }}건</span>
              </td>
              <td class="p-4 text-center text-[13px]">{{ gi.warehouseName }}</td>
              <td class="p-4 text-center text-[13px]">{{ gi.createdAt.slice(0, 10) }}</td>
              <td class="p-4 text-center text-[13px]">{{ gi.shippedAt.slice(0, 10) }}</td>
              <td class="p-4 text-center text-[13px]">{{ gi.requesterName || '-' }}</td>
              <td class="p-4 text-center text-[13px]">{{ gi.managerName || '-' }}</td>
              <td class="p-4 text-center">
                <span :class="['inline-block px-3 py-1 rounded-full text-[12px] font-bold', getTailwindStatusClass(gi.status)]">
                  {{ getStatusLabel(gi.status) }}
                </span>
              </td>
            </tr>
  
            <tr v-if="!isLoading && giList.length === 0">
              <td colspan="10" class="py-[60px] text-center text-gray-400 text-sm">
                조회된 출고지시가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <DeliveryOrderSelectModal :isOpen="isModalOpen" @close="closeModal" />
    </div>
  </template>
  
  <script setup>

  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user.js'
  import { getGIList } from '@/api/shipping/goodsIssue.js'
  import { getWarehouses } from '@/api/warehouse/warehouse.js'
  import DeliveryOrderSelectModal from '@/components/shipping/DeliveryOrderSelectModal.vue'
  
  const router = useRouter()
  const userStore = useUserStore()
  
  const canCreate = computed(() => userStore.hasAuthority('AC_SAL'))
  const canManage = computed(() => userStore.hasAuthority('AC_WHS'))
  
  const startDate = ref('')
  const endDate = ref('')
  const warehouseId = ref('')
  const searchKeyword = ref('')
  const selectedStatus = ref('')
  const showOnlyMyGI = ref(false)
  const giList = ref([])
  const warehouseList = ref([])
  const isModalOpen = ref(false)
  const isLoading = ref(true)
  
  const statusFilters = [
      { label: '지시검토', value: 'GI_RVW' },
      { label: '결재중', value: 'GI_APPR_PEND' },
      { label: '결재승인', value: 'GI_APPR_DONE' },
      { label: '결재반려', value: 'GI_APPR_RJCT' },
      { label: '출고완료', value: 'GI_ISSUED' },
      { label: '배송중', value: 'GI_SHIP_ING' },
      { label: '배송완료', value: 'GI_SHIP_DONE' },
      { label: '취소', value: 'GI_CANCEL' }
  ]
  
  const fetchWarehouses = async () => {
      try { warehouseList.value = await getWarehouses() }
      catch (error) { console.error('창고 목록 조회 실패:', error) }
  }
  
  const fetchGIList = async () => {
      try {
          isLoading.value = true
          const params = {}
          if (searchKeyword.value) params.searchKeyword = searchKeyword.value
          if (selectedStatus.value) params.status = selectedStatus.value
          if (warehouseId.value) params.warehouseId = parseInt(warehouseId.value)
          if (startDate.value && endDate.value) {
              params.startDate = startDate.value
              params.endDate = endDate.value
          }
          if (showOnlyMyGI.value) {
              params.drafterId = userStore.user?.id
          }
          const result = await getGIList(params)
          if (Array.isArray(result)) giList.value = [...result]
          else giList.value = []
      } catch (error) {
          console.error('출고지시 목록 조회 실패:', error)
          if (error.response?.status !== 401) alert('출고지시 목록을 불러오는데 실패했습니다.')
      } finally { isLoading.value = false }
  }
  
  const resetFilters = () => {
      startDate.value = ''
      endDate.value = ''
      warehouseId.value = ''
      selectedStatus.value = ''
      searchKeyword.value = ''
      showOnlyMyGI.value = false
      fetchGIList()
  }
  
  const toggleMyGI = async () => {
      if (showOnlyMyGI.value) {
          showOnlyMyGI.value = false
          await fetchGIList()
          return
      }
      const previousValue = showOnlyMyGI.value
      showOnlyMyGI.value = true
      await fetchGIList()
      if (!giList.value || giList.value.length === 0) {
          alert('작성한 출고지시가 없습니다.')
          showOnlyMyGI.value = previousValue
          await fetchGIList()
      }
  }
  
  const openCreateModal = () => isModalOpen.value = true
  const closeModal = () => isModalOpen.value = false
  const goDetail = (id) => router.push(`/warehouse/goods-issues/${id}`)
  
  const getStatusLabel = (status) => ({
      GI_RVW: '지시검토', GI_APPR_PEND: '결재중', GI_APPR_DONE: '결재승인',
      GI_APPR_RJCT: '결재반려', GI_ISSUED: '출고완료', GI_SHIP_ING: '배송중', GI_SHIP_DONE: '배송완료'
  }[status] || status)
  

  const getTailwindStatusClass = (status) => ({
      GI_RVW: 'bg-orange-50 text-orange-700',
      GI_APPR_PEND: 'bg-amber-100 text-amber-800',
      GI_APPR_DONE: 'bg-sky-100 text-sky-700',
      GI_APPR_RJCT: 'bg-red-100 text-red-800',
      GI_ISSUED: 'bg-green-100 text-green-800',
      GI_SHIP_ING: 'bg-violet-100 text-violet-800',
      GI_SHIP_DONE: 'bg-indigo-100 text-indigo-900',
      GI_CANCEL: 'bg-gray-100 text-gray-700'
  }[status] || 'bg-gray-100 text-gray-700')
  
  onMounted(() => {
      fetchWarehouses()
      fetchGIList()
  })
  </script>