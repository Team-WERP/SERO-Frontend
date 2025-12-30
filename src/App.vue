<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useSessionTimer } from "@/composables/useSessionTimer";

useSessionTimer();
</script>