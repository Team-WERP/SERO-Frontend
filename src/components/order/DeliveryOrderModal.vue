<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div class="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between border-b p-5">
        <h2 class="text-xl font-bold text-[#4C4CDD] flex items-center gap-2">
          <span class="w-1.5 h-6 bg-[#4C4CDD] rounded-full"></span>
          납품 요청
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <div class="flex justify-between items-end mb-3">
            <h3 class="font-bold text-gray-800">재고 확인</h3>
            <span class="text-[11px] text-gray-400">*AUn 기준</span>
          </div>
          <div class="rounded-xl border border-gray-200 overflow-x-auto">
            <table class="w-full text-sm text-center min-w-[700px]">
              <thead class="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th class="px-3 py-3 border-b">품목코드</th>
                  <th class="px-3 py-3 border-b">품목명</th>
                  <th class="px-3 py-3 border-b">가용재고</th>
                  <th class="px-3 py-3 border-b">주문수량</th>
                  <th class="px-3 py-3 border-b text-red-500">미출고수량</th>
                  <th class="px-3 py-3 border-b">신규출고요청</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in draftItems" :key="item.soItemId">
                  <td class="px-3 py-4 text-gray-600">{{ item.itemCode }}</td>
                  <td class="px-3 py-4 font-medium">{{ item.itemName }}</td>
                  <td class="px-3 py-4">{{ formatNumber(item.availableStock) }}</td>
                  <td class="px-3 py-4">{{ formatNumber(item.quantity) }}</td>
                  <td class="px-3 py-4 text-red-500 font-bold">{{ formatNumber(item.unshippedQty) }}</td>
                  <td class="px-3 py-4">
                    <input 
                      v-model.number="item.doQuantity" 
                      type="number" 
                      class="w-24 rounded border border-gray-300 px-2 py-1 text-right focus:border-[#4C4CDD] outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-[11px] text-gray-400">*미출고수량 = 주문수량 - 출고지시완료수량</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center">
              <label class="w-24 text-sm font-bold text-gray-700">요청 부서</label>
              <span class="text-sm font-medium text-gray-900">물류팀</span>
            </div>
            <div class="flex items-center">
              <label class="w-24 text-sm font-bold text-gray-700">납기일시</label>
              <input 
                v-model="shippedAt" 
                type="datetime-local" 
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4C4CDD] outline-none"
              />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-gray-700">특이사항</label>
            <textarea 
              v-model="note" 
              placeholder="특이사항을 입력해주세요"
              class="h-full min-h-[100px] w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#4C4CDD] outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 bg-gray-50 p-4 border-t">
        <button @click="$emit('close')" :disabled="isSubmitting" class="rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">취소</button>
        <button @click="submitDO" :disabled="isSubmitting" class="rounded-lg bg-[#4C4CDD] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3b3bbb] disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="isSubmitting">생성 중...</span>
          <span v-else>납품서 생성</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  soId: Number,
  items: Array,
  historyItems: Array
});

const emit = defineEmits(['close', 'submit']);

const shippedAt = ref('');
const note = ref('');
const isSubmitting = ref(false);

// 모달이 열릴 때마다 상태 초기화 (props.items가 변경되면 모달이 새로 열린 것)
watch(() => props.items, () => {
  isSubmitting.value = false;
  shippedAt.value = '';
  note.value = '';
}, { immediate: true });

const draftItems = ref(props.items.map(item => {
  const history = props.historyItems?.find(h => h.itemId === item.id) || { doQuantity: 0 };
  const unshippedQty = item.quantity - (history.doQuantity || 0);

  return {
    soItemId: item.id,
    itemCode: item.itemCode,
    itemName: item.itemName,
    availableStock: item.availableStock,
    quantity: item.quantity,
    unshippedQty: unshippedQty > 0 ? unshippedQty : 0,
    doQuantity: 0
  };
}));

const formatNumber = (n) => new Intl.NumberFormat().format(n || 0);

const submitDO = () => {
  // 중복 클릭 방지 - 이미 제출 중이면 무시
  if (isSubmitting.value) {
    console.warn('이미 납품서 생성 중입니다. 중복 클릭이 무시되었습니다.');
    return;
  }

  if (!shippedAt.value) return alert('납기일시를 선택해주세요.');

  const payload = {
    soId: props.soId,
    shippedAt: shippedAt.value.replace('T', ' '),
    note: note.value,
    items: draftItems.value
      .filter(i => i.doQuantity > 0)
      .map(i => ({
        soItemId: i.soItemId,
        doQuantity: i.doQuantity
      }))
  };

  if (payload.items.length === 0) return alert('신규 출고 요청 수량을 1개 이상 입력해주세요.');

  // 제출 시작 - 버튼 비활성화
  isSubmitting.value = true;

  // 부모에게 이벤트 전달 (부모에서 성공 시 모달을 닫으면 watch가 상태를 초기화함)
  emit('submit', payload);

  // 안전장치: 3초 후 자동으로 상태 리셋 (네트워크 오류 등으로 모달이 안 닫힐 경우 대비)
  setTimeout(() => {
    if (isSubmitting.value) {
      console.warn('제출 상태가 3초 이상 유지되어 자동으로 리셋합니다.');
      isSubmitting.value = false;
    }
  }, 3000);
};
</script>