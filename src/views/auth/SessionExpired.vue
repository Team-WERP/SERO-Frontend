<template>
    <div class="h-screen flex items-center justify-center bg-white">
        <div class="text-center">
            <p class="mb-1 text-center text-[13px] text-gray-500">
                새로운 길로, 새로
            </p>
            <img :src="logo" width="200" class="">
            <img :src="character" width="200" class="mt-10">

            <p class="text-xl text-gray-600 mb-10">
                로그인 유지 시간이 만료되어<br />
                자동 로그아웃되었습니다.
            </p>

            <button @click="goTologin" class="font-bold bg-[#4C4CDD] text-white px-6 py-2 rounded">
                다시 로그인
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import character from "@/assets/새로이새로미.png";
import logo from "@/assets/logo.png";

const router = useRouter();

const goTologin = () => {
    router.push('/login');
}
</script>