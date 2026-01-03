<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-200 flex flex-col">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h3 class="font-bold text-xl text-slate-800">월별 수주 목표 및 달성 상세</h3>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <XIcon size="24" />
        </button>
      </div>

      <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="bg-blue-50 p-5 rounded-2xl border border-slate-200">
            <p class="text-[11px] font-bold text-gray-600 uppercase mb-1">총 목표액</p>
            <p class="text-xl font-bold text-slate-900">{{ formatPrice(totalGoal) }}</p>
          </div>
          <div class="bg-emerald-50 p-5 rounded-2xl border border-slate-200">
            <p class="text-[11px] font-bold text-gray-600 uppercase mb-1">총 수주실적</p>
            <p class="text-xl font-bold text-slate-900">{{ formatPrice(totalActual) }}</p>
          </div>
          <div class="bg-orange-50 p-5 rounded-2xl border border-slate-200">
            <p class="text-[11px] font-bold text-gray-600 uppercase mb-1">평균 달성률</p>
            <p class="text-xl font-bold text-slate-900">{{ avgAchieveRate }}%</p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden justify-center text-center">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-100/50">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">연월</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">목표액</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">수주실적</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">달성률</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in sortedData" :key="idx" class="border-t border-white hover:bg-white transition-colors">
                <td class="p-4 text-sm text-slate-700">{{ item.goalYear }}. {{ item.goalMonth }}</td>
                <td class="p-4 text-sm text-slate-600">₩{{ item.goalAmount.toLocaleString() }}</td>
                <td class="p-4 text-sm text-slate-900">₩{{ item.actualAmount.toLocaleString() }}</td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500" :style="{ width: Math.min(calculateRate(item), 100) + '%' }"></div>
                    </div>
                    <span class="text-xs w-10 text-right">{{ calculateRate(item) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button @click="$emit('close')" class="px-8 py-3 bg-[#4C4CDD] text-white rounded-xl text-sm font-bold hover:bg-[#4c4cddcb] transition-all">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { X as XIcon } from 'lucide-vue-next';

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

defineEmits(['close']);

// 데이터 정렬 (최신순)
const sortedData = computed(() => {
  return [...props.data].sort((a, b) => {
    if (a.goalYear !== b.goalYear) return b.goalYear - a.goalYear;
    return b.goalMonth - a.goalMonth;
  });
});

// 총액 계산
const totalGoal = computed(() => props.data.reduce((acc, cur) => acc + cur.goalAmount, 0));
const totalActual = computed(() => props.data.reduce((acc, cur) => acc + cur.actualAmount, 0));
const avgAchieveRate = computed(() => {
  if (totalGoal.value === 0) return 0;
  return ((totalActual.value / totalGoal.value) * 100).toFixed(1);
});

// 가격 포맷팅 (단위: 억/백만)
const formatPrice = (val) => {
  if (val >= 100000000) return `₩${(val / 100000000).toFixed(2)}억`;
  return `₩${(val / 1000000).toFixed(1)}M`;
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
</style>