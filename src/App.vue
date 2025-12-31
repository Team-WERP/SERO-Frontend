<template>
  <RouterView />
  <ExpireSessionModal v-if="userStore.isExpireModalOpen" :seconds="userStore.remainingSeconds" @extend="handleExtend"
    @logout="userStore.logout" />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useSessionTimer } from "@/composables/useSessionTimer";
import { useUserStore } from "@/stores/user";
import ExpireSessionModal from "@/components/common/ExpireSessionModal.vue";

const userStore = useUserStore();
useSessionTimer();

const handleExtend = async () => {
  await userStore.reissueToken();
};
</script>