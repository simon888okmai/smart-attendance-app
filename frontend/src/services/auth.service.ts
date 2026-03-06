import { api } from './api';

const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

const register = async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
};

// รวมเป็น object เพื่อให้เรียกใช้ผ่าน authService.login ได้สะดวก
export const authService = {
    login,
    register
};