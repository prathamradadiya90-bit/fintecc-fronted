import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { clientsApi } from './api/clientsApi';
import { bankStatementsApi } from './api/bankStatementsApi';
import { dashboardApi } from './api/dashboardApi';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [bankStatementsApi.reducerPath]: bankStatementsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, clientsApi.middleware, bankStatementsApi.middleware, dashboardApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


