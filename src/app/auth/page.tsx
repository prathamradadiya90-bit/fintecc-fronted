"use client";

import React, { Suspense } from "react";
import AuthForm from "../../components/auth/AuthForm";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
          <div className="w-8 h-8 border-3 border-[#E2E8F0] border-t-[#4A6FA5] rounded-full animate-spin"></div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
