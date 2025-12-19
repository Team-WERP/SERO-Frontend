<template>
    <div class="fixed inset-0 z-50 bg-black/30" @click.self="$emit('close')">
        <aside class="w-72 h-full bg-white p-4 overflow-auto">
            <div v-for="nav in navItems" :key="nav.key" class="mb-2">
                <!-- 상단 메뉴 -->
                <button class="w-full text-left px-3 py-2 font-semibold"
                    :class="{ 'text-[#4C4CDD]': isActive(nav.key) }" @click="toggle(nav.key)">
                    {{ nav.label }}
                </button>

                <!-- 사이드 메뉴 -->
                <ul v-show="opened === nav.key">
                    <li v-for="item in menus[nav.key]" :key="item.path">
                        <RouterLink :to="item.path" class="block px-4 py-2 rounded text-[15px]" :class="{
                            'bg-[#EFF2FE] font-semibold':
                                route.path.startsWith(item.path)
                        }" @click="$emit('close')">
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
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()
const menuStore = useMenuStore()

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

const menus = computed(() => menuStore.menus)
const opened = ref(menuStore.activeModule)

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
</script>
