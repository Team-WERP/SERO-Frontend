<template>
    <transition name="fade">
        <div v-if="show" class="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-3 rounded shadow-lg text-sm">
            {{ message }}
        </div>
    </transition>
</template>

<script setup>
defineProps({
    show: Boolean,
    message: String,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
