import { apiClient } from '@/config/api';

const LOGIN_URL = {
    hq: '/auth/login',
    client: '/clients/auth/login'
};

const LOGOUT_URL = {
    hq: '/auth/logout',
    client: '/clients/auth/logout'
};

export const login = (employeeType, data) => apiClient.post(LOGIN_URL[employeeType], data);
export const logout = (employeeType) => apiClient.post(LOGOUT_URL[employeeType]);