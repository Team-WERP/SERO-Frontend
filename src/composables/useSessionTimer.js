import { onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user";

let timer = null;

export function useSessionTimer() {
    const userStore = useUserStore();

    onMounted(() => {
        // 이미 타이머 있으면 중복 생성 방지
        if (!timer) {
            timer = setInterval(() => {
                userStore.tick(); // now 갱신
            }, 1000);
        }

        // 🔥 비활성 → 활성 복귀 보정
        const onVisible = () => {
            if (!document.hidden) {
                userStore.tick(); // 즉시 보정
            }
        };

        document.addEventListener("visibilitychange", onVisible);

        onUnmounted(() => {
            document.removeEventListener("visibilitychange", onVisible);
        });
    });

    onUnmounted(() => {
        clearInterval(timer);
        timer = null;
    });
}
