<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <header class="mb-8">
      <h1 class="text-[28px] font-bold text-gray-900">주문 조회</h1>
    </header>

    <section class="bg-white p-6 rounded-xl border border-gray-200 mb-6">
      <div class="flex flex-wrap items-end gap-6">
        <div class="space-y-2">
          <p class="text-[18px] font-bold text-gray-700">필터 및 검색</p>
          <div class="flex items-center gap-4 text-[13px]">
            <span class="text-gray-500">날짜</span>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="radio" v-model="filter.dateField" value="orderedAt" class="accent-[#4C4CDD]"> 주문일
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="radio" v-model="filter.dateField" value="shippedAt" class="accent-[#4C4CDD]"> 납기일
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input 
              type="date" 
              v-model="filter.startDate" 
              class="border rounded-lg px-3 py-2 text-[13px] outline-none transition-all"
              :class="dateError && !filter.startDate ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-[#4C4CDD]/20'"
            >
            <span class="text-gray-400">~</span>
            <input 
              type="date" 
              v-model="filter.endDate" 
              class="border rounded-lg px-3 py-2 text-[13px] outline-none transition-all"
              :class="dateError && !filter.endDate ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-[#4C4CDD]/20'"
            >
          </div>
          <p v-if="dateError" class="text-[11px] text-red-500 font-medium">시작일과 종료일을 모두 입력해주세요.</p>
        </div>

        <div class="space-y-2">
          <p class="text-[13px] font-bold text-gray-700">진행상태</p>
          <select v-model="filter.status" class="w-32 border border-gray-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#4C4CDD]">
            <option :value="null">전체</option>
            <option value="CLI_SO_RED">접수대기</option>
            <option value="CLI_SO_ING">진행중</option>
            <option value="CLI_SO_SHIPPING">배송중</option>
            <option value="CLI_SO_DONE">완료</option>
            <option value="CLI_SO_CANCEL">취소</option>
          </select>
        </div>

        <div class="flex-1 space-y-2">
          <p class="text-[13px] font-bold text-gray-700">주문번호 / PO번호</p>
          <div class="flex gap-2">
            <input 
              v-model="filter.searchKeyword" 
              type="text" 
              placeholder="SO-xxxx 또는 PO-xxxx" 
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#4C4CDD]"
              @keyup.enter="handleSearch"
            >
            <button @click="resetFilter" class="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-bold text-[13px] hover:bg-gray-50 transition-colors">
              초기화
            </button>
            <button @click="handleSearch" class="bg-[#4C4CDD] text-white px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-indigo-700 transition-colors">
              검색
            </button>
          </div> 
        </div>  
      </div> 
    </section>

    <div class="p-2 border-b border-gray-100 flex items-center bg-gray-50/50 text-sm text-gray-600 font-medium">
      조회 결과: <span class="text-indigo-600 font-bold mx-1">{{ orders[0]?.orderCount || 0 }}</span>건
    </div>
    <section class="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
      <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
      </div>
 
      <table class="w-full text-[13px] text-center table-fixed">
        <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
          <tr>
            <th class="py-4 w-12">No</th>
            <th class="py-4 w-36">주문번호</th>
            <th class="py-4 w-40">PO 번호</th>
            <th class="py-4 w-40">품목명</th>
            <th class="py-4 w-32">금액</th>
            <th class="py-4 w-32">주문일</th>
            <th class="py-4 w-32">납기 요청일</th>
            <th class="py-4 w-28">진행상태</th>
            <th class="py-4 w-16">주문서</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="orders.length === 0 && !isLoading">
            <td colspan="9" class="py-20 text-gray-400">조회된 주문 내역이 없습니다.</td>
          </tr>
          <tr v-for="(order, idx) in orders" :key="order.soCode" class="hover:bg-gray-50 transition-colors cursor-pointer" @click="goToDetail(order.orderId)">
            <td class="py-4 text-gray-400">{{ ((currentPage - 1) * pageSize) + idx + 1 }}</td>
            <td class="py-4 font-medium underline underline-offset-4">{{ order.soCode }}</td>
            <td class="py-4 text-gray-600">{{ order.poCode || '-' }}</td>
            <td class="py-4 truncate px-2">
              {{ order.mainItemName }}
              <span v-if="order.totalItemCount > 1" class="text-slate-500 text-xs ml-1">외 {{ order.totalItemCount - 1 }}건</span>
            </td>
            <td class="py-4">₩ {{ formatNumber(order.totalPrice) }}</td>
            <td class="py-4">{{ order.orderedAt?.split(' ')[0] }}</td>
            <td class="py-4">{{ order.shippedAt?.split(' ')[0] }}</td>
            <td class="py-4" @click.stop>
              <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-[11px] font-bold">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="py-4" @click.stop>
              <button 
                v-if="order.soUrl"
                @click="openPdf(order.soUrl)" 
                class="text-gray-400 hover:text-[#4C4CDD] transition-all active:scale-90"
                title="주문서 보기"
              >
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              <span v-else class="text-gray-300">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    
    <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/30">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-semibold bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">이전</button>
      <span class="text-sm font-bold text-gray-700">{{ currentPage }}</span>
      <button @click="changePage(currentPage + 1)" :disabled="isLastPage" class="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-semibold bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">다음</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getClientOrderList } from '@/api/order/salesOrder';

const router = useRouter();
const orders = ref([]);
const isLoading = ref(false);
const dateError = ref(false); 

const currentPage = ref(1);
const pageSize = 20;
const isLastPage = ref(false);

const initialFilter = {
  dateField: 'orderedAt',
  startDate: '', 
  endDate: '',
  status: null,
  searchKeyword: '',
  page: 1
};

const filter = reactive({ ...initialFilter });

const changePage = (page) => {
  if (page < 1 || (page > currentPage.value && isLastPage.value)) return;
  currentPage.value = page;
  fetchOrders();
};

const resetFilter = () => {
  Object.assign(filter, initialFilter); 
  currentPage.value = 1;
  dateError.value = false; 
  fetchOrders();
};

const openPdf = (url) => {
  if (!url) {
    alert('등록된 주문서 파일이 없습니다.');
    return;
  }
  
  window.open(url, '_blank');
};

const handleSearch = () => {
  if ((filter.startDate && !filter.endDate) || (!filter.startDate && filter.endDate)) {
    dateError.value = true;
    return;
  }
  dateError.value = false;
  currentPage.value = 1; 
  fetchOrders();
};
  
const fetchOrders = async () => {
  isLoading.value = true;
  try {
    filter.page = currentPage.value;
    const response = await getClientOrderList(filter);
    
    const resultData = response.data || response;
    orders.value = resultData; 
  
    isLastPage.value = resultData.length < pageSize;
  } catch (error) {
    console.error('주문 목록 로드 실패:', error);
    orders.value = [];
  } finally {
    isLoading.value = false;
  }
};

const getStatusLabel = (status) => {
  const map = { 'CLI_SO_RED': '접수대기', 'CLI_SO_ING': '진행중', 'CLI_SO_SHIPPING': '배송중', 'CLI_SO_DONE': '완료', 'CLI_SO_CANCEL': '취소' };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const base = 'border ';
  const map = {
    'CLI_SO_RED': 'bg-amber-50 text-amber-600 border-amber-200',
    'CLI_SO_ING': 'bg-blue-50 text-blue-600 border-blue-200',
    'CLI_SO_SHIPPING': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    'CLI_SO_DONE': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'CLI_SO_CANCEL': 'bg-rose-50 text-rose-600 border-rose-200'
  };
  return base + (map[status] || 'bg-gray-50 text-gray-600 border-gray-200');
};

const formatNumber = (val) => new Intl.NumberFormat().format(val);
const goToDetail = (orderId) => router.push(`/client-portal/orders/${orderId}`);

watch(() => filter.status, () => {
  currentPage.value = 1;
  fetchOrders();
});

onMounted(() => fetchOrders());
</script>