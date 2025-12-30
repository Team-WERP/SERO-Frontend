<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
      <div class="mb-6 flex items-center gap-2">
        <div class="h-6 w-1 bg-[#4C4CDD]"></div>
        <h2 class="text-xl font-bold text-[#4C4CDD]">담당자 배정</h2>
      </div>

      <div class="mb-8 rounded-lg bg-[#F9FAFB] p-6 min-h-[300px] overflow-y-auto">
        <div v-for="dept in departmentData" :key="dept.id" class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-bold text-gray-900">{{ dept.deptName }}</span>
          </div>

          <div v-for="team in dept.teams" :key="team.id" class="ml-4 border-l border-gray-300 pl-4 mb-4">
            <div class="mb-2 font-semibold text-gray-700">{{ team.deptName }}</div>

            <div class="ml-4 space-y-3">
              <label v-for="emp in team.employees" :key="emp.id" 
                     class="flex cursor-pointer items-center gap-3 hover:text-[#4C4CDD]">
                <input type="radio" 
                       :value="emp" 
                       v-model="selectedEmployee"
                       name="manager"
                       class="h-4 w-4 border-gray-300 text-[#4C4CDD] focus:ring-[#4C4CDD]" />
                <span class="text-sm text-gray-800">{{ emp.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="$emit('close')" 
                class="rounded-lg bg-gray-200 px-6 py-2 font-bold text-gray-700 hover:bg-gray-300">
          취소
        </button>
        <button @click="handleConfirm" 
                :disabled="!selectedEmployee"
                class="rounded-lg bg-[#4C4CDD] px-6 py-2 font-bold text-white hover:bg-[#3B3BB0] disabled:opacity-50">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  departmentData: { type: Array, required: true }
});

const emit = defineEmits(['close', 'confirm']);
const selectedEmployee = ref(null);

const handleConfirm = () => {
  if (selectedEmployee.value) {
    emit('confirm', selectedEmployee.value);
  }
};
</script>