<template>
    <div class="fixed inset-0 z-50 bg-black/30" @click.self="$emit('close')">
        <aside class="w-72 h-full bg-white p-4 overflow-auto">
            <!--  로고 -->
            <div class="drawer-header">
                <AppLogo />
            </div>

            <!-- 메뉴 영역 -->
            <div v-for="nav in filteredNavItems" :key="nav.key" class="mb-2">
                <!-- 상단 메뉴 -->
                <button class="mobile-section-btn" :class="{
                    'mobile-section-btn--open': opened === nav.key,
                    'mobile-section-btn--active': isActive(nav.key)
                }" @click="toggle(nav.key)">
                    <span class="chevron" :class="{
                        'chevron--open': opened === nav.key,
                        'chevron--active': isActive(nav.key)
                    }">
                        ▶
                    </span>

                    <span class="section-label">
                        {{ nav.label }}
                    </span>
                </button>

                <!-- 사이드 메뉴 -->
                <ul class="submenu mt-2 space-y-1" :class="{ 'submenu--open': opened === nav.key }">

                    <li v-for="item in filteredMenusByModule(nav.key)" :key="item.path">
                        <RouterLink :to="item.path" class="side-menu-link" :class="{
                            'side-menu-link--active':
                                route.path.startsWith(item.path)
                        }" @click="onClickMenu(item.path, nav.key)">
                            {{ item.name }}
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import AppLogo from '@/components/common/AppLogo.vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const emit = defineEmits(['close'])
const userStore = useUserStore()

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

const opened = ref(menuStore.activeModule)

const filteredNavItems = computed(() => {
    const roles = userStore.authorities

    return navItems.filter(nav => {
        const menus = menuStore.menus[nav.key] || []
        return menus.some(menu =>
            !menu.role || menu.role.some(r => roles.includes(r))
        )
    })
})

const filteredMenusByModule = (key) => {
    const roles = userStore.authorities
    const menus = menuStore.menus[key] || []

    return menus.filter(menu =>
        !menu.role || menu.role.some(r => roles.includes(r))
    )
}

const toggle = (key) => {
    opened.value = opened.value === key ? null : key
}

const isActive = (key) => menuStore.activeModule === key

watch(
    () => menuStore.activeModule,
    (v) => {
        opened.value = v
    },
    { immediate: true }
)

const onClickMenu = (path, moduleKey) => {
    const roles = userStore.authorities
    const menus = menuStore.menus[moduleKey] || []

    const accessible = menus.find(menu =>
        menu.path === path &&
        (!menu.role || menu.role.some(r => roles.includes(r)))
    )

    if (!accessible) {
        router.push('/forbidden')
        emitClose()
        return
    }

    menuStore.setActiveModule(moduleKey)
    router.push(path)
    emitClose()
}

const emitClose = () => {
    emit('close')
}

</script>

<style>
.drawer-header {
    display: flex;
    align-items: center;
    height: 49px;
    padding: 0 4px 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.mobile-section-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 4px;
    font-size: 16px;
    font-weight: 400;
    color: #374151;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s ease, font-weight 0.15s ease;
}

.mobile-section-btn--open {
    font-weight: 600;
}

.mobile-section-btn--active {
    color: #4C4CDD;
    font-weight: 600;
}

.chevron {
    display: inline-block;
    font-size: 12px;
    color: #4b5563;
    transform: rotate(0deg);
    transition: transform 0.2s ease, color 0.2s ease;
}

.chevron--open {
    transform: rotate(90deg);
}

.chevron--active {
    color: #4C4CDD;
}

.submenu {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition:
        max-height 0.2s ease,
        opacity 0.2s ease;
}

.submenu--open {
    max-height: 500px;
    opacity: 1;
}
</style>