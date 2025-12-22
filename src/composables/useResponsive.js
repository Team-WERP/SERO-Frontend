import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
    const isMobile = ref(false)

    const check = () => {
        isMobile.value = window.innerWidth < 1280
    }

    onMounted(() => {
        check()
        window.addEventListener('resize', check)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', check)
    })

    return { isMobile }
}
