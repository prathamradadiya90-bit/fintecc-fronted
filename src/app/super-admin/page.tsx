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
    <div className="min-h-screen bg-[#060E1E] flex items-center justify-center px-4">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,194,179,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00C2B3]/10 border border-[#00C2B3]/20 mb-5">
            <Shield className="w-8 h-8 text-[#00C2B3]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Restricted access — authorised personnel only.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0D1B2E]/80 backdrop-blur-xl border border-[#1a2d44] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="sa-email" className="block text-[13px] font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="sa-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#091124] border border-[#1e3a5f] rounded-xl text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]/50 focus:border-[#00C2B3]/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="sa-password"
                className="block text-[13px] font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="sa-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-[#091124] border border-[#1e3a5f] rounded-xl text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]/50 focus:border-[#00C2B3]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="sa-login-submit"
              className="w-full py-3 bg-[#00C2B3] hover:bg-[#00a89b] active:bg-[#009084] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-[13px] transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-slate-600 mt-6">
          This portal is monitored. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  );
}
