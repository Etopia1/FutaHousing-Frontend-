import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/apiClient';
import { fetchWallet } from './walletSlice';

interface InspectionState {
    inspections: any[];
    loading: boolean;
    error: string | null;
}

const initialState: InspectionState = {
    inspections: [],
    loading: false,
    error: null,
};

export const payInspection = createAsyncThunk(
    'inspections/pay',
    async (hostelId: string, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post('/inspections', { hostelId });
            dispatch(fetchWallet());
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Inspection payment failed');
        }
    }
);

export const fetchMyInspections = createAsyncThunk(
    'inspections/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/inspections/my-inspections');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch inspections');
        }
    }
);

const inspectionSlice = createSlice({
    name: 'inspections',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(payInspection.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(payInspection.fulfilled, (state) => { state.loading = false; });
        builder.addCase(payInspection.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(fetchMyInspections.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchMyInspections.fulfilled, (state, action) => { state.loading = false; state.inspections = action.payload; });
        builder.addCase(fetchMyInspections.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export default inspectionSlice.reducer;
