<template>
    <div class="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 transition-opacity">
        <div class="flex flex-col w-110 border border-white bg-white p-8 text-5 rounded">

            <div class="flex flex-row items-center justify-between mb-6">
                <div class="flex items-center gap-2 text-5">
                    <div class="w-1 h-5 bg-[#4C4CDD]"></div>
                    <h2 class="font-bold text-[20px]">자동 로그아웃 안내</h2>
                </div>

            </div>
            <p class="font-bold">로그아웃까지 남은 시간: <span class="text-[#4C4CDD]">{{ displayTime }} 초</span></p>
            잠시 후 자동으로 로그아웃될 예정입니다.<br>
            로그인 시간을 연장하시겠습니까?

            <div class="flex flex-row justify-items-end font-bold mt-6 gap-3 justify-end">
                <button class="border border-[#6a7282] text-gray-500 py-1.5 px-3 rounded"
                    @click=" $emit('logout')">로그아웃</button>
                <button class="border border-[#4C4CDD] bg-[#4C4CDD] text-white py-1.5 px-3 rounded"
                    @click="$emit('extend')">로그인
                    연장</button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { watch } from "vue";
import { ref } from "vue";

const props = defineProps({
    seconds: Number,
});

const displayTime = ref("00:00");

watch(
    () => props.seconds,
    (val) => {
        const m = String(Math.floor(val / 60)).padStart(2, "0");
        const s = String(val % 60).padStart(2, "0");
        displayTime.value = `${m}:${s}`;
    },
    { immediate: true }
);
</script>

<style scoped></style>
