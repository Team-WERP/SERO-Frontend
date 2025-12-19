<template>
    <header class="top-nav">
        <div class="top-nav__inner">
            <!-- 모바일: 햄버거 -->
            <button v-if="isMobile" class="top-nav__hamburger" @click="open = true">
                ☰
            </button>

            <!-- 로고 -->
            <div class="top-nav__logo">
                <AppLogo />
            </div>

            <!-- 데스크탑 상단 메뉴 -->
            <nav v-if="!isMobile" class="top-nav__menu">
                <button v-for="item in navItems" :key="item.key" class="top-nav__item"
                    :class="{ 'top-nav__item--active': isActive(item.key) }" @click="change(item.key)">
                    {{ item.label }}
                </button>
            </nav>

            <!-- 우측 유저 -->
            <div class="top-nav__right">
                <UserProfile />
            </div>
        </div>

        <!-- 모바일 오버레이 -->
        <transition name="backdrop">
            <div v-if="open" class="mobile-backdrop" @click="open = false" />
        </transition>

        <!-- 모바일 드로어 -->
        <transition name="drawer">
            <MobileMenuDrawer v-if="open" @close="open = false" />
        </transition>


    </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useResponsive } from '@/composables/useResponsive'

import AppLogo from '@/components/common/AppLogo.vue'
import UserProfile from '@/components/common/UserProfile.vue'
import MobileMenuDrawer from '@/components/layout/MobileMenuDrawer.vue'

const { isMobile } = useResponsive()
const open = ref(false)

const menuStore = useMenuStore()
const router = useRouter()

const navItems = [
    { key: 'clientPortal', label: '고객포털' },
    { key: 'order', label: '주문' },
    { key: 'production', label: '생산' },
    { key: 'warehouse', label: '재고·물류' },
    { key: 'master', label: '기준정보' },
    { key: 'approval', label: '전자결재' },
    { key: 'notices', label: '공지사항' },
    { key: 'system', label: '관리자' }
]

const defaultPath = {
    clientPortal: '/client-portal/dashboard',
    order: '/order/dashboard',
    production: '/production/dashboard',
    warehouse: '/warehouse/stock',
    master: '/master/bom',
    approval: '/approval/dashboard',
    notices: '/notices',
    system: '/system/common-code'
}

const isActive = (key) => menuStore.activeModule === key

const change = (key) => {
    menuStore.setActiveModule(key)
    router.push(defaultPath[key])
}
</script>

<style scoped>
.top-nav {
    height: 64px;
    border-bottom: 1px solid #e5e7eb;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
}

.top-nav__inner {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 16px;
}

/* 햄버거 */
.top-nav__hamburger {
    font-size: 22px;
    background: none;
    border: none;
    cursor: pointer;
}

/* 로고 */
.top-nav__logo {
    width: 220px;
    display: flex;
}

/* 메뉴 */
.top-nav__menu {
    display: flex;
    gap: 32px;
}

/* 메뉴 버튼 */
.top-nav__item {
    border: none;
    background: none;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    color: #4b5563;
    font-weight: 400;
}

.top-nav__item--active {
    color: #4C4CDD;
    font-weight: 600;
}

/* 우측 */
.top-nav__right {
    margin-left: auto;
    display: flex;
    align-items: center;
}

/* Drawer */
.drawer-enter-active {
    transition:
        transform 0.26s cubic-bezier(0.22, 0.61, 0.36, 1),
        opacity 0.22s ease-out;
}

.drawer-leave-active {
    transition:
        transform 0.22s ease-in,
        opacity 0.18s ease-in;
}

.drawer-enter-from {
    transform: translateX(-24px);
    opacity: 0;
}

.drawer-leave-to {
    transform: translateX(-16px);
    opacity: 0;
}

/* Backdrop */
.backdrop-enter-active {
    transition: opacity 0.18s ease 0.04s;
}

.backdrop-leave-active {
    transition: opacity 0.16s ease;
}
</style>
