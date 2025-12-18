import api from './axios';

const LOGIN_URL = {
    hq: '/auth/login',
    client: '/clients/auth/login'
}

export const login = (employeeType, data) => api.post(LOGIN_URL[employeeType], data);