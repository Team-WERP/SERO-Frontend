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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'
import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'

const route = useRoute()
const { isMobile } = useResponsive()

const showLayout = computed(() => {
    return !route.meta.hideLayout
})

const showSidebar = computed(() => {
    if (route.meta.hideLayout) return false
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

.layout-content__inner {
    padding: 24px;
    min-height: 100%;
}

.no-padding {
    padding: 0;
}
</style>
