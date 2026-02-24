import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/apiClient';
import { Booking } from '../../types/interfaces';

interface BookingState {
    bookings: Booking[];
    loading: boolean;
    error: string | null;
}

const initialState: BookingState = {
    bookings: [],
    loading: false,
    error: null,
};

export const fetchMyBookings = createAsyncThunk(
    'bookings/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/bookings/my-bookings');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch bookings');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/create',
    async (data: { hostelId: string; amount: number }, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post('/bookings', data);
            dispatch(fetchMyBookings());
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Booking failed');
        }
    }
);

export const confirmBooking = createAsyncThunk(
    'bookings/confirm',
    async (bookingId: string, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post(`/bookings/${bookingId}/confirm`);
            dispatch(fetchMyBookings());
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Confirmation failed');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancel',
    async (bookingId: string, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.post(`/bookings/${bookingId}/cancel`);
            dispatch(fetchMyBookings());
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Cancellation failed');
        }
    }
);

const bookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMyBookings.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchMyBookings.fulfilled, (state, action) => { state.loading = false; state.bookings = action.payload; });
        builder.addCase(fetchMyBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(createBooking.fulfilled, (state) => { state.loading = false; });
        builder.addCase(createBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export default bookingSlice.reducer;
