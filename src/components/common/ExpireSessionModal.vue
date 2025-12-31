<template>
    <div class="expire-modal">
        <p>세션이 곧 만료됩니다.</p>
        <p>{{ displayTime }} 후 자동 로그아웃됩니다.</p>
        <div class="buttons">
            <button @click="$emit('extend')">재발급</button>
            <button @click="$emit('logout')">로그아웃</button>
        </div>
    </div>
</template>

<script setup>
import { computed, watch } from "vue";
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

<style scoped>
.expire-modal {
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 1px solid #ccc;
    padding: 20px;
    z-index: 9999;
    border-radius: 8px;
    text-align: center;
}

.buttons {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

button {
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
