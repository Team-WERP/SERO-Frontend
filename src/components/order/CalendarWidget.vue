<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
          <span class="w-2 h-4 bg-[#4C4CDD] rounded-full"></span>
          <h3 class="font-bold text-slate-800 text-[16px]">납기 일정 캘린더</h3>
      </div>
      <div class="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
        <button @click="moveMonth(-1)" class="p-1 hover:bg-white hover:shadow-sm rounded transition-all"><ChevronLeft size="16"/></button>
        <span class="text-xs font-bold px-2 min-w-[80px] text-center">{{ format(viewDate, 'yyyy. MM') }}</span>
        <button @click="moveMonth(1)" class="p-1 hover:bg-white hover:shadow-sm rounded transition-all"><ChevronRight size="16"/></button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="bg-slate-50 py-2 text-center text-[11px] font-bold text-slate-400 uppercase">
        {{ d }}
      </div>
      <div 
        v-for="(date, i) in calendarDays" :key="i"
        @click="$emit('update:selectedDate', date)"
        :class="['h-24 p-2 bg-white cursor-pointer transition-all hover:bg-blue-50 relative',
          isSameDay(date, selectedDate) ? 'ring-2 ring-inset ring-[#4C4CDD]/30 z-10 bg-blue-50/30' : '']"
      >
        <span :class="['text-xs font-medium', getDay(date) === 0 ? 'text-red-500' : 'text-slate-600']">{{ format(date, 'd') }}</span>
        
        <div v-if="getDayEvent(date)" class="mt-2 flex flex-col gap-1">
          <div class="bg-[#4C4CDD] text-white text-[9px] px-1 py-0.5 rounded font-bold text-center animate-in fade-in">
            {{ getDayEvent(date).count }}건 납기
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps(['events', 'selectedDate']);
const emit = defineEmits(['update:selectedDate', 'change-month']);

const viewDate = ref(new Date(2026, 0, 1));

const calendarDays = computed(() => {
  const start = startOfMonth(viewDate.value);
  const end = endOfMonth(viewDate.value);
  return eachDayOfInterval({ start, end });
});

const moveMonth = (val) => {
  viewDate.value = val > 0 ? addMonths(viewDate.value, 1) : subMonths(viewDate.value, 1);
  emit('change-month', { 
    year: viewDate.value.getFullYear(), 
    month: viewDate.value.getMonth() + 1 
  });
};

const getDayEvent = (date) => {
  const s = format(date, 'yyyy-MM-dd');
  return props.events.find(e => e.date === s);
};
</script>