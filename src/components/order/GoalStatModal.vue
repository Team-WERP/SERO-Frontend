<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-200 flex flex-col">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-5 bg-[#4C4CDD] rounded-full"></span>
          <h3 class="font-bold text-xl text-slate-800">월별 수주 목표 설정 및 현황</h3>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <XIcon size="24" />
        </button>
      </div>

      <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
        <div class="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h4 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <PlusCircle size="16" class="text-[#4C4CDD]" /> 목표 수주액 설정/수정
          </h4>
          <div class="flex items-end gap-4">
            <div class="flex-1 grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[13px] font-bold text-slate-400 mb-1 ml-1">연도</label>
                <select v-model="form.year" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#4C4CDD] outline-none">
                  <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}년</option>
                </select>
              </div>
              <div>
                <label class="block text-[13px] font-bold text-slate-400 mb-1 ml-1">월</label>
                <select v-model="form.month" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#4C4CDD] outline-none">
                  <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
                </select>
              </div>
              <div>
                <label class="block text-[13px] font-bold text-slate-400 mb-1 ml-1">목표 금액 (원)</label>
                <input 
                  v-model.number="form.amount" 
                  type="number" 
                  placeholder="금액 입력" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#4C4CDD] outline-none"
                  @keyup.enter="handleSaveGoal"
                />
              </div>
            </div>
            <button 
              @click="handleSaveGoal" 
              class="px-6 py-2 bg-[#4C4CDD] text-white rounded-xl text-sm font-bold hover:bg-[#3b3bbd] transition-all shrink-0 h-[38px]"
            >
              저장/수정
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p class="text-[13px] font-bold text-slate-400 uppercase mb-1">총 목표액</p>
            <p class="text-xl font-bold text-slate-900">{{ formatPrice(totalGoal) }}</p>
          </div>
          <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p class="text-[13px] font-bold text-slate-400 uppercase mb-1">총 수주실적</p>
            <p class="text-xl font-bold text-slate-900">{{ formatPrice(totalActual) }}</p>
          </div>
          <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p class="text-[13px] font-bold text-slate-400 uppercase mb-1">평균 달성률</p>
            <p class="text-xl font-bold text-slate-900">{{ avgAchieveRate }}%</p>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table class="w-full border-collapse text-center">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-[13px] font-bold border-b border-slate-200">
                <th class="p-4">연월</th>
                <th class="p-4">목표액</th>
                <th class="p-4">수주실적</th>
                <th class="p-4">달성률</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in sortedData" :key="idx" class="border-t border-slate-100 hover:bg-slate-50 transition-colors text-[13px]">
                <td class="p-4">{{ item.goalYear }}. {{ String(item.goalMonth).padStart(2, '0') }}</td>
                <td class="p-4">₩{{ item.goalAmount.toLocaleString() }}</td>
                <td class="p-4">₩{{ item.actualAmount.toLocaleString() }}</td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-3">
                    <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        class="h-full bg-[#4C4CDD] transition-all duration-500" 
                        :style="{ width: Math.min(calculateRate(item), 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs font-bold w-12 text-right text-slate-700">{{ calculateRate(item) }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!data || data.length === 0">
                <td colspan="4" class="p-12 text-slate-400 text-sm italic">등록된 목표 데이터가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button @click="$emit('close')" class="px-8 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X as XIcon, PlusCircle } from 'lucide-vue-next';
import { updateDashboardGoals } from '@/api/order/salesOrder';

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close', 'refresh']);

const form = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  amount: 0
});

const handleSaveGoal = async () => {
  if (form.value.amount <= 0) {
    alert("목표 금액을 0보다 크게 입력해주세요.");
    return;
  }

  const existingGoal = props.data.find(
    d => d.goalYear === form.value.year && d.goalMonth === form.value.month
  );

  if (existingGoal) {
    const confirmUpdate = confirm(
      `${form.value.year}년 ${form.value.month}월 목표액이 이미 존재합니다. 수치를 수정하시겠습니까?`
    );
    if (!confirmUpdate) return;

    try {
      const goalId = existingGoal.id || existingGoal.id; 
      await updateDashboardGoals(goalId, {
        goalAmount: form.value.amount
      });
      
      alert("목표 금액이 성공적으로 수정되었습니다.");
      emit('refresh');
    } catch (error) {
      console.error("목표 수정 중 오류 발생:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  } else {
    alert("해당 연월의 목표 레코드가 존재하지 않습니다. 신규 목표는 관리자 시스템을 확인해주세요.");
  }
};

const sortedData = computed(() => {
  return [...props.data].sort((a, b) => {
    if (a.goalYear !== b.goalYear) return b.goalYear - a.goalYear;
    return b.goalMonth - a.goalMonth;
  });
});

const totalGoal = computed(() => props.data.reduce((acc, cur) => acc + cur.goalAmount, 0));
const totalActual = computed(() => props.data.reduce((acc, cur) => acc + cur.actualAmount, 0));
const avgAchieveRate = computed(() => {
  if (totalGoal.value === 0) return 0;
  return ((totalActual.value / totalGoal.value) * 100).toFixed(1);
});

const formatPrice = (val) => {
  if (val >= 100000000) return `₩${(val / 100000000).toFixed(2)}억`;
  return `₩${(val / 1000000).toFixed(1)}백만`;
};
const calculateRate = (item) => {
  if (item.goalAmount === 0) return 0;
  return ((item.actualAmount / item.goalAmount) * 100).toFixed(1);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>