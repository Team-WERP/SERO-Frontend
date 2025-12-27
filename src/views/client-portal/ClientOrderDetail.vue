<template>
  <div v-if="order" class="min-h-screen bg-gray-50 p-8 font-sans">
    <header class="mb-8">
      <router-link to="/order/list" class="text-sm text-gray-500 hover:underline">‹ 목록으로 돌아가기</router-link>
      <div class="flex items-center gap-3 mt-2">
        <h1 class="text-[32px] font-bold text-gray-900">주문 상세</h1>
        <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-[13px] font-bold">
          {{ getStatusLabel(order.status) }}
        </span>
      </div>
      <span class="text-[13px] text-gray-500 ml-1">담당자: {{ order.managerName }}</span>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 space-y-8">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <h3 class="text-[18px] font-bold text-[#4C4CDD] mb-4">기본 주문 정보</h3>
            <div class="space-y-3 text-[13px]">
              <div class="flex justify-between"><span class="text-gray-500">주문번호</span><span class="font-medium">{{ order.soCode }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">PO번호</span><span class="font-medium">{{ order.poCode || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">주문일시</span><span>{{ order.orderedAt }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">납기 요청일</span><span class="font-medium">{{ order.shippedAt }}</span></div>
              <div class="pt-2 border-t border-gray-100">
                <p class="text-gray-500 mb-1">비고</p>
                <p class="text-gray-800 italic">{{ order.note || '특이사항 없음' }}</p>
              </div>
            </div>
          </section>

          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <h3 class="text-[18px] font-bold text-[#4C4CDD] mb-4">주문서 / 납품서</h3>
            <div class="space-y-3 text-[13px]">
              <div>
                <p class="text-gray-500 mb-1">주문서</p>
                <a v-if="order.soUrl" :href="order.soUrl" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  주문서 확인하기
                </a>
                <span v-else class="text-gray-400">등록된 주문서 없음</span>
              </div>
              <div class="pt-2 border-t border-gray-100">
                <p class="text-gray-500 mb-1">납품서</p>
                <div v-if="order.doUrls && order.doUrls.length" class="space-y-1">
                  <a v-for="(url, idx) in order.doUrls" :key="idx" :href="url" target="_blank" class="text-blue-600 hover:underline block truncate">
                    납품서_{{ idx + 1 }}.pdf
                  </a>
                </div>
                <span v-else class="text-gray-400">등록된 납품서 없음</span>
              </div>
            </div>
          </section>
        </div>

        <section class="bg-white rounded-xl border border-gray-200 overflow-hidden ">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#4C4CDD]">주문 품목 정보</h3>
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
                <th class="py-3 px-4">금액</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, idx) in order.items" :key="item.id" class="hover:bg-gray-50">
                <td class="py-4 text-gray-400">{{ idx + 1 }}</td>
                <td class="py-4 font-medium text-gray-700">{{ item.itemCode }}</td>
                <td class="py-4">
                  <p class="font-semibold text-gray-900">{{ item.itemName }}</p>
                </td>
                <td class="py-4">
                  <span >{{ formatNumber(item.quantity) }}</span>
                </td>
                 <td>{{ item.unit }}</td>
                <td class="py-4"> {{ formatNumber(item.unitPrice) }}</td>
                <td class="py-4 font-medium">₩ {{ formatNumber(item.totalPrice) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50/50 font-semibold border-t-1 border-gray-600">
              <tr>
                <td colspan="3" class="py-4 text-right pr-6">합계</td>
                <td class="py-4">{{ formatNumber(order.totalQuantity) }}</td>
                <td class="py-4"></td>
                <td class="py-4"></td>
                <td class="py-4">₩ {{ formatNumber(order.totalPrice) }}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section class="bg-white p-6 rounded-xl border border-gray-200 max-w-2xl">
          <h3 class="text-[18px] font-bold text-[#4C4CDD] mb-6 flex items-center gap-2">
           배송지 정보
          </h3>
          <div class="grid grid-cols-1 gap-4 text-[13px]">
            <div class="flex border-b border-gray-50 pb-3"><span class="w-32 text-gray-500 font-medium">납품처</span><span>{{ order.shippingName }}</span></div>
            <div class="flex border-b border-gray-50 pb-3"><span class="w-32 text-gray-500 font-medium">상세 주소</span><span>{{ order.address }}</span></div>
            <div class="flex border-b border-gray-50 pb-3"><span class="w-32 text-gray-500 font-medium">수령인</span><span>{{ order.recipientName }}</span></div>
            <div class="flex"><span class="w-32 text-gray-500 font-medium">연락처</span><span>{{ order.recipientContact }}</span></div>
          </div>
        </section>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-8">
          <div class="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 class="text-[18px] font-bold mb-6 text-[#4C4CDD]">주문 요약</h3>
            <div class="space-y-4 text-sm mb-8 border-b pb-6">
              <div class="flex justify-between text-gray-500">
                <span>총 품목 종류</span>
                <span class="text-gray-900 font-semibold">{{ order.totalItemCount }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>총 주문 수량</span>
                <span class="text-gray-900 font-semibold">{{ formatNumber(order.totalQuantity) }}</span>
              </div>
            </div>
            
            <div class="mb-2">
              <div class="flex justify-between items-end font-semibold">
                <span class="text-base text-gray-900">최종 결제 금액</span>
                <span class="text-[15px] text-[#4C4CDD]">₩ {{ formatNumber(order.totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getClientOrderDetail } from '@/api/order/salesOrder';

const route = useRoute();
const order = ref(null);

onMounted(async () => {
  try {
    const orderId = route.params.orderId;
    order.value = await getClientOrderDetail(orderId);
  } catch (err) {
    console.error('데이터 로드 실패:', err);
    alert('주문 정보를 불러올 수 없습니다.');
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