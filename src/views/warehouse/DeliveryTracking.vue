<template>
    <div class="min-h-screen bg-gray-50 font-sans relative">

  
      <header class="mb-8">
        <h1 class="text-[28px] font-bold text-gray-900">배송 상태 추적</h1>
        <p class="text-sm text-gray-400 mt-1 font-medium">
          주문 번호 또는 출고지시 번호를 입력하여 실시간 물품 배송 상태를 확인합니다.
        </p>
      </header>
  
      <div class="bg-white p-6 rounded-xl border border-gray-200 mb-8 flex gap-3">
        <div v-if="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-opacity">
                <div class="flex flex-col items-center gap-3">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C4CDD]"></div>
                </div>
            </div>
        <input
          v-model="searchCode"
          type="text"
          placeholder="GI-20251211-01"
          class="flex-1 h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#4C4CDD] transition-all bg-white"
          @keyup.enter="searchDelivery"
        />
        <button @click="searchDelivery" 
          class="bg-[#4C4CDD] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#3d3dbb] transition-all text-sm whitespace-nowrap ">
          조회하기
        </button>
      </div>
  
      <div v-if="deliveryInfo" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 space-y-6">
          
          <section class="bg-white p-8 rounded-xl border border-gray-200 ">
            <div class="flex justify-between items-start mb-8">
              <h3 class="text-[18px] font-bold text-gray-800 flex items-center gap-2">
                <span class="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
                배송 진행 상태
              </h3>
              <span :class="getStatusClass(deliveryInfo.status)" class="px-3 py-1 rounded-full text-[13px] font-bold">
                {{ getStatusText(deliveryInfo.status) }}
              </span>
            </div>
  
            <div class="flex items-center justify-between px-4 pb-4">
              <div class="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2"
                  :class="isStepActive(1) ? 'bg-[#4C4CDD] border-[#4C4CDD] text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-300'">
                  <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                  </svg>
                </div>
                <div class="text-center">
                  <div class="text-[13px] font-bold" :class="isStepActive(1) ? 'text-[#4C4CDD]' : 'text-gray-400'">출고 완료</div>
                  <div class="text-[11px] text-gray-400 mt-0.5">{{ deliveryInfo.departedAt || '대기' }}</div>
                </div>
              </div>
  
              <div class="flex-1 h-0.5 mx-2 -mt-10 bg-gray-100 relative">
                <div class="absolute inset-0 bg-[#4C4CDD] transition-all duration-700" :style="{ width: isStepCompleted(1) ? '100%' : '0%' }"></div>
              </div>
  
              <div class="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2"
                  :class="isStepActive(2) ? 'bg-[#4C4CDD] border-[#4C4CDD] text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-300'">
                  <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.1.9-2 2-2h14v4h3z"/>
                  </svg>
                </div>
                <div class="text-center">
                  <div class="text-[13px] font-bold" :class="isStepActive(2) ? 'text-[#4C4CDD]' : 'text-gray-400'">배송 중</div>
                  <div class="text-[11px] text-gray-400 mt-0.5 font-medium">{{ isStepActive(2) ? '이동 중' : '예정' }}</div>
                </div>
              </div>
  
              <div class="flex-1 h-0.5 mx-2 -mt-10 bg-gray-100 relative">
                <div class="absolute inset-0 bg-[#4C4CDD] transition-all duration-700" :style="{ width: isStepCompleted(2) ? '100%' : '0%' }"></div>
              </div>
  
              <div class="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2"
                  :class="isStepActive(3) ? 'bg-[#4C4CDD] border-[#4C4CDD] text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-300'">
                  <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div class="text-center">
                  <div class="text-[13px] font-bold" :class="isStepActive(3) ? 'text-[#4C4CDD]' : 'text-gray-400'">도착 완료</div>
                  <div class="text-[11px] text-gray-400 mt-0.5 font-medium">{{ deliveryInfo.arrivedAt || '예정' }}</div>
                </div>
              </div>
            </div>
          </section>
  
          <section class="bg-white rounded-xl border border-gray-200  overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-bold text-[#4C4CDD] flex items-center gap-2">
                상세 배송 현황
              </h3>
            </div>
            <div class="p-0 divide-y divide-gray-100">
              <div v-for="(item, index) in getHistoryData" :key="index" 
                class="flex items-center gap-6 px-8 py-5 hover:bg-gray-50 transition-colors">
                <div class="w-32 text-[13px] text-gray-600 font-mono font-medium tracking-tight">{{ item.time }}</div>
                <div class="flex-1 text-sm text-gray-800 font-semibold">{{ item.content }}</div>
              </div>
            </div>
          </section>
        </div>
  
        <aside class="lg:col-span-1 space-y-6">
          <div class="sticky top-8 space-y-6">
            <div class="bg-white p-6 rounded-2xl border-2 border-[#4C4CDD]/10 ">
              <h3 class="text-lg font-bold mb-6 text-[#4C4CDD]">물품 및 주문 정보</h3>
              <div class="space-y-4 text-sm font-medium">
                <div class="flex flex-row justify-between items-center pb-4 border-b border-gray-100">
                    <span class="text-gray-400 font-semibold uppercase">주요 품목</span>
                    <span class="text-gray-900 font-bold text-sm text-right">
                        {{ deliveryInfo.itemName }}
                        <span v-if="deliveryInfo.itemCount > 1" class="text-indigo-500 ml-1 font-bold">
                        외 {{ deliveryInfo.itemCount - 1 }}건
                        </span>
                    </span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-50">
                  <span class="text-gray-400">주문 번호</span>
                  <span class="text-gray-900 font-semibold text-sm">{{ deliveryInfo.soCode }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-50">
                  <span class="text-gray-400">고객사</span>
                  <span class="text-gray-900 font-semibold text-right text-sm">{{ deliveryInfo.clientName }}</span>
                </div>
                <div class="flex flex-col gap-1 py-2 border-b border-gray-50">
                  <span class="text-gray-400">배송지</span>
                  <span class="text-gray-900 font-semibold text-right text-sm">{{ deliveryInfo.clientAddress }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
  
      <div v-else-if="searched && !isLoading" class="bg-white rounded-xl border border-gray-200 p-20 text-center ">
        <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-400 font-bold">입력하신 주문 번호에 대한 배송 데이터가 없습니다.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { getGoodsIssueList } from '@/api/delivery'
  
  const searchCode = ref('')
  const deliveryInfo = ref(null)
  const searched = ref(false)
  const isLoading = ref(false) 
  
  const searchDelivery = async () => {
    if (!searchCode.value.trim()) {
      alert('주문 번호 또는 출고지시 번호를 입력해주세요.')
      return
    }
    
    isLoading.value = true
    try {
      searched.value = true
      const result = await getGoodsIssueList({ soCode: searchCode.value.trim() })
      deliveryInfo.value = (result && result.length > 0) ? result[0] : null
    } catch (error) {
      console.error('배송 조회 실패:', error)
      alert('배송 정보를 조회하는데 실패했습니다.')
    } finally {
      isLoading.value = false 
    }
  }
  
  const getHistoryData = computed(() => {
    if (!deliveryInfo.value) return []
    if (deliveryInfo.value.history && deliveryInfo.value.history.length > 0) {
      return deliveryInfo.value.history.map(h => ({ time: h.timestamp, content: h.message }))
    }
    const history = []
    if (deliveryInfo.value.arrivedAt) history.push({ time: deliveryInfo.value.arrivedAt, content: `도착 완료 (담당자: ${deliveryInfo.value.managerName || '고객사'})` })
    if (deliveryInfo.value.departedAt) history.push({ time: deliveryInfo.value.departedAt, content: `출고 시작 및 배송 중` })
    history.push({ time: deliveryInfo.value.createdAt, content: '출고지시 및 배송 대기' })
    return history
  })
  
  const getStatusText = (status) => {
    const map = { 'GI_RVW': '검토중', 'GI_APR': '승인완료', 'GI_SHIP_ISSUED': '출고완료', 'GI_SHIP_ING': '배송중', 'GI_SHIP_DONE': '도착완료' }
    return map[status] || status
  }
  
  const getStatusClass = (status) => {
    const map = {
      'GI_SHIP_DONE': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      'GI_SHIP_ING': 'bg-blue-50 text-blue-600 border border-blue-200',
      'GI_SHIP_ISSUED': 'bg-amber-50 text-amber-600 border border-amber-200'
    }
    return map[status] || 'bg-gray-100 text-gray-600 border border-gray-200'
  }
  
  const isStepActive = (step) => {
    if (!deliveryInfo.value) return false
    const status = deliveryInfo.value.status
    if (step === 1) return ['GI_SHIP_ISSUED', 'GI_SHIP_ING', 'GI_SHIP_DONE'].includes(status)
    if (step === 2) return ['GI_SHIP_ING', 'GI_SHIP_DONE'].includes(status)
    if (step === 3) return status === 'GI_SHIP_DONE'
    return false
  }
  
  const isStepCompleted = (step) => {
    if (!deliveryInfo.value) return false
    const status = deliveryInfo.value.status
    if (step === 1) return ['GI_SHIP_ING', 'GI_SHIP_DONE'].includes(status)
    if (step === 2) return status === 'GI_SHIP_DONE'
    return false
  }
  </script>
  
  <style scoped>
  .font-sans {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
  </style>