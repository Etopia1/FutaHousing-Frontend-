import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/apiClient';
import { Hostel } from '../../types/interfaces';

interface HostelState {
    hostels: Hostel[];
    selectedHostel: Hostel | null;
    loading: boolean;
    error: string | null;
}

const initialState: HostelState = {
    hostels: [],
    selectedHostel: null,
    loading: false,
    error: null,
};

export const fetchHostels = createAsyncThunk('hostels/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/hostels');
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || 'Failed to fetch hostels');
    }
});

export const fetchHostelById = createAsyncThunk('hostels/fetchOne', async (id: string, { rejectWithValue }) => {
    try {
        const res = await api.get(`/hostels/${id}`);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || 'Failed to fetch hostel');
    }
});

const hostelSlice = createSlice({
    name: 'hostels',
    initialState,
    reducers: {
        clearSelectedHostel(state) {
            state.selectedHostel = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHostels.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchHostels.fulfilled, (state, action) => { state.loading = false; state.hostels = action.payload; });
        builder.addCase(fetchHostels.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
        builder.addCase(fetchHostelById.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchHostelById.fulfilled, (state, action) => { state.loading = false; state.selectedHostel = action.payload; });
        builder.addCase(fetchHostelById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { clearSelectedHostel } = hostelSlice.actions;
export default hostelSlice.reducer;
