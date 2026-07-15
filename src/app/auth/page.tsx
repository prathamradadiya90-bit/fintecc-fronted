"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Landmark,
  ReceiptText,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useRegisterMutation,
  useLoginMutation,
  useVerifyRegistrationMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../lib/store/api/authApi";

const PRODUCT_META = {
  bank: { name: "Bank Statement Converter", icon: Landmark, color: "text-blue-500", bg: "bg-blue-500/10" },
  tax: { name: "Tax Invoice Converter", icon: ReceiptText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{ message: string }>;
};

type MutationError = {
  data?: ApiErrorPayload;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const payload = (error as MutationError)?.data;

  if (payload?.errors?.length) {
    return payload.errors.map(({ message }) => message).join(", ");
  }

  return payload?.message || fallback;
};

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState<"login" | "signup" | "otp" | "forgot-password" | "reset-password">("login");
  const [authEmail, setAuthEmail] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setShowPassword(false);
  }, [view]);

  const [firmName, setFirmName] = useState("");
  const [userName, setUserName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyRegistration, { isLoading: isVerifyLoading }] = useVerifyRegistrationMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const handleResendOtp = async () => {
    setLocalError("");
    setLocalSuccess("");
    try {
      await resendOtp({ email: authEmail }).unwrap();
      setLocalSuccess("A new verification code has been sent to your email.");
      setResendTimer(60);
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, "Failed to resend OTP."));
    }
  };

  const product = (searchParams.get("product") as keyof typeof PRODUCT_META) || "bank";
  const meta = PRODUCT_META[product] || PRODUCT_META.bank;
  const MetaIcon = meta.icon;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (!loginEmail || !loginPassword) {
      setLocalError("Please enter email and password.");
      return;
    }

    try {
      await login({ email: loginEmail, password: loginPassword }).unwrap();
      router.push("/dashboard");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, "An error occurred during login."));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (!firmName || !userName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await register({
        firmName,
        userName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      }).unwrap();

      setAuthEmail(signupEmail);
      setOtp("");
      setView("otp");
      setLocalSuccess("Registration successful. Enter the verification code sent to your email.");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, "An error occurred during registration."));
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (otp.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      await verifyRegistration({ email: authEmail, otp }).unwrap();
      router.push("/dashboard");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, "Invalid or expired OTP."));
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (!authEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    try {
      await forgotPassword({ email: authEmail }).unwrap();
      setOtp("");
      setNewPassword("");
      setView("reset-password");
      setLocalSuccess("A password reset code has been sent to your email.");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, "Failed to request password reset."));
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");

    if (otp.length !== 6 || !newPassword) {
      setLocalError("Please enter a valid 6-digit OTP and new password.");
      return;
    }

    try {
      await resetPassword({ email: authEmail, otp, newPassword }).unwrap();
      setView("login");
      setLocalSuccess("Password has been reset successfully. Please log in.");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err, "Failed to reset password. The OTP may be invalid."));
    }
  };

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
            <div className={`flex items-center justify-center w-6 h-6 rounded-md ${meta.bg}`}>
              <MetaIcon className={`w-4 h-4 ${meta.color}`} />
            </div>
            <span className="text-xs font-semibold text-white/90">{meta.name}</span>
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
        <div className="w-full max-w-[360px]">
          {(view === "login" || view === "signup") && (
            <div className="flex border border-slate-200 rounded-xl overflow-hidden mb-8 bg-white shadow-sm">
              <button
                onClick={() => { setView("login"); setLocalError(""); setLocalSuccess(""); }}
                className={`flex-1 py-2.5 text-center text-[13px] transition-colors cursor-pointer border-none outline-none ${
                  view === "login"
                    ? "font-bold text-slate-900 bg-white"
                    : "font-semibold text-slate-400 bg-slate-50 hover:bg-slate-100/50 border-b border-slate-200"
                }`}
              >
                Sign in
              </button>
              <div className="w-[1px] bg-slate-200" />
              <button
                onClick={() => { setView("signup"); setLocalError(""); setLocalSuccess(""); }}
                className={`flex-1 py-2.5 text-center text-[13px] transition-colors cursor-pointer border-none outline-none ${
                  view === "signup"
                    ? "font-bold text-slate-900 bg-white"
                    : "font-semibold text-slate-400 bg-slate-50 hover:bg-slate-100/50 border-b border-slate-200"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {(view === "otp" || view === "forgot-password" || view === "reset-password") && (
            <div className="mb-8">
              <button
                onClick={() => { setView("login"); setLocalError(""); setLocalSuccess(""); }}
                className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer p-0 mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to login
              </button>
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-5">
                <KeyRound className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          )}

          <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">
            {view === "login" && "Welcome back"}
            {view === "signup" && "Create an account"}
            {view === "otp" && "Check your email"}
            {view === "forgot-password" && "Reset Password"}
            {view === "reset-password" && "Create New Password"}
          </h3>
          <p className="text-xs text-slate-500 mb-7">
            {view === "login" && <>Sign in to access <strong>{meta.name}</strong></>}
            {view === "signup" && <>Sign up to access <strong>{meta.name}</strong></>}
            {view === "otp" && <>We&apos;ve sent a 6-digit account verification code to <strong>{authEmail}</strong></>}
            {view === "forgot-password" && <>Enter your email address to receive a reset code.</>}
            {view === "reset-password" && <>Enter the 6-digit code sent to your email and a new password.</>}
          </p>

          {localSuccess && (
            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">{localSuccess}</div>
          )}

          {view === "otp" && (
            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-base text-slate-900 text-center tracking-[0.5em] font-mono bg-white outline-none transition-colors"
                  required
                />
              </div>

              {localError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{localError}</div>
              )}

              <button
                type="submit"
                disabled={isVerifyLoading || otp.length !== 6}
                className={`w-full py-2.5 mt-1.5 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  (isVerifyLoading || otp.length !== 6) ? "bg-slate-400 cursor-not-allowed" : "bg-[#0A1628] hover:bg-slate-800"
                }`}
              >
                {isVerifyLoading ? "Verifying..." : "Verify & Continue"}
                {!isVerifyLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendLoading || resendTimer > 0}
                  className={`text-xs font-semibold bg-transparent border-none p-0 transition-colors ${
                    isResendLoading || resendTimer > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600 cursor-pointer"
                  }`}
                >
                  {isResendLoading ? "Resending..." : resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code? Resend"}
                </button>
              </div>
            </form>
          )}

          {view === "forgot-password" && (
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="ca@yourfirm.com"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                  required
                />
              </div>

              {localError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{localError}</div>
              )}

              <button
                type="submit"
                disabled={isForgotLoading}
                className={`w-full py-2.5 mt-1.5 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isForgotLoading ? "bg-slate-400 cursor-wait" : "bg-[#0A1628] hover:bg-slate-800"
                }`}
              >
                {isForgotLoading ? "Sending Code..." : "Send Reset Code"}
                {!isForgotLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {view === "reset-password" && (
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reset Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-base text-slate-900 text-center tracking-[0.5em] font-mono bg-white outline-none transition-colors"
                  required
                />
              </div>

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

              {localError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{localError}</div>
              )}

              <button
                type="submit"
                disabled={isResetLoading || otp.length !== 6 || !newPassword}
                className={`w-full py-2.5 mt-1.5 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  (isResetLoading || otp.length !== 6 || !newPassword) ? "bg-slate-400 cursor-not-allowed" : "bg-[#0A1628] hover:bg-slate-800"
                }`}
              >
                {isResetLoading ? "Resetting..." : "Reset Password"}
                {!isResetLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ca@yourfirm.com"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot-password"); setAuthEmail(loginEmail); setLocalError(""); setLocalSuccess(""); }}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors pr-10"
                    required
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

              {localError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{localError}</div>
              )}

              <button
                type="submit"
                disabled={isLoginLoading}
                className={`w-full py-2.5 mt-1.5 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isLoginLoading ? "bg-slate-400 cursor-wait" : "bg-[#0A1628] hover:bg-slate-800"
                }`}
              >
                {isLoginLoading ? "Signing in..." : "Sign in"}
                {!isLoginLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Firm Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Your CA Firm"
                    className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">User Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="ca@yourfirm.com"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors pr-10"
                    required
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
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition-colors pr-10"
                    required
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

              {localError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{localError}</div>
              )}

              <button
                type="submit"
                disabled={isRegisterLoading}
                className={`w-full py-2.5 mt-1.5 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isRegisterLoading ? "bg-slate-400 cursor-wait" : "bg-[#0A1628] hover:bg-slate-800"
                }`}
              >
                {isRegisterLoading ? "Creating account..." : "Create account"}
                {!isRegisterLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {(view === "login" || view === "signup") && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-[1px] bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OR</span>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>

              <button className="w-full py-2 border border-slate-200 hover:border-slate-300 rounded-lg bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5 cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.7 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.4-4z"/>
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.4 19 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3c-7.6 0-14.3 4.1-17.7 10.7z"/>
                  <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.7 40.8 16.4 45 24 45z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6.1l6.2 5.2C40.5 36.2 44 30.6 44 24c0-1.3-.2-2.7-.4-4z"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-xs text-slate-500 text-center mt-6">
                {view === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => { setView("signup"); setLocalError(""); setLocalSuccess(""); }} className="text-xs font-semibold text-blue-500 hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">
                      Register to get started
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => { setView("login"); setLocalError(""); setLocalSuccess(""); }} className="text-xs font-semibold text-blue-500 hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">
                      Sign in instead
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
