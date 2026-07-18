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
  Landmark,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import { useResetPasswordMutation } from "../../../lib/store/api/authApi";

const PRODUCT_META = {
  name: "Bank Statement Converter",
  icon: Landmark,
  color: "text-blue-500",
  bg: "bg-blue-500/10",
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

  const MetaIcon = PRODUCT_META.icon;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="hidden lg:flex w-[46%] bg-gradient-to-br from-[#0A1628] via-[#0F2040] to-[#0D1F3C] flex-col p-10 md:p-14 relative overflow-hidden shrink-0 sticky top-0 h-screen">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-radial from-emerald-500/5 to-transparent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <Link href="/" className="inline-flex items-center gap-2.5 self-start bg-transparent border-none cursor-pointer p-0 mb-auto group">
          <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-lg group-hover:bg-white/15 transition-colors">
            <ArrowLeft className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">Back to Home</span>
        </Link>

        <div className="pb-16 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl mb-7">
            <div className={`flex items-center justify-center w-6 h-6 rounded-md ${PRODUCT_META.bg}`}>
              <MetaIcon className={`w-4 h-4 ${PRODUCT_META.color}`} />
            </div>
            <span className="text-xs font-semibold text-white/90">{PRODUCT_META.name}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Built for <span className="text-emerald-400">Indian CAs.</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-xs">
            Clients, GST, ITR, TDS, ROC compliance and documents - one secure workspace, with tools that understand Indian tax law.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: Lock, text: "AES-256 encrypted - your data stays private" },
              { icon: ShieldCheck, text: "ICAI compliant platform" },
              { icon: Zap, text: "Process statements in seconds, not hours" },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-emerald-500/10 shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-5">
              <KeyRound className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">
              Set New Password
            </h3>
            <p className="text-xs text-slate-500">
              Please enter your new password below.
            </p>
          </div>

          {localSuccess && (
            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
              {localSuccess}
            </div>
          )}

          {localError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              {localError}
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            {!searchParams.get("email") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                  required
                />
              </div>
            )}

            {!searchParams.get("otp") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reset Code / OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter code"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isResetLoading || !newPassword || !confirmPassword || (newPassword !== confirmPassword && confirmPassword.length > 0)}
              className={`w-full py-2.5 mt-2 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isResetLoading || !newPassword || !confirmPassword ? "bg-slate-400 cursor-not-allowed" : "bg-[#0A1628] hover:bg-slate-800"
              }`}
            >
              {isResetLoading ? "Saving Password..." : "Update Password"}
              {!isResetLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth?view=login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to login
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
