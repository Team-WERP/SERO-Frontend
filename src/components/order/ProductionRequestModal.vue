<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div class="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between border-b p-5">
        <h2 class="text-xl font-bold text-[#4C4CDD] flex items-center gap-2">
          <span class="w-1.5 h-6 bg-[#4C4CDD] rounded-full"></span>
          생산 요청
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <div class="flex justify-between items-end mb-3">
            <h3 class="font-bold text-gray-800">재고 확인</h3>
            <span class="text-[11px] text-gray-400">*AUn 기준</span>
          </div>
          <div class="rounded-xl border border-gray-200 overflow-hidden">
            <table class="w-full text-sm text-center">
              <thead class="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th class="px-3 py-3 border-b">품목코드</th>
                  <th class="px-3 py-3 border-b">품목명</th>
                  <th class="px-3 py-3 border-b">가용재고</th>
                  <th class="px-3 py-3 border-b">주문수량</th>
                  <th class="px-3 py-3 border-b text-red-500">필요생산수량</th>
                  <th class="px-3 py-3 border-b">생산요청</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in draftItems" :key="item.soItemId">
                  <td class="px-3 py-4 text-gray-600">{{ item.itemCode }}</td>
                  <td class="px-3 py-4 font-medium">{{ item.itemName }}</td>
                  <td class="px-3 py-4">{{ item.availableStock }}</td>
                  <td class="px-3 py-4">{{ item.quantity }}</td>
                  <td class="px-3 py-4 text-red-500 font-bold">{{ item.productionRequest }}</td>
                  <td class="px-3 py-4">
                    <input 
                      v-model.number="item.requestQty" 
                      type="number" 
                      class="w-20 rounded border border-gray-300 px-2 py-1 text-right focus:border-[#4C4CDD] outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-[11px] text-gray-400">*필요생산수량 = 주문수량 - 가용재고</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex items-center">
            <label class="w-24 text-sm font-bold text-gray-700">요청 부서</label>
            <span class="text-sm font-medium">생산팀</span>
          </div>
          <div class="flex items-center">
            <label class="w-24 text-sm font-bold text-gray-700">생산마감일시</label>
            <input 
              v-model="dueAt" 
              type="datetime-local" 
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4C4CDD] outline-none shadow-sm"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-gray-700">요청 사유</label>
            <textarea 
              v-model="reason" 
              placeholder="사유를 입력해주세요"
              class="h-24 w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#4C4CDD] outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 bg-gray-50 p-4 border-t">
        <button 
          @click="$emit('close')" 
          class="rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-300"
        >
          취소
        </button>
        <button 
          @click="submitDraft" 
          class="rounded-lg bg-[#4C4CDD] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3b3bbb] shadow-lg shadow-indigo-100"
        >
          임시저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  soId: Number,
  items: Array,
  initialData: Object,
  isUpdate: Boolean
});

const emit = defineEmits(['close', 'submit']);

const dueAt = ref('');
const reason = ref('');
const draftItems = ref([]);

onMounted(() => {
  if (props.isUpdate && props.initialData) {
    dueAt.value = props.initialData.dueAt ? props.initialData.dueAt.replace(' ', 'T').slice(0, 16) : '';
    reason.value = props.initialData.reason || '';
  
    if (props.initialData.items && props.initialData.items.length > 0) {
      draftItems.value = props.initialData.items.map(item => ({
        soItemId: item.soItemId,      
        itemCode: item.itemCode,       
        itemName: item.itemName,        
        availableStock: item.availableStock, 
        quantity: item.orderQuantity,     
        productionRequest: item.requiredQuantity, 
        requestQty: item.requestedQuantity 
      }));
    }
  } else {
   
    draftItems.value = props.items.map(item => ({
      soItemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      availableStock: item.availableStock,
      quantity: item.quantity,
      productionRequest: item.productionRequest,
      requestQty: item.productionRequest 
    }));
  }
});
const submitDraft = () => {
  if (!dueAt.value) {
    alert('생산 마감일시를 선택해주세요.');
    return;
  }
  
  const payload = {
    dueAt: dueAt.value.replace('T', ' '),
    reason: reason.value,
    items: draftItems.value.map(i => ({
      soItemId: i.soItemId,
      quantity: i.requestQty
    }))
  };
  
  emit('submit', payload);
};
</script>