<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white w-[900px] h-[600px] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">

      <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
      </div>

      <div class="flex justify-between items-center p-6 border-b border-gray-400 shrink-0">
        <h2 class="text-xl font-bold">품목 목록</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div class="p-6 bg-gray-50 border-b border-gray-400 flex gap-3 shrink-0">
        <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="품목명 또는 코드를 검색하세요"
          class="w-80 border border-gray-600 rounded-lg px-4 py-1 text-[13px] outline-none focus:ring-2 focus:ring-indigo-500" />
        <button @click="handleSearch"
          class="bg-[#4C4CDD] text-white px-6 py-2 rounded-lg font-bold text-[15px] hover:bg-indigo-700">
          검색
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-3">
        <table class="w-full text-[13px]">
          <thead class="text-gray-400 border-b text-center sticky top-0 bg-white">
            <tr>
              <th class="pb-3 w-10">
                <input type="checkbox" @change="toggleAll" :checked="isAllSelected" />
              </th>
              <th class="pb-3 px-4">품목코드</th>
              <th class="pb-3 px-4">품목명</th>
              <th class="pb-3 px-4">규격</th>
              <th class="pb-3 px-4">단위</th>
              <th class="pb-3 px-4">단가</th>
              <th class="pb-3 px-4">최소주문수량</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-center">
            <tr v-if="!isLoading && filteredItems.length === 0">
              <td colspan="7" class="py-20 text-gray-400">조회된 품목이 없습니다.</td>
            </tr>
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-indigo-50/30 transition-colors">
              <td class="py-4">
                <input type="checkbox" v-model="selectedIds" :value="item" />
              </td>
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

      <div class="p-4 border-t border-gray-400 flex justify-end gap-3 bg-gray-50 shrink-0">
        <button @click="$emit('close')"
          class="px-6 py-2.5 rounded-lg bg-gray-200 font-bold hover:bg-gray-300 text-[15px]">취소</button>
        <button @click="submit"
          class="px-6 py-2.5 rounded-lg bg-[#4C4CDD] text-white font-bold hover:bg-indigo-700 text-[15px]">
          선택 품목 추가 ({{ selectedIds.length }})
        </button>
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
const clientId = userStore.clientId;

const items = ref([]);
const selectedIds = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return items.value;
  return items.value.filter(item => {
    const nameMatch = item.itemName?.toLowerCase().includes(query);
    const codeMatch = item.itemCode?.toLowerCase().includes(query);
    return nameMatch || codeMatch;
  });
});

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

const isAllSelected = computed(() => {
  return filteredItems.value.length > 0 &&
    filteredItems.value.every(fi => selectedIds.value.some(si => si.id === fi.id));
});

const toggleAll = (e) => {
  if (e.target.checked) {
    const currentIds = selectedIds.value.map(s => s.id);
    const toAdd = filteredItems.value.filter(f => !currentIds.includes(f.id));
    selectedIds.value.push(...toAdd);
  } else {
    const filterIds = filteredItems.value.map(f => f.id);
    selectedIds.value = selectedIds.value.filter(s => !filterIds.includes(s.id));
  }
};

const formatNumber = (val) => new Intl.NumberFormat().format(val);
const handleSearch = () => { };

const submit = () => {
  if (selectedIds.value.length === 0) {
    alert('추가할 품목을 선택해주세요.');
    return;
  }
  emit('select', selectedIds.value);
};
</script>