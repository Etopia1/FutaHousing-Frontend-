import { useState, useEffect } from 'react';
import api from '../lib/apiClient';
import { Wallet } from '../types/interfaces';
import { toast } from 'react-toastify';

export const useWallet = () => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchWallet = async () => {
        try {
            const res = await api.get('/wallet/balance');
            setWallet(res.data);
        } catch (err) {
            console.error(err);
            // toast.error('Failed to load wallet');
        } finally {
            setLoading(false);
        }
    };

    const fundWallet = async (amount: number) => {
        try {
            await api.post('/wallet/fund', { amount });
            fetchWallet();
            toast.success('Wallet funded successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Funding failed');
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    return { wallet, loading, fundWallet };
};
