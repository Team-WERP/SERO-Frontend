import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { logout as logoutApi } from "@/api/auth.js";

let timer = null;
let isLoggingOut = false;

export function useSessionTimer() {
    const userStore = useUserStore();
    const router = useRouter();

    const startTimer = () => {
        if (timer) return;

        timer = setInterval(() => {
            userStore.heartbeat++;

            const remain = userStore.remainingSeconds;

            // 만료 90초 전 모달 오픈
            if (remain <= 90 && remain > 0) {
                if (!userStore.isExpireModalOpen) {
                    userStore.isExpireModalOpen = true;
                    userStore.modalShownInTab = true;
                }
            }

            // 만료 시 강제 로그아웃
            if (remain <= 0) {
                stopTimer();
                handleLogout(true);
            }
        }, 1000);
    };

    const handleLogout = async (expired = false) => {
        if (isLoggingOut) return;
        isLoggingOut = true;

        userStore.isSessionHandling = true;
        userStore.isExpireModalOpen = false;

        try {
            const type = userStore.hasAuthority("AC_CLI") ? "client" : "hq";

            await logoutApi(type);
        } catch (e) {
            console.error("로그아웃 API 실패", e);
        } finally {
            stopTimer();
            userStore.logout();

            isLoggingOut = false;

            router.replace(expired ? "/session-expired" : "/login");

            setTimeout(() => {
                userStore.isSessionHandling = false;
            }, 500);
        }
    };

    const stopTimer = () => {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
    };

    onMounted(() => {
        if (userStore.isAuthenticated) {
            startTimer();
        }
    });

    watch(
        () => userStore.isAuthenticated,
        (isAuth) => {
            if (isAuth) startTimer();
            else stopTimer();
        }
    );

    return {
        logout: handleLogout,
    };
}
