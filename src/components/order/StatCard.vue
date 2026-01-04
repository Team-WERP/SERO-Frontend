<template>
  <div class="bg-white p-5 rounded-2xl border border-slate-200">
    <div class="flex justify-between items-start mb-2">
      <p class="text-slate-600 text-[13px] font-medium">{{ title }}</p>
    </div>

    <div class="flex items-baseline gap-2 mt-1 flex-wrap">
      <div class="flex items-baseline gap-1">
        <span class="text-xl font-bold">{{ value }}</span>
        <span class="text-sm font-bold">{{ unit }}</span>
      </div>

      <div v-if="diff !== null && diff !== undefined" class="flex items-center gap-1 text-[11px] font-medium">
        <span class="text-slate-500">전월대비</span>
        <span class="font-bold px-1.5 py-0.5 rounded transition-colors text-red-600 bg-red-50 ">
          {{ Number(diff) > 0 ? '+' + diff : diff }}{{ unit2 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['title', 'value', 'unit', 'diff', 'color', 'unit2']);
</script>