import { onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user";

let timer = null;

export function useSessionTimer() {
    const userStore = useUserStore();

    onMounted(() => {
        if (!userStore.isAuthenticated) return;

        if (timer) return;

        timer = setInterval(() => {
            userStore.heartbeat++;

            const remain = userStore.remainingSeconds;

            // 90초 진입 시 모달 오픈
            if (remain <= 90 && remain > 0) {
                userStore.isExpireModalOpen = true;
                userStore.modalShownInTab = true;
                localStorage.setItem('expireModalShownAt', Date.now());
            }

            // 만료 시 강제 로그아웃
            if (remain <= 0) {
                userStore.isExpireModalOpen = false;
                userStore.logout();
            }
        }, 1000);

        // 비활성 → 활성 복귀 보정
        const onVisible = () => {
            if (!document.hidden) {
                userStore.heartbeat++;
            }
        };

        document.addEventListener("visibilitychange", onVisible);

        const onStorage = (e) => {
            if (e.key === "tokenReissuedAt") {
                userStore.isExpireModalOpen = false;
                userStore.modalShownInTab = false;
                userStore.heartbeat++;
            }
        };
        window.addEventListener("storage", onStorage);

        onUnmounted(() => {
            clearInterval(timer);
            timer = null;
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("storage", onStorage);
        });
    });
}
