<template>
    <div class="min-h-screen flex flex-col items-center justify-start pt-32">
        <img :src="logo" class="w-80">

        <h1 class="text-2xl font-semibold text-gray-800 mb-2">
            접근 권한이 없습니다.
        </h1>

        <p class="text-sm text-gray-500 mb-6 text-center">
            해당 페이지에 접근할 권한이 없습니다.
        </p>

        <div class="flex gap-3">
            <button @click="goHome" class="px-4 py-2 text-sm rounded border border-[#4C4CDD] text-[#4C4CDD]
                       hover:bg-[#F3F4FF] transition">
                홈으로 이동
            </button>

            <button @click="goBack" class="px-4 py-2 text-sm rounded bg-[#4C4CDD] text-white
                       hover:bg-[#3B3BC8] transition">
                이전 페이지
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/403_logo.png'

const router = useRouter()

const goHome = () => {
    router.push('/')
}

const goBack = () => {
    router.back();
};
</script>

<style scoped></style>