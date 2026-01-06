<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
      <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
      </div>

      <div class="flex justify-between items-center p-6 border-b border-gray-400">
        <h2 class="text-xl font-bold">최근 주문 이력</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <table class="w-full text-[13px] text-center table-fixed">
          <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-400">
            <tr>
              <th class="py-3 px-2 w-12">선택</th>
              <th class="py-3 px-2 w-32">주문번호</th>
              <th class="py-3 px-2 w-28">주문일</th>
              <th class="py-3 px-2 w-20">대표 품목</th>
              <th class="py-3 px-2 w-20">총 수량</th>
              <th class="py-3 px-2 w-28">총 금액</th>
              <th class="py-3 px-2 w-28">납품지</th>
              <th class="py-3 px-2 w-16">상세</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-for="order in historyList" :key="order.orderId">
              <tr @click="selectedOrderId = order.orderId"
                  :class="selectedOrderId === order.orderId ? 'bg-indigo-50/50' : 'hover:bg-gray-50'"
                  class="cursor-pointer transition-colors">
                <td class="py-4 px-2">
                  <input type="radio" :value="order.orderId" v-model="selectedOrderId" class="accent-[#4C4CDD]" @click.stop />
                </td>
                <td class="py-4 px-2 font-medium text-gray-700">{{ order.soCode }}</td>
                <td class="py-4 px-2 text-gray-500">{{ order.orderedAt?.split(' ')[0] }}</td>
                <td class="py-4 px-2 font-medium">
                  {{ order.mainItemName }} 
                  <span v-if="order.items.length > 1" class="font-normal ml-1">외 {{ order.items.length - 1 }}건</span>
                </td>
                <td class="py-4 px-2">{{ order.totalQuantity }}</td>
                <td class="py-4 px-2 font-bold text-gray-900">{{ formatNumber(order.totalPrice) }}</td>
                <td class="py-4 px-2 truncate">{{ order.shippingName }}</td>
                <td class="py-4 px-2 text-center">
                  <button @click.stop="toggleOrder(order.orderId)" 
                          class="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <svg :class="{'rotate-180': expandedOrderIds.includes(order.orderId)}"
                         class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </td>
              </tr>

              <tr v-if="expandedOrderIds.includes(order.orderId)" class="bg-gray-50/80">
                <td colspan="8" class="p-0">
                  <div class="px-12 py-4 border-l-4 border-indigo-200 mx-4 my-2">
                    <table class="w-full text-[12px] bg-white border border-gray-200 rounded-lg shadow-sm">
                      <thead class="bg-gray-100 text-gray-500 font-semibold border-b text-center">
                        <tr>
                          <th class="py-2 px-4 ">품목코드</th>
                          <th class="py-2 px-4 ">품목명</th>
                          <th class="py-2 px-4">규격</th>
                          <th class="py-2 px-4 w-20">수량</th>
                          <th class="py-2 px-4 w-16">단위</th>
                          <th class="py-2 px-4">단가</th>
                          <th class="py-2 px-4">금액</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in order.items" :key="item.id" class="text-center hover:bg-indigo-50/30">
                          <td class="py-2 px-4 font-medium text-gray-700">{{ item.itemCode }}</td>
                          <td class="py-2 px-4 font-medium">{{ item.itemName }}</td>
                          <td class="py-2 px-4">{{ item.spec }}</td>
                          <td class="py-2 px-4">{{ item.quantity }}</td>
                          <td class="py-2 px-4">{{ item.unit }}</td>
                          <td class="py-2 px-4">{{ formatNumber(item.unitPrice) }}</td>
                          <td class="py-2 px-4 font-medium">{{ formatNumber(item.totalPrice) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!isLoading && historyList.length === 0">
              <td colspan="8" class="py-20 text-gray-400">최근 주문 이력이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 border-t border-gray-400 flex justify-end gap-3 bg-gray-50">
        <button @click="$emit('close')" class="px-6 py-2.5 rounded-lg bg-gray-200 font-bold text-[15px] hover:bg-gray-300">취소</button>
        <button @click="handleLoad" 
                :disabled="!selectedOrderId"
                class="px-6 py-2.5 rounded-lg bg-[#4C4CDD] text-white font-bold text-[15px] disabled:bg-gray-400 hover:bg-indigo-700 shadow-sm">
          정보 불러오기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getOrderHistory } from '@/api/order/salesOrder';

const emit = defineEmits(['close', 'load']);
const historyList = ref([]);
const isLoading = ref(false);
const selectedOrderId = ref(null);
const expandedOrderIds = ref([]);

onMounted(async () => {
  isLoading.value = true;
  try {
    historyList.value = await getOrderHistory();
  } catch (err) {
    console.error('이력 로드 실패:', err);
  } finally {
    isLoading.value = false;
  }
});

const toggleOrder = (orderId) => {
  const index = expandedOrderIds.value.indexOf(orderId);
  if (index > -1) {
    expandedOrderIds.value.splice(index, 1);
  } else {
    expandedOrderIds.value.push(orderId);
  }
};

const formatNumber = (val) => new Intl.NumberFormat().format(val);

const handleLoad = () => {
  if (selectedOrderId.value) {
    emit('load', selectedOrderId.value);
  }
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>