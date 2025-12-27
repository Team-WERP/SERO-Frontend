<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
      
      <div
        v-if="isLoading"
        class="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
      >
        <svg class="animate-spin h-10 w-10 text-[#4C4CDD] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p class="text-[#4C4CDD] font-bold text-sm">품목 목록을 불러오는 중...</p>
      </div>

      <div class="flex justify-between items-center p-6 border-b border-gray-400">
        <h2 class="text-xl font-bold">품목 목록</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div class="p-6 bg-gray-50 border-b border-gray-400 flex gap-3">
        <input v-model="searchQuery" type="text" placeholder="품목명, 코드 또는 규격을 검색하세요" class="w-md border border-gray-600 rounded-lg px-4 py-1 text-[13px] outline-none focus:ring-2 focus:ring-indigo-500" />
        <button class="bg-[#4C4CDD] text-white px-6 py-2 rounded-lg font-bold text-[15px]">검색</button>
      </div>

      <div class="flex-1 overflow-y-auto py-3">
        <table class="w-full text-[13px]">
          <thead class="text-gray-400 border-b text-center">
            <tr>
              <th class="pb-3 w-10"><input type="checkbox" @change="toggleAll" :checked="isAllSelected" /></th>
              <th class="pb-3 px-4">품목코드</th>
              <th class="pb-3 px-4">품목명</th>
              <th class="pb-3 px-4">규격</th>
              <th class="pb-3 px-4">단위</th>
              <th class="pb-3 px-4">단가</th>
              <th class="pb-3 px-4">최소주문수량</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-center">
            <tr v-if="!isLoading && items.length === 0">
              <td colspan="7" class="py-20 text-gray-400">조회된 품목이 없습니다.</td>
            </tr>
            <tr v-for="item in items" :key="item.id" class="hover:bg-indigo-50/30 transition-colors">
              <td class="py-4"><input type="checkbox" v-model="selectedIds" :value="item" /></td>
              <td class="py-4 px-4 text-gray-500">{{ item.itemCode }}</td>
              <td class="py-4 px-4 font-medium">{{ item.itemName }}</td>
              <td class="py-4 px-4">{{ item.spec }}</td>
              <td class="py-4 px-4">{{ item.unit }}</td>
              <td class="py-4 px-4 font-medium">{{ formatNumber(item.contractPrice) }}</td>
              <td class="py-4 px-4 font-medium">{{ item.moq }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-gray-400 flex justify-end gap-3 bg-gray-50">
        <button @click="$emit('close')" class="px-6 py-2.5 rounded-lg bg-gray-200 font-bold hover:bg-gray-300 text-[15px]">취소</button>
        <button @click="submit" class="px-6 py-2.5 rounded-lg bg-[#4C4CDD] text-white font-bold hover:bg-indigo-700 text-[15px]">선택 품목 추가</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getClientItems } from '@/api/client/clientItem';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['close', 'select']);
const userStore = useUserStore();
const clientId = userStore.getClientId || 1;

const items = ref([]);
const selectedIds = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true; 
  try {
    const response = await getClientItems(clientId);
    items.value = response;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
});

const isAllSelected = computed(() => items.value.length > 0 && selectedIds.value.length === items.value.length);

const toggleAll = (e) => {
  selectedIds.value = e.target.checked ? [...items.value] : [];
};

const formatNumber = (val) => new Intl.NumberFormat().format(val);

const submit = () => {
  if (selectedIds.value.length === 0) {
    alert('추가할 품목을 선택해주세요.');
    return;
  }
  emit('select', selectedIds.value);
};
</script>