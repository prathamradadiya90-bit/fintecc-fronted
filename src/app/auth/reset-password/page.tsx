"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";

import { useResetPasswordMutation } from "../../../lib/store/api/authApi";
import Logo from "@/components/ui/Logo";

const SOFTWARE_INFO = {
  badge: "Cloud CA Practice Management",
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const paramEmail = searchParams.get("email");
    const paramOtp = searchParams.get("otp");

    if (paramEmail) setEmail(paramEmail);
    if (paramOtp) setOtp(paramOtp);
  }, [searchParams]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (!email || !otp || !newPassword) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      setLocalSuccess("Password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/auth?view=login");
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.data?.errors?.[0]?.message || "Failed to reset password. The link or OTP may be invalid or expired.";
      setLocalError(errorMsg);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FB] font-sans text-[#1E2A38]">
      {/* Left Branding Showcase (Desktop) */}
      <div className="hidden lg:flex w-[46%] bg-[#0C131F] border-r border-[#1E2B42] flex-col p-10 md:p-14 relative overflow-hidden shrink-0 sticky top-0 h-screen">
        <div className="absolute w-[450px] h-[450px] rounded-full bg-radial from-[#4A6FA5]/15 to-transparent top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-radial from-[#A8C5DA]/10 to-transparent bottom-10 right-10 pointer-events-none blur-3xl" />

        <Link
          href="/"
          className="inline-flex items-center gap-3 self-start group mb-auto p-1.5 -ml-1.5 rounded-xl hover:bg-white/5 transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#131C2E] border border-[#1E2B42] group-hover:border-[#4A6FA5]/50 transition-colors shadow-sm">
            <Logo width={26} height={26} className="rounded-md" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block group-hover:text-[#A8C5DA] transition-colors leading-tight">
              Fintecc
            </span>
            <span className="text-[11px] font-medium text-[#8E9FAA] flex items-center gap-1 group-hover:text-[#B0C4DE] transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Home
            </span>
          </div>
        </Link>

        <div className="pb-16 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#131C2E] border border-[#1E2B42] rounded-xl mb-7 shadow-xs">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#4A6FA5]/20">
              <Layers className="w-3.5 h-3.5 text-[#A8C5DA]" />
            </div>
            <span className="text-xs font-semibold text-[#A8C5DA]">{SOFTWARE_INFO.badge}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Built for <span className="text-[#A8C5DA]">Indian CAs.</span>
          </h2>
          <p className="text-sm text-[#B0C4DE] leading-relaxed mb-10 max-w-sm">
            Clients, GST, ITR, TDS, ROC compliance, and automated billing &mdash; one secure workspace with intelligent tools designed for modern CA firms.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: Lock, text: "AES-256 enterprise encryption - your data stays private" },
              { icon: ShieldCheck, text: "ICAI compliant, multi-user role management" },
              { icon: Zap, text: "Automated tax workflows & smart compliance tracking" },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A6FA5]/20 border border-[#4A6FA5]/30 shrink-0">
                    <Icon className="w-4 h-4 text-[#A8C5DA]" />
                  </div>
                  <span className="text-xs text-[#B0C4DE] font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-y-auto min-h-screen">
        {/* Subtle ambient light */}
        <div className="fixed -top-40 right-1/4 w-[400px] h-[400px] bg-[#4A6FA5]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-10 right-10 w-[350px] h-[350px] bg-[#A8C5DA]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[430px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(74,111,165,0.06)] relative z-10 my-8">
          {/* Mobile Brand Bar */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-[#E2E8F0]">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo width={30} height={30} className="rounded-lg" />
              <span className="text-lg font-bold tracking-tight text-[#1E2A38]">Fintecc</span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#5A6E85] hover:text-[#1E2A38] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          <div className="mb-6">
            <div className="w-11 h-11 bg-[#A8C5DA]/20 border border-[#A8C5DA]/40 rounded-xl flex items-center justify-center mb-4 text-[#4A6FA5] shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#1E2A38] mb-1.5 tracking-tight">
              Set New Password
            </h3>
            <p className="text-xs text-[#5A6E85]">
              Enter your registered email and choose a new password for your account.
            </p>
          </div>

          {localSuccess && (
            <div className="text-xs font-medium text-[#3D7A64] bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.25)] rounded-lg p-3 mb-6 leading-relaxed">
              {localSuccess}
            </div>
          )}

          {localError && (
            <div className="text-xs font-medium text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border border-[rgba(158,74,74,0.25)] rounded-lg p-3 mb-6 leading-relaxed">
              {localError}
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA] disabled:bg-[#F7F9FB] disabled:text-[#8E9FAA] disabled:cursor-not-allowed"
                required
                disabled={!!searchParams.get("email")}
              />
            </div>

            {!searchParams.get("otp") && (
              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Reset Code / OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter code"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all pr-10 placeholder:text-[#8E9FAA]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9FAA] hover:text-[#5A6E85] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all pr-10 placeholder:text-[#8E9FAA]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9FAA] hover:text-[#5A6E85] focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isResetLoading || !newPassword || !confirmPassword || (newPassword !== confirmPassword && confirmPassword.length > 0)}
              className={`w-full py-2.5 mt-2 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                isResetLoading || !newPassword || !confirmPassword
                  ? "bg-[#A8C5DA] cursor-not-allowed text-white/80"
                  : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
              }`}
            >
              {isResetLoading ? "Saving Password..." : "Update Password"}
              {!isResetLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/auth?view=login"
              className="text-xs font-semibold text-[#4A6FA5] hover:text-[#3D5D8A] transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
          <div className="w-8 h-8 border-3 border-[#E2E8F0] border-t-[#4A6FA5] rounded-full animate-spin"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
