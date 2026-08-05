"use client";

import React, { Suspense } from "react";
import AuthForm from "../../components/auth/AuthForm";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
