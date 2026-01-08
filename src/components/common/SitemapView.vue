<template>
    <div>
        <div class="border-b border-gray-200 pb-6 mb-10">
            <h1 class="text-3xl font-bold text-gray-900">사이트맵</h1>
            <p class="mt-2 text-gray-500">권한에 따라 접근 가능한 모든 메뉴를 한눈에 확인하실 수 있습니다.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div v-for="nav in filteredSitemap" :key="nav.key"
                class="flex flex-col space-y-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-50">
                    <div class="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h2 class="text-lg font-bold text-gray-800">{{ nav.label }}</h2>
                </div>

                <ul class="flex flex-col space-y-2">
                    <li v-for="menu in nav.subMenus" :key="menu.path">
                        <RouterLink :to="menu.path"
                            class="group flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                            <span class="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
                            <span class="text-[15px] leading-relaxed">{{ menu.name }}</span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'

const menuStore = useMenuStore()
const userStore = useUserStore()

// TopNav의 navItems와 동기화
const navItems = [
    { key: 'clientPortal', label: '고객포털', roles: ['AC_CLI'] },
    { key: 'order', label: '주문', roles: ['AC_SAL', 'AC_PRO', 'AC_WHS', 'AC_SYS'] },
    { key: 'production', label: '생산', roles: ['AC_SAL', 'AC_PRO', 'AC_SYS'] },
    { key: 'warehouse', label: '재고·물류', roles: ['AC_SAL', 'AC_PRO', 'AC_WHS', 'AC_SYS'] },
    { key: 'master', label: '기준정보', roles: ['AC_SAL', 'AC_PRO', 'AC_WHS', 'AC_SYS'] },
    { key: 'approval', label: '전자결재', roles: ['AC_SAL', 'AC_PRO', 'AC_WHS', 'AC_SYS'] },
    { key: 'notices', label: '공지사항', roles: ['AC_SAL', 'AC_PRO', 'AC_WHS', 'AC_SYS'] },
    { key: 'system', label: '관리자', roles: ['AC_SYS'] },
]

const filteredSitemap = computed(() => {
    const roles = userStore.authorities

    return navItems
        .filter(nav => !nav.roles || nav.roles.some(r => roles.includes(r)))
        .map(nav => {
            // menuStore에서 각 모듈별 메뉴를 가져와 권한 필터링
            const subMenus = (menuStore.menus[nav.key] || []).filter(menu =>
                !menu.role || menu.role.some(r => roles.includes(r))
            )
            return { ...nav, subMenus }
        })
        .filter(nav => nav.subMenus.length > 0)
})
</script>