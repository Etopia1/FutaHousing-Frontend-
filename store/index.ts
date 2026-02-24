import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // Use sessionStorage for tab-level isolation
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import hostelReducer from './slices/hostelSlice';
import bookingReducer from './slices/bookingSlice';
import adminReducer from './slices/adminSlice';
import inspectionReducer from './slices/inspectionSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    wallet: walletReducer,
    hostels: hostelReducer,
    bookings: bookingReducer,
    admin: adminReducer,
    inspections: inspectionReducer,
});

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'], // Only persist auth by default, others can be added if needed
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
