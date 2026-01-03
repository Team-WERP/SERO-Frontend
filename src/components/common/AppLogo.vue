<template>
    <img :src="logo" @click="goToHome" alt="SERO Logo" class="app-logo" />
</template>

<script setup>
import logo from '@/assets/logo.png'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
    router.push("/");
}
</script>

<style scoped>
.app-logo {
    height: 28px;
    cursor: pointer;
}
</style>
