<template>
  <RouterView />
  <ExpireSessionModal v-if="userStore.isExpireModalOpen" :seconds="userStore.remainingSeconds" @extend="handleExtend"
    @logout="userStore.logout" />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useSessionTimer } from "@/composables/useSessionTimer";
import { useUserStore } from "@/stores/user";
import { reissue as reissueApi } from '@/api/auth';
import ExpireSessionModal from "@/components/common/ExpireSessionModal.vue";

const userStore = useUserStore();
useSessionTimer();

const handleExtend = async () => {
  try {
    const type = userStore.hasAuthority("AC_CLI")
      ? "client"
      : "hq";

    const res = await reissueApi(type);

    const { accessToken, name } = res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('name', name);

    userStore.setFromToken(accessToken);
  } catch (e) {
    console.error("토큰 재발급 API 실패", e);
  } finally {
    userStore.isExpireModalOpen = false;
  }
};
</script>