<template>
    <div class="layout-root">
        <template v-if="showSidebar">
            <TopNavBar />

            <div class="layout-body">
                <SideNavBar />
                <main class="layout-content">
                    <RouterView />
                </main>
            </div>
        </template>

        <template v-else>
            <div class="layout-body">
                <main class="layout-content">
                    <RouterView />
                </main>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'

const route = useRoute();

const hideSidebarPaths = ['/login'];

const showSidebar = computed(() => {
    return !hideSidebarPaths.includes(route.path);
});
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
    /* 전체 배경 라이트 그레이 */
}

.layout-content {
    flex: 1;
    /* padding: 24px; */
    overflow: auto;
}
</style>