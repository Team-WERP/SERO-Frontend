import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { useNotificationStore } from "./notification";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        clientId: null,
        isAuthenticated: false,
        authorities: [],
        tokenExp: null,
        now: Date.now(),
    }),

    getters: {
        isLoggedIn: (state) => state.isAuthenticated,

        hasAuthority: (state) => (auth) => state.authorities.includes(auth),

        userName: (state) => state.user?.name || state.user?.email || "",

        userRoleLabel: (state) => {
            if (state.authorities.includes("AC_SYS")) return "시스템 관리자";
            if (state.authorities.includes("AC_SAL")) return "영업팀";
            if (state.authorities.includes("AC_PRO")) return "생산팀";
            if (state.authorities.includes("AC_WHS")) return "물류팀";
            if (state.authorities.includes("AC_CLI")) return "고객사";
            return "사용자";
        },

        userPosition: (state) => {
            if (state.user?.position.includes("JP_CEO")) return "사장";
            if (state.user?.position.includes("JP_DIR")) return "이사";
            if (state.user?.position.includes("JP_MGR")) return "부장";
            if (state.user?.position.includes("JP_SM")) return "과장";
            if (state.user?.position.includes("JP_AM")) return "대리";
            if (state.user?.position.includes("JP_STF")) return "직원";

            return "";
        },

        userRank: (state) => {
            if (state.user?.rank.includes("JR_CEO")) return "CEO";
            if (state.user?.rank.includes("JR_TL")) return "팀장";
            if (state.user?.rank.includes("JR_TM")) return "팀원";

            return state.user?.rank;
        },

        userDepartment: (state) => {
            if (state.user?.department?.includes("DEPT_SAL")) return "영업부";
            if (state.user?.department?.includes("DEPT_PRO")) return "생산부";
            if (state.user?.department?.includes("DEPT_WHS")) return "물류부";
            if (state.user?.department?.includes("DEPT_SAL_1")) return "영업1팀";
            if (state.user?.department?.includes("DEPT_SAL_2")) return "영업1팀";
            if (state.user?.department?.includes("DEPT_PRO_1")) return "생산1팀";
            if (state.user?.department?.includes("DEPT_PRO_2")) return "생산2팀";
            if (state.user?.department?.includes("DEPT_WHS_1")) return "물류1팀";
            if (state.user?.department?.includes("DEPT_WHS_2")) return "물류2팀";

            return "";
        },

        remainingTimeMs(state) {
            if (!state.tokenExp) return 0;
            return Math.max(state.tokenExp - state.now, 0);
        },

        remainingTimeText() {
            if (!this.tokenExp) return "";

            const ms = this.remainingTimeMs;
            const m = Math.floor(ms / 60000);
            const s = Math.floor((ms % 60000) / 1000);

            return `${m}분 ${s}초`;
        },
        isExpiringSoon() {
            return this.remainingTimeMs <= 5 * 60 * 1000;
        },
    },

    actions: {
        /** 로그인 성공 직후 1회 호출 */
        setFromToken(token) {
            const payload = jwtDecode(token);

            this.user = {
                email: payload.sub,
                id: payload.id,
                position: payload.pos,
                rank: payload.rank,
                department: payload.dept,
                // name: payload.name || payload.username || payload.sub
            };

            this.authorities = payload.auth ? payload.auth.split(",") : [];
            this.tokenExp = payload.exp * 1000;
            this.isAuthenticated = true;
        },

        /** 로그아웃 */
        logout() {
            this.user = null;
            this.clientId = null;
            this.authorities = [];
            this.tokenExp = null;
            this.isAuthenticated = false;

            localStorage.removeItem("accessToken");

            // SSE 연결 종료 및 알림 초기화
            const notificationStore = useNotificationStore();
            notificationStore.reset();
            localStorage.removeItem("name");
        },
        initialize() {
            const token = localStorage.getItem("accessToken");
            if (token) {
                this.setFromToken(token);
                return true;
            }
            return false;
        },
        tick() {
            this.now = Date.now();
        },
        setTokenExp(exp) {
            this.tokenExp = exp;
        },

        async refreshToken() {
            // const res = await refreshTokenApi();
            // this.setTokenExp(res.accessTokenExp); // 🔄 카운트 리셋
        },
    },
});
