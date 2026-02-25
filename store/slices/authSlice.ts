import { createSlice, createAsyncThunk, Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import api from '../../lib/apiClient';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'STUDENT' | 'AGENT' | 'ADMIN';
    verificationStatus: string;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        bankCode?: string;
        recipientCode?: string;
    };
    isBlocked?: boolean;
}

interface OtpState {
    required: boolean;
    purpose: 'EMAIL_VERIFY' | 'LOGIN_2FA' | 'PASSWORD_RESET' | null;
    userId: string | null;
    email: string | null;
    phone: string | null;
}


interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    otp: OtpState;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    otp: { required: false, purpose: null, userId: null, email: null, phone: null },
};

// ... Async Thunks ...

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Login — Step 1: credentials → may require OTP */
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', credentials);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || { error: 'Login failed' });
        }
    }
);

/** Register — Step 1: create account → requires email OTP */
export const registerUser = createAsyncThunk(
    'auth/register',
    async (
        data: any,
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post('/auth/register', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Registration failed');
        }
    }
);

/** Verify Email OTP (after registration) */
export const verifyEmailOtp = createAsyncThunk(
    'auth/verifyEmail',
    async (data: { userId: string; code: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/verify-email', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Verification failed');
        }
    }
);

/** Verify Login OTP (2FA after login) */
export const verifyLoginOtp = createAsyncThunk(
    'auth/verifyLogin',
    async (data: { userId: string; code: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/verify-login', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Verification failed');
        }
    }
);

/** Resend OTP */
export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (data: { userId: string; purpose: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/resend-otp', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to resend OTP');
        }
    }
);

/** Save Bank Details */
export const saveBankDetails = createAsyncThunk(
    'auth/saveBankDetails',
    async (data: { userId: string; bankName: string; accountNumber: string; accountName: string; bankCode?: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/save-bank-details', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to save bank details');
        }
    }
);

/** Fetch User Profile */
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/auth/profile');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch profile');
        }
    }
);

/** Forgot Password — Step 1: Request OTP */
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email: string, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to send reset code');
        }
    }
);

/** Verify Reset OTP — Step 2: Get Reset Token */
export const verifyResetOtp = createAsyncThunk(
    'auth/verifyResetOtp',
    async (data: { userId: string; code: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/verify-reset-otp', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Verification failed');
        }
    }
);

/** Reset Password — Step 3: Use Token to Update Pass */
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (data: { token: string; password: any; confirmPassword: any }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/reset-password', 
                { password: data.password, confirmPassword: data.confirmPassword },
                { headers: { Authorization: `Bearer ${data.token}` } }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Password reset failed');
        }
    }
);


// ─── Helper: save token to sessionStorage for apiClient ───────────────────
const persistToken = (token: string | null) => {
    if (typeof window !== 'undefined') {
        if (token) {
            sessionStorage.setItem('token', token);
        } else {
            sessionStorage.removeItem('token');
        }
    }
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.otp = { required: false, purpose: null, userId: null, email: null, phone: null };
            persistToken(null);
        },
        clearError(state) {
            state.error = null;
        },
        clearOtp(state) {
            state.otp = { required: false, purpose: null, userId: null, email: null, phone: null };
        },
        setOtpUserId(state, action) {
            state.otp.userId = action.payload;
            state.otp.required = true;
        }
    },
    extraReducers: (builder) => {
        // Reset loading on rehydration to prevent stuck buttons if app crashed/closed while loading
        builder.addCase(REHYDRATE, (state, action: any) => {
            if (action.key === 'root' && action.payload?.auth) {
                return {
                    ...action.payload.auth,
                    loading: false,
                    error: null
                };
            }
            return {
                ...state,
                loading: false,
                error: null
            };
        });

        // ── Login ──
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            const data = action.payload;
            if (data.requiresOtp) {
                state.otp = {
                    required: true,
                    purpose: data.otpPurpose,
                    userId: data.userId,
                    email: data.email,
                    phone: data.phone,
                };
                if (data.user) {
                    state.user = data.user;
                }
            } else if (data.token) {
                state.token = data.token;
                state.user = data.user;
                persistToken(data.token);
            }
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            const data = action.payload as any;
            if (data?.requiresBankDetails) {
                state.otp.userId = data.userId;
                state.otp.email = data.email;
            }
            state.error = data?.error || 'Login failed';
        });

        // ── Register ──
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            const data = action.payload;
            if (data.requiresBankDetails) {
                // Special state: user exists but need bank details
                state.otp.userId = data.userId;
                state.otp.email = data.email;
                if (data.user) state.user = data.user;
            } else if (data.requiresOtp) {
                state.otp = {
                    required: true,
                    purpose: data.otpPurpose,
                    userId: data.userId,
                    email: data.email,
                    phone: data.phone,
                };
                if (data.user) {
                    state.user = data.user;
                }
            } else if (data.token) {
                state.token = data.token;
                state.user = data.user;
                persistToken(data.token);
            }
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Verify Email OTP ──
        builder.addCase(verifyEmailOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyEmailOtp.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.otp = { required: false, purpose: null, userId: null, email: null, phone: null };
            persistToken(action.payload.token);
        });
        builder.addCase(verifyEmailOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Verify Login OTP (2FA) ──
        builder.addCase(verifyLoginOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyLoginOtp.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.otp = { required: false, purpose: null, userId: null, email: null, phone: null };
            persistToken(action.payload.token);
        });
        builder.addCase(verifyLoginOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Resend OTP ──
        builder.addCase(resendOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(resendOtp.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(resendOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Save Bank Details ──
        builder.addCase(saveBankDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(saveBankDetails.fulfilled, (state, action) => {
            state.loading = false;
            const data = action.payload;
            if (state.user) state.user.bankDetails = data.bankDetails;

            if (data.requiresOtp) {
                state.otp = {
                    required: true,
                    purpose: data.otpPurpose,
                    userId: data.userId,
                    email: data.email,
                    phone: data.phone,
                };
            }
        });
        builder.addCase(saveBankDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Get Profile ──
        builder.addCase(getProfile.fulfilled, (state, action) => {
            state.user = action.payload;
        });

        // ── Forgot Password ──
        builder.addCase(forgotPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(forgotPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.otp = {
                required: true,
                purpose: 'PASSWORD_RESET',
                userId: action.payload.userId,
                email: action.meta.arg, // email passed to the thunk
                phone: null
            };
        });
        builder.addCase(forgotPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Verify Reset OTP ──
        builder.addCase(verifyResetOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyResetOtp.fulfilled, (state) => {
            state.loading = false;
            state.otp = { required: false, purpose: null, userId: null, email: null, phone: null };
        });
        builder.addCase(verifyResetOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── Reset Password ──
        builder.addCase(resetPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(resetPassword.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(resetPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});


export const { logout, clearError, clearOtp } = authSlice.actions;
export default authSlice.reducer;
