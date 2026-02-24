import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/apiClient';

interface Transaction {
    id: string;
    _id?: string;
    amount: number;
    type: string;
    description: string;
    status: string;
    purpose: string;
    createdAt: string;
}

interface WalletState {
    balance: number;
    escrowBalance: number;
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    balance: 0,
    escrowBalance: 0,
    transactions: [],
    loading: false,
    error: null,
};

export const fetchWallet = createAsyncThunk('wallet/fetch', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/wallet');
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || 'Failed to load wallet');
    }
});

export const initializeFunding = createAsyncThunk('wallet/initializeFunding', async (amount: number, { rejectWithValue }) => {
    try {
        const res = await api.post('/payments/initialize', { amount });
        return res.data; // { authorization_url, reference }
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || 'Failed to initialize payment');
    }
});

export const manualFunding = createAsyncThunk('wallet/manual', async (amount: number, { rejectWithValue, dispatch }) => {
    try {
        const res = await api.post('/payments/manual-fund', { amount });
        dispatch(fetchWallet());
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || 'Manual funding failed');
    }
});

export const verifyFunding = createAsyncThunk('wallet/verifyFunding', async (reference: string, { rejectWithValue, dispatch }) => {
    try {
        const res = await api.post('/wallet/verify', { reference });
        dispatch(fetchWallet());
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || 'Verification failed');
    }
});

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWallet.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchWallet.fulfilled, (state, action) => {
            state.loading = false;
            state.balance = action.payload.wallet.balance;
            state.escrowBalance = action.payload.wallet.escrowBalance;
            state.transactions = action.payload.transactions || [];
        });
        builder.addCase(fetchWallet.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        builder.addCase(initializeFunding.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(initializeFunding.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(initializeFunding.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearError } = walletSlice.actions;
export default walletSlice.reducer;
