import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import { authApi } from './api/authApi';
import { clientsApi } from './api/clientsApi';
import { clientDocumentsApi } from './api/clientDocumentsApi';
import { bankStatementsApi } from './api/bankStatementsApi';
import { invoicesApi } from './api/invoicesApi';
import { dashboardApi } from './api/dashboardApi';
import { contactApi } from './api/contactApi';
import { superAdminApi } from './api/superAdminApi';
import { plansApi } from './api/plansApi';
import { gstApi } from './api/gstApi';
import { itrApi } from './api/itrApi';
import { chatApi } from './api/chatApi';
import { tasksApi } from './api/tasksApi';
import { ecommerceApi } from './api/ecommerceApi';
import { tallyApi } from './api/tallyApi';
import { notificationsApi } from './api/notificationsApi';
import { vaultApi } from './api/vaultApi';
import { settingsApi } from './api/settingsApi';
import { convertersApi } from './api/convertersApi';
import authReducer from './features/auth/authSlice';

const persistConfig = {
  key: 'fintecc_auth',
  storage,
  whitelist: ['auth'], // Only persist the auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [clientsApi.reducerPath]: clientsApi.reducer,
  [clientDocumentsApi.reducerPath]: clientDocumentsApi.reducer,
  [bankStatementsApi.reducerPath]: bankStatementsApi.reducer,
  [invoicesApi.reducerPath]: invoicesApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [superAdminApi.reducerPath]: superAdminApi.reducer,
  [plansApi.reducerPath]: plansApi.reducer,
  [gstApi.reducerPath]: gstApi.reducer,
  [itrApi.reducerPath]: itrApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [tasksApi.reducerPath]: tasksApi.reducer,
  [ecommerceApi.reducerPath]: ecommerceApi.reducer,
  [tallyApi.reducerPath]: tallyApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [vaultApi.reducerPath]: vaultApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [convertersApi.reducerPath]: convertersApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      clientsApi.middleware,
      clientDocumentsApi.middleware,
      bankStatementsApi.middleware,
      invoicesApi.middleware,
      dashboardApi.middleware,
      contactApi.middleware,
      superAdminApi.middleware,
      plansApi.middleware,
      gstApi.middleware,
      itrApi.middleware,
      chatApi.middleware,
      tasksApi.middleware,
      ecommerceApi.middleware,
      tallyApi.middleware,
      notificationsApi.middleware,
      vaultApi.middleware,
      settingsApi.middleware,
      convertersApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
