<template>
    <div class="layout-root">
        <template v-if="showLayout">
            <TopNavBar />

            <div class="layout-body">
                <SideNavBar v-if="showSidebar" />
                <main class="layout-content">
                    <RouterView />
                </main>
            </div>
        </template>

        <template v-else>
            <main class="layout-content">
                <RouterView />
            </main>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'
import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'

const route = useRoute()
const { isMobile } = useResponsive()

const hideLayoutPaths = ['/login']

const showLayout = computed(() => {
    return !hideLayoutPaths.includes(route.path)
})

const showSidebar = computed(() => {
    if (hideLayoutPaths.includes(route.path)) return false
    return !isMobile.value
})
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
</style>
