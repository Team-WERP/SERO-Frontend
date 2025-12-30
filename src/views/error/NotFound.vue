<template>
    <div class="min-h-screen flex flex-col items-center justify-center">
        <img :src="logo" class="w-120">

        <h1 class="text-2xl font-semibold text-gray-800 mb-2">
            페이지를 찾을 수 없습니다.
        </h1>

        <p class="text-sm text-gray-500 mb-6 text-center">
            존재하지 않거나 이동된 페이지입니다.<br />
            메뉴를 통해 다른 페이지로 이동해 주세요.
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
import { useRouter } from "vue-router";
import logo from "@/assets/404_logo.png";

const router = useRouter();

const goHome = () => {
    router.push("/");
};

const goBack = () => {
    router.back();
};
</script>

<style scoped></style>