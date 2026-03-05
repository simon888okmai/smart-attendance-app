import axios from 'axios';

// ดึงค่าจาก .env ที่เราตั้งชื่อไว้
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});