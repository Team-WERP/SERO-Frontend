<template>
  <div class="p-8 bg-gray-50 min-h-screen font-sans">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">주문 관리</h1>
      <p class="text-sm text-gray-500 mt-3">전체 주문을 조회합니다.</p>
    </header>

    <div class="flex gap-2 mb-6">
      <button 
        v-for="tab in tabs" :key="tab.value"
        @click="currentStatus = tab.value"
        :class="[
          'px-6 py-2 rounded-full border text-sm font-semibold transition-all',
          currentStatus === tab.value 
            ? 'bg-indigo-600 text-white border-indigo-600' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
      <h3 class="text-sm font-bold mb-5 text-gray-800">필터 및 검색</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
        
        <div class="col-span-2">
          <div class="flex items-center gap-5 mb-3">
            <label class="text-xs flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
              <input type="radio" v-model="searchParams.dateField" value="orderedAt" class="w-4 h-4 accent-indigo-600"> 주문일
            </label>
            <label class="text-xs flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
              <input type="radio" v-model="searchParams.dateField" value="shippedAt" class="w-4 h-4 accent-indigo-600"> 납기일
            </label>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <input 
                type="date" 
                v-model="searchParams.startDate" 
                :class="[
                  'w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-indigo-600 outline-none transition-all',
                  dateError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-indigo-500/20'
                ]"
              >
              <span class="text-gray-400">~</span>
              <input 
                type="date" 
                v-model="searchParams.endDate" 
                :class="[
                  'w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-indigo-600 outline-none transition-all',
                  dateError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-indigo-500/20'
                ]"
              >
            </div>
            <p v-if="dateError" class="text-red-500 text-[11px] font-semibold">{{ dateError }}</p>
          </div>
        </div>

        <div>
          <label class="block text-[11px] mb-2 text-gray-500 font-bold uppercase">담당자</label>
          <input v-model="searchParams.managerName" type="text" placeholder="전체" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all">
        </div>

        <div>
          <label class="block text-[11px] mb-2 text-gray-500 font-bold uppercase">고객사</label>
          <input v-model="searchParams.clientName" type="text" placeholder="전체" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all">
        </div>

        <div>
          <label class="block text-[11px] mb-2 text-gray-500 font-bold uppercase">진행 상태</label>
          <select 
            v-model="searchParams.status" 
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white"
          >
            <option value="">전체</option>
            <option v-for="(label, code) in statusLabelMap" :key="code" :value="code">{{ label }}</option>
          </select>
        </div>
        
        <div class="col-span-1">
          <label class="block text-[11px] mb-2 text-gray-500 font-bold uppercase">주문번호 / 품목명</label>
          <input v-model="searchParams.searchKeyword" type="text" placeholder="SO-xxxx 또는 품목명" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all">
        </div>

        <div class="flex gap-2">
          <button @click="handleSearch" class="bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-800 transition-all shadow-md active:scale-95">
            검색
          </button>
          <button @click="resetFilters" class="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 border border-gray-300 transition-all active:scale-95">
            초기화
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center bg-gray-50/50 text-sm text-gray-600 font-medium">
        조회 결과: <span class="text-indigo-600 font-bold mx-1">{{ orders.length }}</span>건
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-[15px] font-bold uppercase border-b border-gray-200 text-center">
              <th class="px-5 py-3 w-12">No</th>
              <th class="px-5 py-3">주문번호</th>
              <th class="px-5 py-3">고객사</th>
              <th class="px-5 py-3">품목명</th>
              <th class="px-5 py-3">금액</th>
              <th class="px-5 py-3">주문일시</th>
              <th class="px-5 py-3">납기일시</th>
              <th class="px-5 py-3">담당자</th>
              <th class="px-5 py-3">진행상태</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(order, index) in orders" :key="order.orderId" class="hover:bg-indigo-50/30 transition-colors text-sm text-black text-center">
              <td class="px-5 py-4 text-gray-400 text-xs">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              
              <td class="px-5 py-4 font-semibold">
                <span 
                  class="cursor-pointer hover:underline"
                  @click="goToDetail(order.id)"
                >
                  {{ order.soCode }}
                </span>
              </td>

              <td class="px-5 py-4">{{ order.clientName }}</td>
              <td class="px-5 py-4">
                {{ order.mainItemName }}
                <span v-if="order.totalItemCount > 1">외 {{ order.totalItemCount - 1 }}건</span>
              </td>
              <td class="px-5 py-4 text-center">₩ {{ formatPrice(order.totalPrice) }}</td>
              <td class="px-5 py-4 text-center">{{ order.orderedAt }}</td>
              <td class="px-5 py-4 text-center">{{ order.shippedAt }}</td>
              <td class="px-5 py-4 text-center">{{ order.managerName || '-' }}</td>
              <td class="px-5 py-4 text-center">
                <span :class="getStatusBadgeClass(order.status)" class="px-3 py-1 rounded-[15px] text-[12px] font-bold inline-block min-w-[80px]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="9" class="px-5 py-24 text-center text-gray-400 font-medium">조회된 데이터가 존재하지 않습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/30">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-semibold bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">이전</button>
        <span class="text-sm font-bold text-gray-700">{{ currentPage }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="isLastPage" class="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-semibold bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getSOList } from '@/api/order/salesOrder';

const router = useRouter();

const tabs = [
  { label: '전체', value: 'ALL' },
  { label: '주문 처리', value: 'ORD_PEND' },
  { label: '결재 처리', value: 'ORD_APPR' },
  { label: '진행중', value: 'ORD_ING' },
  { label: '완료', value: 'ORD_DONE' },
];

const statusLabelMap = { 
  'ORD_RED': '접수대기', 'ORD_RVW': '주문검토', 'ORD_APPR_PEND': '주문결재중', 
  'ORD_APPR_DONE': '결재승인', 'ORD_WORK_REQ': '작업요청', 'ORD_PRO': '생산중', 
  'ORD_SHIP_READY': '출고중', 'ORD_SHIPPING': '배송중', 'ORD_DONE': '배송완료', 
  'ORD_APPR_RJCT': '결재반려', 'ORD_CANCEL': '주문취소' 
};

const currentStatus = ref('ALL');
const orders = ref([]);
const currentPage = ref(1);
const pageSize = 20;
const isLastPage = ref(false);

const searchParams = ref({
  dateField: 'orderedAt',
  startDate: '',
  endDate: '',
  managerName: '',
  clientName: '',
  status: '',
  searchKeyword: ''
});

const dateError = ref('');

const fetchOrders = async () => {
  try {
    const payload = {
      statusType: searchParams.value.status || (currentStatus.value === 'ALL' ? null : currentStatus.value),
      dateField: searchParams.value.dateField,
      startDate: searchParams.value.startDate || null,
      endDate: searchParams.value.endDate || null,
      managerName: searchParams.value.managerName || null,
      clientName: searchParams.value.clientName || null,
      searchKeyword: searchParams.value.searchKeyword || null,
      page: currentPage.value
    };

    const data = await getSOList(payload);
    orders.value = data;
    isLastPage.value = data.length < pageSize;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('API Error:', error);
  }
};

const goToDetail = (orderId) => {
  router.push(`/order/detail/${orderId}`); // 상세 페이지 경로에 맞게 수정하세요
};

const handleSearch = () => {
  const { startDate, endDate } = searchParams.value;
  if ((startDate && !endDate) || (!startDate && endDate)) {
    dateError.value = startDate ? '종료일을 입력해주세요.' : '시작일을 입력해주세요.';
    return;
  }
  dateError.value = '';
  currentPage.value = 1;
  fetchOrders();
};

const changePage = (page) => {
  if (page < 1) return;
  currentPage.value = page;
  fetchOrders();
};

const resetFilters = () => {
  searchParams.value = { dateField: 'orderedAt', startDate: '', endDate: '', managerName: '', clientName: '', status: '', searchKeyword: '' };
  currentStatus.value = 'ALL';
  currentPage.value = 1;
  dateError.value = ''; 
  fetchOrders();
};

watch(() => [searchParams.value.startDate, searchParams.value.endDate], () => {
  if (searchParams.value.startDate && searchParams.value.endDate) {
    dateError.value = '';
  }
});

const formatPrice = (p) => p ? new Intl.NumberFormat('ko-KR').format(p) : '0';

const getStatusLabel = (s) => statusLabelMap[s] || s;

const getStatusBadgeClass = (s) => {
  const styles = {
    'ORD_RED': 'bg-[#FFFBEB] text-[#B4540A]',
    'ORD_RVW': 'bg-[#FFFBEB] text-[#B4540A]',
    'ORD_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]',
    'ORD_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]',
    'ORD_WORK_REQ': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_PRO': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_SHIP_READY': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_SHIPPING': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_DONE': 'bg-[#F3F4F6] text-[#000000]',
    'ORD_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]',
    'ORD_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'
  };
  return styles[s] || 'bg-gray-100 text-gray-600';
};

watch(currentStatus, () => { currentPage.value = 1; fetchOrders(); });
onMounted(() => { fetchOrders(); });
</script>