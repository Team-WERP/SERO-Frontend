<template>
    <div class="user-profile">
        <div class="user-profile__avatar">
            {{ userInitial }}
        </div>
        <div class="user-profile__info">
            <div class="user-profile__name">{{ userName }}</div>
            <div class="user-profile__role">{{ userRole }}</div>
        </div>
        <button @click="handleLogout" class="ml-4 px-3 py-1 text-[14px] bg-[#4C4CDD] text-white rounded cursor-pointer">
            로그아웃
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { logout } from '@/api/auth'

// TODO: 실제로는 store나 props에서 받아와야 함
const userName = '김영업'
const userRole = '영업1팀 · 팀장'

const userInitial = computed(() => {
    return userName.charAt(0)
})

const handleLogout = async () => {
    const permissions = localStorage.getItem('permissions') || '';
    const isClient = permissions.includes('AC_CLI');

    try {
        await logout(isClient ? 'client' : 'hq');
    } catch (error) {
        console.error('로그아웃 API 실패:', error);
    } finally {
        localStorage.removeItem('permissions');
        localStorage.removeItem('accessToken');
        
        window.location.href = '/login';
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
