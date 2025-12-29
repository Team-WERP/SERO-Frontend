import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        clientId: null,
        isAuthenticated: false,
        authorities: []
    }),

    getters: {
        isLoggedIn: (state) => state.isAuthenticated,

        hasAuthority: (state) => (auth) =>
            state.authorities.includes(auth),

        userName: (state) =>
            state.user?.name ||
            state.user?.email ||
            "",

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
        }
    },

    actions: {
        /** 로그인 성공 직후 1회 호출 */
        setFromToken(token) {
            const payload = jwtDecode(token);

            this.user = {
                email: payload.sub,
                id: payload.id,
                position: payload.pos
                // name: payload.name || payload.username || payload.sub
            };

            this.authorities = payload.auth
                ? payload.auth.split(",")
                : [];

            this.isAuthenticated = true;
        },

        /** 로그아웃 */
        logout() {
            this.user = null;
            this.clientId = null;
            this.authorities = [];
            this.isAuthenticated = false;

            localStorage.removeItem("accessToken");
            localStorage.removeItem("name")
        }
    }
});
