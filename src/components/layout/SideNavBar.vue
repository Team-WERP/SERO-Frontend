<template>
    <aside class="side-nav">
        <div class="side-nav__inner">
            <!-- 추후 섹션 타이틀이 필요하면 여기에 -->
            <ul class="side-nav__list">
                <li v-for="item in sideMenu" :key="item.path" class="side-nav__item">
                    <RouterLink :to="item.path" class="side-nav__link"
                        :class="{ 'side-nav__link--active': isActive(item.path) }">
                        {{ item.name }}
                    </RouterLink>
                </li>
            </ul>
        </div>
    </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()
const menuStore = useMenuStore()

const sideMenu = computed(() => {
    return menuStore.menus[menuStore.activeModule] || []
})

const isActive = (path) => {
    // children 경로까지 포괄하도록 startsWith 사용
    return route.path.startsWith(path)
}
</script>

<style scoped>
.side-nav {
    width: 220px;
    min-height: calc(100vh - 64px);
    /* 상단바 높이 제외 */
    border-right: 1px solid #e5e7eb;
    background-color: #ffffff;
}

.side-nav__inner {
    padding: 24px 12px;
}

.side-nav__list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.side-nav__item {
    height: 45px;
}

.side-nav__link {
    height: 38px;
    display: block;
    padding: 10px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 400;
    color: #4b5563;
    text-decoration: none;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.side-nav__link:hover {
    background-color: #f3f4ff;
}

.side-nav__link--active {
    height: 38px;
    background-color: #EFF2FE;
    font-weight: 600;
}
</style>
