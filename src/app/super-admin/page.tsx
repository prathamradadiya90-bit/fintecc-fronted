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
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-6 font-sans text-[#1E2A38] relative overflow-hidden">
      {/* Subtle ambient blur */}
      <div className="fixed -top-40 right-1/4 w-[400px] h-[400px] bg-[#4A6FA5]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[350px] h-[350px] bg-[#A8C5DA]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(74,111,165,0.06)] relative z-10">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#A8C5DA]/20 border border-[#A8C5DA]/40 mb-3 text-[#4A6FA5] shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1E2A38] mb-1.5 tracking-tight">Super Admin</h1>
          <p className="text-xs text-[#5A6E85]">
            Sign in to access the control panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="sa-email" className="block text-xs font-semibold text-[#1E2A38] mb-1.5">
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
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
            />
          </div>

          <div>
            <label htmlFor="sa-password" className="block text-xs font-semibold text-[#1E2A38] mb-1.5">
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
                className="w-full pl-3.5 pr-10 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9FAA] hover:text-[#5A6E85] transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="sa-login-submit"
            className={`w-full py-2.5 mt-2 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isLoading
                ? "bg-[#A8C5DA] cursor-wait text-white/80"
                : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-[#8E9FAA] mt-6">
          Restricted access. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  );
}
