import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});