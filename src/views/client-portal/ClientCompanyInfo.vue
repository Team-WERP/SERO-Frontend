<template>
    <div v-if="loading" class="flex h-screen items-center justify-center bg-slate-50">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
    </div>
  
    <div v-else-if="clientInfo" class="min-h-screen bg-gray-50 font-sans">
      <header class="mb-8">
        <div>
            <div class="text-[#6b7280] text-sm mb-2">고객포털 > 기업정보관리</div>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-[28px] font-bold text-gray-900">기업 정보 관리</h1>
            <p class="text-sm text-gray-500 mt-1">
              귀사의 기본 정보 및 여신 현황을 확인하고 관리할 수 있습니다.
            </p>
          </div>
        </div>
      </header>
  
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 space-y-6">
          
          <section class="bg-white p-6 rounded-xl border border-gray-200 ">
            <h3 class="text-lg font-bold text-[#4C4CDD] mb-6 flex items-center gap-2">
              기본 기업 정보
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">회사명</span>
                <span class="font-bold text-gray-900">{{ clientInfo.companyName }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">사업자번호</span>
                <span class="font-medium">{{ clientInfo.businessNumber }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">업태</span>
                <span class="font-medium">{{ clientInfo.businessType }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">종목</span>
                <span class="font-medium">{{ clientInfo.businessItem }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">대표자명</span>
                <span class="font-medium text-gray-800">{{ clientInfo.ceoName }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">대표 전화번호</span>
                <span class="font-medium">{{ clientInfo.phoneNumber }}</span>
              </div>
            </div>
          </section>
  
          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <h3 class="text-lg font-bold text-[#4C4CDD] mb-6 flex items-center gap-2">
              기업 담당자 정보
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">담당자명</span>
                <span class="font-medium text-gray-900">{{ clientInfo.managerName }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2">
                <span class="w-32 text-gray-500">연락처</span>
                <span class="font-medium">{{ clientInfo.managerContact }}</span>
              </div>
              <div class="flex border-b border-gray-200 pb-2 md:col-span-2">
                <span class="w-32 text-gray-500">이메일 주소</span>
                <span class="font-medium text-blue-600 underline">{{ clientInfo.managerEmail }}</span>
              </div>
            </div>
          </section>
  
          <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div class="flex gap-3">
              <svg class="w-5 h-5 text-indigo-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-indigo-700 leading-relaxed">
                정보 수정을 원하실 경우 당사 영업팀을 통해 수정 요청을 진행해 주시기 바랍니다. 기업 정보는 영업 및 여신 평가의 기준이 됩니다.
              </p>
            </div>
          </div>
        </div>
  
        <aside class="lg:col-span-1 space-y-6">
          <div class="sticky top-8 space-y-6">
            <div class="bg-white p-6 rounded-2xl border-2 border-[#4C4CDD]/10 ">
              <h3 class="text-lg font-bold mb-6 text-[#4C4CDD]">여신 및 결제 현황</h3>
              <div class="space-y-4 text-sm mb-6 border-b pb-6">
                <div class="flex justify-between text-gray-500">
                  <span>총 여신 한도</span>
                  <span class="text-gray-900 font-medium">₩ {{ formatNumber(clientInfo.creditLimit) }}</span>
                </div>
                <div class="flex justify-between text-gray-500">
                  <span>현재 사용 미수금</span>
                  <span class="text-rose-600 font-medium">₩ {{ formatNumber(clientInfo.receivables) }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-gray-500 font-semibold text-xs uppercase">가용 여신 잔액</span>
                <span class="text-lg font-bold text-[#4C4CDD]">
                  ₩ {{ formatNumber(clientInfo.unpaidAmount) }}
                </span>
              </div>
              
              <div class="mt-6">
                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-[#4C4CDD] h-full rounded-full transition-all duration-500" 
                    :style="{ width: calculateUsageRate(clientInfo) + '%' }"
                  ></div>
                </div>
                <p class="text-[11px] text-gray-400 mt-2 text-right">여신 한도 대비 {{ calculateUsageRate(clientInfo) }}% 사용 중</p>
              </div>
            </div>
  
            <div class="p-6 rounded-2xl border border-[#4C4CDD] text-[#4C4CDD]">
              <div class="space-y-4 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 font-medium">영업팀 문의처</span>
                  <span class="font-bold font-mono">02-1111-2222</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getClientCompanyDetail } from '@/api/client/client'
  import { useUserStore } from '@/stores/user'
  
  const clientInfo = ref(null)
  const loading = ref(true)
  const userStore = useUserStore()
  
  const fetchDetail = async () => {
    try {
      loading.value = true
      const clientId = userStore.clientId
      clientInfo.value = await getClientCompanyDetail(clientId)
    } catch (e) {
      console.error(e)
      alert('정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      loading.value = false
    }
  }
  
  const formatNumber = (val) => new Intl.NumberFormat().format(val || 0)
  
  const calculateUsageRate = (info) => {
    if (!info || !info.creditLimit) return 0
    return Math.round((info.receivables / info.creditLimit) * 100)
  }
  
  onMounted(fetchDetail)
  </script>
  
  <style scoped>
  .font-sans {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
  </style>