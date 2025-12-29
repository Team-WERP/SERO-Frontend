<template>
    <aside class="side-nav">
        <div class="side-nav__inner">
            <ul class="side-nav__list">
                <li v-for="item in sideMenu" :key="item.path" class="side-nav__item">
                    <RouterLink :to="item.path" class="side-menu-link"
                        :class="{ 'side-menu-link--active': isActive(item.path) }">
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
import { useUserStore } from '@/stores/user'

const route = useRoute()
const menuStore = useMenuStore()
const userStore = useUserStore()

const sideMenu = computed(() => {
    const menus = menuStore.menus[menuStore.activeModule] || []

    return menus.filter(menu => {
        if (!menu.role) return true

        return menu.role.some(role =>
            userStore.authorities.includes(role)
        )
    })
})

const isActive = (path) => {
    return route.path.startsWith(path)
}
</script>

<style scoped>
.side-nav {
    width: 220px;
    min-height: calc(100vh - 64px);
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
</style>
