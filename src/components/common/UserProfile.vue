<template>
    <div class="user-profile">
        <div class="user-profile__avatar">
            {{ userInitial }}
        </div>

        <div class="user-profile__info">
            <div class="user-profile__name">{{ userName }}</div>
            <div class="user-profile__role">{{ userRole }} · {{ userPosition }}</div>
        </div>

        <button @click="handleLogout" class="ml-4 px-3 py-1 text-[14px] bg-[#4C4CDD] text-white rounded cursor-pointer">
            로그아웃
        </button>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { logout as logoutApi } from "@/api/auth";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();

const userName = localStorage.getItem("name");
const userRole = computed(() => userStore.userRoleLabel);
const userPosition = computed(() => userStore.userPosition);

const userInitial = computed(() =>
    userName ? userName.charAt(0) : ""
);

const handleLogout = async () => {
    try {
        const type = userStore.hasAuthority("AC_CLI")
            ? "client"
            : "hq";

        await logoutApi(type);
    } catch (e) {
        console.error("로그아웃 API 실패", e);
    } finally {
        userStore.logout();
        router.replace("/login");
    }
};
</script>

<style scoped>
.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.user-profile__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #4C4CDD;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
}

.user-profile__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-profile__name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

.user-profile__role {
    font-size: 12px;
    color: #6b7280;
}
</style>
