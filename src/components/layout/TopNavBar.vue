<template>
    <header class="top-nav">
        <div class="top-nav__inner">
            <!-- 로고 영역 -->
            <div class="top-nav__logo">
                <AppLogo />
            </div>

            <!-- 상단 메뉴 -->
            <nav class="top-nav__menu">
                <button v-for="item in navItems" :key="item.key" class="top-nav__item"
                    :class="{ 'top-nav__item--active': isActive(item.key) }" @click="change(item.key)">
                    {{ item.label }}
                </button>
            </nav>

            <!-- 우측 여백(알림/유저 영역 자리) -->
            <div class="top-nav__right"></div>
        </div>
    </header>
</template>

<script setup>
import { useMenuStore } from '@/stores/menu'
import { useRouter } from 'vue-router'
import AppLogo from '@/components/common/AppLogo.vue'

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
    align-items: center;
}

.top-nav__inner {
    width: 100%;
    max-width: 1440px;
    display: flex;
    align-items: center;
}

.top-nav__logo {
    width: 220px;
    display: flex;
    padding-left: 24px;
}

.top-nav__menu {
    display: flex;
    align-items: center;
    padding-left: 24px;
    gap: 32px;
}

.top-nav__item {
    border: none;
    background: none;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    color: #4b5563;
    font-weight: 400;
    transition: color 0.15s ease, border-color 0.15s ease;
}

.top-nav__item:hover {
    font-weight: 600;
}

.top-nav__item--active {
    color: #4C4CDD;
    font-weight: 600;
}

.top-nav__right {
    margin-left: auto;
    display: flex;
    align-items: center;
}
</style>
