import api from './axios';

const LOGIN_URL = {
    hq: '/auth/login',
    client: '/clients/auth/login'
};

const LOGOUT_URL = {
    hq: '/auth/logout',
    client: '/clients/auth/logout'
};

const REISSUE_URL = {
    hq: '/auth/reissue',
    client: '/clients/auth/reissue'
};

export const login = (employeeType, data) => api.post(LOGIN_URL[employeeType], data);
export const logout = (employeeType) => api.post(LOGOUT_URL[employeeType]);

export const reissue = (employeeType) => api.post(REISSUE_URL[employeeType]);