import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/apiClient';
import { User } from '../types/interfaces';
import { toast } from 'react-toastify';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage or fetch user profile on mount
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (credentials: any) => {
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            router.push('/dashboard');
            toast.success('Login Successful');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Login Failed');
        }
    };

    const register = async (data: any) => {
        try {
            const res = await api.post('/auth/register', data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            router.push('/dashboard');
            toast.success('Registration Successful');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration Failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth/login');
    };

    return { user, login, register, logout };
};
