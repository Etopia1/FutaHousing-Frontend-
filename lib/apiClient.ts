import axios from 'axios';

const RENDER_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || 'https://futahousing-backend.onrender.com/api';
const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_API_URL || 'https://futa-housing-backend.vercel.app/api';

// Main API Client (Render - for general processes and Sockets)
const api = axios.create({
    baseURL: RENDER_URL,
});

// Email/Auth Dedicated Client (Vercel - for fast serverless triggers)
export const emailApi = axios.create({
    baseURL: VERCEL_URL,
});

// Shared interceptor function for auth tokens
const authInterceptor = (config: any) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

api.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
emailApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

export default api;

