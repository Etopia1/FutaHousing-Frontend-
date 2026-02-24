import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/apiClient';

interface AdminState {
    stats: any;
    users: any[];
    totalUsers: number;
    pendingDocs: any[];
    bookings: any[];
    hostels: any[];
    selectedUserDocs: any[];
    loading: boolean; // Global loading (true if any is loading)
    loadings: {
        stats: boolean;
        users: boolean;
        docs: boolean;
        bookings: boolean;
        hostels: boolean;
    };
    error: string | null;
}

const initialState: AdminState = {
    stats: null,
    users: [],
    totalUsers: 0,
    pendingDocs: [],
    bookings: [],
    hostels: [],
    selectedUserDocs: [],
    loading: false,
    loadings: {
        stats: false,
        users: false,
        docs: false,
        bookings: false,
        hostels: false,
    },
    error: null,
};

export const fetchAdminStats = createAsyncThunk('admin/stats', async (_, { rejectWithValue }) => {
    try { return (await api.get('/admin/stats')).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const fetchAllUsers = createAsyncThunk('admin/users', async (params: any = {}, { rejectWithValue }) => {
    try { return (await api.get('/admin/users', { params })).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const verifyUserAction = createAsyncThunk('admin/verifyUser', async (id: string, { rejectWithValue }) => {
    try { return (await api.put(`/admin/users/${id}/verify`)).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const rejectUserAction = createAsyncThunk('admin/rejectUser', async (id: string, { rejectWithValue }) => {
    try { return (await api.put(`/admin/users/${id}/reject`)).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const fetchPendingDocs = createAsyncThunk('admin/pendingDocs', async (_, { rejectWithValue }) => {
    try { return (await api.get('/admin/documents/pending')).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const reviewDoc = createAsyncThunk('admin/reviewDoc', async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try { return (await api.put(`/admin/documents/${id}/review`, { status })).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const fetchAllBookings = createAsyncThunk('admin/bookings', async (_, { rejectWithValue }) => {
    try { return (await api.get('/admin/bookings')).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const fetchAllHostels = createAsyncThunk('admin/hostels', async (_, { rejectWithValue }) => {
    try { return (await api.get('/admin/hostels')).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const deleteHostelAction = createAsyncThunk('admin/deleteHostel', async (id: string, { rejectWithValue }) => {
    try { return (await api.delete(`/admin/hostels/${id}`)).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const fetchUserDocsAction = createAsyncThunk('admin/userDocs', async (userId: string, { rejectWithValue }) => {
    try { return (await api.get(`/admin/users/${userId}/documents`)).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const updateAdminBankAction = createAsyncThunk('admin/updateBank', async (data: any, { rejectWithValue }) => {
    try { return (await api.put('/admin/bank-details', data)).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

export const adminWithdrawAction = createAsyncThunk('admin/withdraw', async (amount: number, { rejectWithValue }) => {
    try { return (await api.post('/admin/withdraw', { amount })).data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            // Stats
            .addCase(fetchAdminStats.pending, (state) => { state.loadings.stats = true; state.loading = true; state.error = null; })
            .addCase(fetchAdminStats.fulfilled, (state, { payload }) => {
                state.loadings.stats = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.stats = payload;
            })
            .addCase(fetchAdminStats.rejected, (state, action) => {
                state.loadings.stats = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.error = action.payload as string;
            })

            // Users
            .addCase(fetchAllUsers.pending, (state) => { state.loadings.users = true; state.loading = true; state.error = null; })
            .addCase(fetchAllUsers.fulfilled, (state, { payload }) => {
                state.loadings.users = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.users = payload.users;
                state.totalUsers = payload.total;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loadings.users = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.error = action.payload as string;
            })

            .addCase(verifyUserAction.fulfilled, (state, { payload }) => {
                state.users = state.users.map(u => u._id === payload.user._id ? payload.user : u);
            })
            .addCase(rejectUserAction.fulfilled, (state, action) => {
                const id = action.meta.arg;
                state.users = state.users.filter(u => u._id !== id);
            })

            // Pending Docs
            .addCase(fetchPendingDocs.pending, (state) => { state.loadings.docs = true; state.loading = true; state.error = null; })
            .addCase(fetchPendingDocs.fulfilled, (state, { payload }) => {
                state.loadings.docs = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.pendingDocs = payload;
            })
            .addCase(fetchPendingDocs.rejected, (state, action) => {
                state.loadings.docs = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.error = action.payload as string;
            })

            // Bookings
            .addCase(fetchAllBookings.pending, (state) => { state.loadings.bookings = true; state.loading = true; state.error = null; })
            .addCase(fetchAllBookings.fulfilled, (state, { payload }) => {
                state.loadings.bookings = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.bookings = payload;
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.loadings.bookings = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.error = action.payload as string;
            })

            // Hostels
            .addCase(fetchAllHostels.pending, (state) => { state.loadings.hostels = true; state.loading = true; state.error = null; })
            .addCase(fetchAllHostels.fulfilled, (state, { payload }) => {
                state.loadings.hostels = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.hostels = payload;
            })
            .addCase(fetchAllHostels.rejected, (state, action) => {
                state.loadings.hostels = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.error = action.payload as string;
            })

            .addCase(deleteHostelAction.fulfilled, (state, action) => {
                const id = action.meta.arg;
                state.hostels = state.hostels.filter(h => h._id !== id);
            })

            // Single User Docs
            .addCase(fetchUserDocsAction.pending, (state) => { state.loadings.docs = true; state.loading = true; state.error = null; })
            .addCase(fetchUserDocsAction.fulfilled, (state, { payload }) => {
                state.loadings.docs = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.selectedUserDocs = payload;
            })
            .addCase(fetchUserDocsAction.rejected, (state, action) => {
                state.loadings.docs = false;
                state.loading = Object.values(state.loadings).some(v => v);
                state.error = action.payload as string;
            })

            .addCase(reviewDoc.fulfilled, (state, { payload }) => {
                // Remove from pending list
                state.pendingDocs = state.pendingDocs.filter(d => d._id !== payload.doc._id);
                // Update in selected user docs if looking at one user
                state.selectedUserDocs = state.selectedUserDocs.map(d => d._id === payload.doc._id ? payload.doc : d);
            })
            .addCase(updateAdminBankAction.fulfilled, (state, { payload }) => {
                if (state.stats) {
                    state.stats.adminBankDetails = payload.bankDetails;
                }
            })
            .addCase(adminWithdrawAction.fulfilled, (state, { payload }) => {
                if (state.stats) {
                    state.stats.adminBalance = payload.balance;
                }
            });
    },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
