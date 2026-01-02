import axios from 'axios';
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            // 토큰에서 공백 제거
            const cleanToken = token.trim();
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                localStorage.removeItem('accessToken');
                const userStore = useUserStore();

                if (userStore.isSessionHandling) {
                    return Promise.reject(error);
                }

                const currentPath = window.location.pathname;

                // 로그인 페이지가 아닌 경우에만 리다이렉트
                if (!currentPath.startsWith('/login') && !currentPath.includes('/delivery/login')) {
                    // 배송 앱에서는 배송 로그인으로, 일반 앱에서는 일반 로그인으로
                    if (currentPath.startsWith('/delivery/')) {
                        window.location.href = '/delivery/login';
                    } else {
                        window.location.href = '/login';
                    }
                }
            }
        }

        return Promise.reject(error);
    }
)

export default api;