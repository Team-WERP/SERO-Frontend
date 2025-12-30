<template>
   <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>
  <div v-if="order" class="min-h-screen bg-gray-50 font-sans">
    <header class="mb-8">
      <router-link to="/client-portal/orders" class="text-sm text-gray-500 hover:underline">‹ 목록으로 돌아가기</router-link>
      <div class="flex items-center gap-3 mt-2">
        <h1 class="text-[32px] font-bold text-gray-900">주문 상세</h1>
        <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-[13px] font-bold">
          {{ getStatusLabel(order.status) }}
        </span>
        <div v-if="order.status === 'CLI_SO_CANCEL'" class="flex items-center gap-2 ml-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg">
          <svg class="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-[14px] text-rose-600 font-bold">
            취소 사유: <span class="font-medium ml-1">{{ order.rejectionReason }}</span>
          </span>
        </div>
      </div>
      <p class="text-[13px] text-gray-500 mt-1">고객사 담당자: <span class="font-medium text-gray-800">{{ order.clientManagerName || '-' }}</span></p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 space-y-6">
        
        <section class="bg-white p-6 rounded-xl border border-gray-200 ">
          <h3 class="text-[18px] font-bold text-[#4C4CDD] mb-6 flex items-center gap-2">
            기본 주문 정보
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[13px]">
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">주문번호</span><span class="font-medium">{{ order.soCode }}</span></div>
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">PO번호</span><span class="font-medium">{{ order.poCode || '-' }}</span></div>
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">주문일시</span><span>{{ order.orderedAt }}</span></div>
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">납기 요청일</span><span class="font-medium">{{ order.shippedAt }}</span></div>
            <div class="md:col-span-2 pt-2">
              <p class="text-gray-500 mb-2 font-medium">비고</p>
              <div class="bg-gray-50 p-3 rounded-lg text-gray-800 border border-gray-200 min-h-[50px]">
                {{ order.note || '특이사항 없음' }}
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white p-6 rounded-xl border border-gray-200 ">
          <h3 class="text-[18px] font-bold text-[#4C4CDD] mb-6 flex items-center gap-2">
            주문서 및 납품서
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 mb-3 font-bold">주문서</p>
              <a v-if="order.soUrl" :href="order.soUrl" target="_blank" class="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-blue-600 hover:bg-blue-50 transition-colors  font-medium">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                주문서_{{ order.soCode }}.pdf
              </a>
              <span v-else class="text-gray-400">등록된 주문서가 없습니다.</span>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 mb-3 font-bold">납품서</p>
              <div v-if="order.doUrls && order.doUrls.length" class="flex flex-wrap gap-2">
                <a v-for="(url, idx) in order.doUrls" :key="idx" :href="url" target="_blank" class="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-blue-600 hover:bg-blue-50 transition-colors  font-medium">
                 납품서_{{ order.soCode + "_" + idx + 1 }}.pdf
                </a>
              </div>
              <span v-else class="text-gray-400">등록된 납품서가 없습니다.</span>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-xl border border-gray-200  overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-[18px] font-bold text-[#4C4CDD] flex items-center gap-2">
              주문 품목 정보
            </h3>
          </div>
          <table class="w-full text-[13px] text-center">
            <thead class="bg-gray-50 text-gray-500 font-bold border-b">
              <tr>
                <th class="py-3 px-4 w-16">No</th>
                <th class="py-3 px-4">품목코드</th>
                <th class="py-3 px-4">품목명</th>
                <th class="py-3 px-4">수량</th>
                <th class="py-3 px-4">단위</th>
                <th class="py-3 px-4">단가</th>
                <th class="py-3 px-4 pr-8">금액</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, idx) in order.items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 text-gray-400">{{ idx + 1 }}</td>
                <td class="py-4 font-medium text-gray-700">{{ item.itemCode }}</td>
                <td class="py-4 font-medium text-gray-900">{{ item.itemName }}</td>
                <td class="py-4">{{ formatNumber(item.quantity) }}</td>
                <td class="py-4">{{ item.unit }}</td>
                <td class="py-4"> {{ formatNumber(item.unitPrice) }}</td>
                <td class="py-4">₩ {{ formatNumber(item.totalPrice) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-semibold border-t-2 border-gray-200">
              <tr>
                <td colspan="3" class="py-4 text-right pr-6">합계</td>
                <td class="py-4">{{ formatNumber(order.totalQuantity) }}</td>
                <td colspan="2"></td>
                <td class="py-4 font-boldpr-8">₩ {{ formatNumber(order.totalPrice) }}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section class="bg-white p-6 rounded-xl border border-gray-200 ">
          <h3 class="text-[18px] font-bold text-[#4C4CDD] mb-6 flex items-center gap-2">
             배송지 정보
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[13px]">
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">납품처</span><span>{{ order.shippingName }}</span></div>
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">수령인</span><span class="font-medium">{{ order.recipientName }}</span></div>
            <div class="flex border-b border-gray-200 pb-2 md:col-span-2"><span class="w-32 text-gray-500">배송 주소</span><span class="flex-1">{{ order.address }}</span></div>
            <div class="flex border-b border-gray-200 pb-2"><span class="w-32 text-gray-500">연락처</span><span>{{ order.recipientContact }}</span></div>
          </div>
        </section>
      </div>

      <aside class="lg:col-span-1 space-y-6">
        <div class="sticky top-8 space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-200 ">
            <h3 class="text-[18px] font-bold mb-6 text-[#4C4CDD]">주문 요약</h3>
            <div class="space-y-4 text-sm mb-6 border-b pb-6">
              <div class="flex justify-between text-gray-500">
                <span>총 품목 종류</span>
                <span class="text-gray-900 font-bold">{{ order.totalItemCount }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>총 주문 수량</span>
                <span class="text-gray-900 font-bold">{{ formatNumber(order.totalQuantity) }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-900 font-semibold">결제 금액</span>
              <span class="text-[15px] font-semibold text-[#4C4CDD]">₩ {{ formatNumber(order.totalPrice) }}</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200 ">
            <h3 class="text-[18px] font-bold mb-6 text-[#4C4CDD]">주문 담당자 정보</h3>
            <div class="space-y-4 text-[13px]">
              <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span class="text-gray-500 font-medium">담당자</span>
                <span class="text-gray-900 font-bold">{{ order.managerName || '-' }}</span>
              </div>
              <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span class="text-gray-500 font-medium">연락처</span>
                <span class="text-gray-900 font-bold">{{ order.managerContact || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getClientOrderDetail } from '@/api/order/salesOrder';

const route = useRoute();
const order = ref(null);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true; 
  try {
    const orderId = route.params.orderId;
    order.value = await getClientOrderDetail(orderId);
  } catch (err) {
    console.error('데이터 로드 실패:', err);
    alert('주문 정보를 불러올 수 없습니다.');
  } finally {
    isLoading.value = false; 
  }
});

const getStatusLabel = (status) => {
  const map = {
    'CLI_SO_RED': '접수대기',
    'CLI_SO_ING': '진행중',
    'CLI_SO_SHIPPING': '배송중',
    'CLI_SO_DONE': '완료',
    'CLI_SO_CANCEL': '취소'
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const map = {
    'CLI_SO_RED': 'bg-amber-50 text-amber-600 border border-amber-200',
    'CLI_SO_ING': 'bg-blue-50 text-blue-600 border border-blue-200',
    'CLI_SO_SHIPPING': 'bg-indigo-50 text-indigo-600 border border-indigo-200',
    'CLI_SO_DONE': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    'CLI_SO_CANCEL': 'bg-rose-50 text-rose-600 border border-rose-200'
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

const formatNumber = (val) => new Intl.NumberFormat().format(val);
</script>

<style scoped>
.font-sans {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}
</style>