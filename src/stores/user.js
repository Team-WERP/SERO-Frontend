// src/stores/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        clientId: null, // 고객사 ID
        isAuthenticated: false
    }),

    getters: {
        getCurrentUser: (state) => state.user,
        getClientId: (state) => state.clientId,
        isLoggedIn: (state) => state.isAuthenticated
    },

    actions: {
        setUser(userData) {
            this.user = userData;
            this.clientId = userData?.clientId || null;
            this.isAuthenticated = !!userData;
        },

        setClientId(clientId) {
            this.clientId = clientId;
        },

        logout() {
            this.user = null;
            this.clientId = null;
            this.isAuthenticated = false;
        }
    }
});
