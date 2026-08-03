"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useSuperAdminLoginMutation } from "@/lib/store/api/superAdminApi";
import { useToast } from "@/components/ui/Toast";
import type { RootState } from "@/lib/store/store";

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{ message: string }>;
};
type MutationError = { data?: ApiErrorPayload };

function getErrorMessage(error: unknown, fallback: string): string {
  const payload = (error as MutationError)?.data;
  if (payload?.errors?.length) {
    return payload.errors.map(({ message }) => message).join(", ");
  }
  return payload?.message || fallback;
}

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [superAdminLogin, { isLoading }] = useSuperAdminLoginMutation();

  // Redirect if already authenticated as super admin
  useEffect(() => {
    if (isAuthenticated && user?.role === "SUPER_ADMIN") {
      router.replace("/super-admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    try {
      const result = await superAdminLogin({ email, password }).unwrap();
      if (result.data?.user?.role !== "SUPER_ADMIN") {
        showToast("Access denied. This portal is for Super Admins only.", "error");
        return;
      }
      router.replace("/super-admin/dashboard");
    } catch (error) {
      showToast(getErrorMessage(error, "Login failed. Please check your credentials."), "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[360px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0A1628] mb-4 shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-1.5">Super Admin</h1>
          <p className="text-xs text-slate-500">
            Sign in to access the control panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="sa-email" className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              id="sa-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-slate-200 focus:border-[#0A1628] rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="sa-password" className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="sa-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-3 pr-10 py-2 border border-slate-200 focus:border-[#0A1628] rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="sa-login-submit"
            className={`w-full py-2.5 mt-2 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isLoading ? "bg-slate-400 cursor-wait" : "bg-[#0A1628] hover:bg-slate-800"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Restricted access. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  );
}
