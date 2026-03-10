import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;


console.log('[API] Base URL:', BASE_URL);

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});