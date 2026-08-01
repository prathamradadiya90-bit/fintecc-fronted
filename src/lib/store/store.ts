import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { clientsApi } from './api/clientsApi';
import { clientDocumentsApi } from './api/clientDocumentsApi';
import { bankStatementsApi } from './api/bankStatementsApi';
import { invoicesApi } from './api/invoicesApi';
import { dashboardApi } from './api/dashboardApi';
import { contactApi } from './api/contactApi';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [clientDocumentsApi.reducerPath]: clientDocumentsApi.reducer,
    [bankStatementsApi.reducerPath]: bankStatementsApi.reducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      clientsApi.middleware,
      clientDocumentsApi.middleware,
      bankStatementsApi.middleware,
      invoicesApi.middleware,
      dashboardApi.middleware,
      contactApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


