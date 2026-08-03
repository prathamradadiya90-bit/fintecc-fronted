"use client";

import React from 'react';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./store";
import { useGetMeQuery } from "./api/authApi";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Silent background fetch to keep user data fresh / sync changes
  useGetMeQuery();
  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthInitializer>{children}</AuthInitializer>
      </PersistGate>
    </Provider>
  );
}
