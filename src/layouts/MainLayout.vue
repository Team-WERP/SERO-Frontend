<template>
    <div class="layout-root">
        <template v-if="showLayout">
            <TopNavBar />

            <div class="layout-body">
                <SideNavBar v-if="showSidebar" />

                <main class="layout-content">
                    <div class="layout-content__inner">
                        <RouterView />
                    </div>
                </main>
            </div>
        </template>

        <template v-else>
            <main class="layout-content">
                <div class="layout-content__inner" :class="{ 'no-padding': route.meta.noPadding }">
                    <RouterView />
                </div>
            </main>
        </template>
    </div>
</template>


<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'
import { useMenuStore } from '@/stores/menu'

import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'

const route = useRoute()
const { isMobile } = useResponsive()
const menuStore = useMenuStore()

const showLayout = computed(() => {
    return !route.meta.hideLayout
})

const showSidebar = computed(() => {
    if (route.meta.hideLayout) return false
    if (route.path === '/forbidden') return false
    return !isMobile.value
})

/**
 * route.path → activeModule 동기화
 */
const MODULE_BY_PATH = [
    { key: 'clientPortal', prefix: '/client-portal' },
    { key: 'order', prefix: '/order' },
    { key: 'production', prefix: '/production' },
    { key: 'warehouse', prefix: '/warehouse' },
    { key: 'master', prefix: '/master' },
    { key: 'approval', prefix: '/approval' },
    { key: 'notices', prefix: '/notices' },
    { key: 'system', prefix: '/system' }
]

watch(
    () => route.path,
    (path) => {
        const matched = MODULE_BY_PATH.find(m => path.startsWith(m.prefix))
        if (matched && menuStore.activeModule !== matched.key) {
            menuStore.setActiveModule(matched.key)
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.layout-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.layout-body {
    display: flex;
    flex: 1;
    background-color: #f9fafb;
}

.layout-content {
    flex: 1;
    overflow: auto;
}

.layout-content__inner {
    padding: 24px;
    min-height: 100%;
}

.no-padding {
    padding: 0;
}
</style>
