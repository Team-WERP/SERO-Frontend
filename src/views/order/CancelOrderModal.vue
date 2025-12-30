<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h3 class="text-xl font-bold text-gray-900">주문 취소</h3>
      </div>

      <div class="p-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">취소 사유 <span class="text-red-500">*</span></label>
        <textarea 
          v-model="rejectionReason"
          class="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm"
          placeholder="취소 사유를 입력해 주세요 (최소 2자 이상)"
        ></textarea>
        <p v-if="errorMsg" class="text-xs text-red-500 mt-2 font-medium">{{ errorMsg }}</p>
      </div>

      <div class="p-4 bg-gray-50 flex gap-3 justify-end">
        <button 
          @click="$emit('close')" 
          class="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          닫기
        </button>
        <button 
          @click="handleConfirm"
          :disabled="isSubmitting"
          class="px-5 py-2 text-sm font-bold text-white bg-[#4C4CDD] hover:bg-[#3b3bbb] rounded-lg transition-all disabled:bg-gray-400"
        >
          {{ isSubmitting ? '처리 중...' : '주문 취소 확정' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isSubmitting: Boolean
});

const emit = defineEmits(['close', 'confirm']);

const rejectionReason = ref('');
const errorMsg = ref('');

const handleConfirm = () => {
  if (!rejectionReason.value.trim()) {
    errorMsg.value = '취소 사유를 입력해 주세요.';
    return;
  }
  errorMsg.value = '';
  emit('confirm', { rejectionReason: rejectionReason.value });
};
</script>