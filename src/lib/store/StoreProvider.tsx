"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useGetMeQuery } from "./api/authApi";
import React from 'react';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useGetMeQuery();
  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}

