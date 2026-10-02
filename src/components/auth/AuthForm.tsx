"use client";

import React, { useState } from "react";
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

import {
  useRegisterMutation,
  useLoginMutation,
  useVerifyRegistrationMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
} from "../../lib/store/api/authApi";
import { plansApi } from "../../lib/store/api/plansApi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../lib/store/store";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Logo from "../ui/Logo";

const SOFTWARE_INFO = {
  badge: "Cloud CA Practice Management",
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

export default function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const navigateBasedOnSubscription = async () => {
    try {
      const res = await dispatch(plansApi.endpoints.getMySubscription.initiate(undefined, { forceRefetch: true })).unwrap();
      if (res?.data?.hasActivePlan) {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/subscription");
      }
    } catch {
      router.push("/dashboard");
    }
  };

  const [view, setView] = useState<"login" | "signup" | "otp" | "forgot-password" | "reset-password">("login");
  const [authEmail, setAuthEmail] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setShowPassword(false);
  }, [view]);

  React.useEffect(() => {
    const paramView = searchParams.get("view");
    const paramEmail = searchParams.get("email");
    if (paramView === "reset-password") {
      setView("reset-password");
      if (paramEmail) {
        setAuthEmail(paramEmail);
      }
    }
  }, [searchParams]);

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
  const [googleLogin, { isLoading: isGoogleLoginLoading }] = useGoogleLoginMutation();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLocalError("");
      try {
        await googleLogin({ token: credentialResponse.credential }).unwrap();
        await navigateBasedOnSubscription();
      } catch (err: unknown) {
        setLocalError(getErrorMessage(err, "An error occurred during Google sign in."));
      }
    }
  };

  const handleGoogleError = () => {
    setLocalError("Google Sign-In failed.");
  };

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
      await navigateBasedOnSubscription();
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
      await navigateBasedOnSubscription();
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
      <div className="flex-1 flex justify-center items-center p-4 sm:p-8 md:p-12 overflow-y-auto min-h-screen relative">
        {/* Subtle ambient light */}
        <div className="fixed -top-40 right-1/4 w-[400px] h-[400px] bg-[#4A6FA5]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-10 right-10 w-[350px] h-[350px] bg-[#A8C5DA]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[440px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(74,111,165,0.06)] relative z-10 my-8 transition-all">
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

          {(view === "login" || view === "signup") && (
            <div className="p-1 bg-[#F0F4F8] rounded-xl flex gap-1 mb-6 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => { setView("login"); setLocalError(""); setLocalSuccess(""); }}
                className={`flex-1 py-2 text-center text-xs transition-all rounded-lg cursor-pointer border-none outline-none ${
                  view === "login"
                    ? "font-bold text-[#1E2A38] bg-white shadow-xs border border-[#E2E8F0]/80"
                    : "font-semibold text-[#5A6E85] hover:text-[#1E2A38] bg-transparent"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setView("signup"); setLocalError(""); setLocalSuccess(""); }}
                className={`flex-1 py-2 text-center text-xs transition-all rounded-lg cursor-pointer border-none outline-none ${
                  view === "signup"
                    ? "font-bold text-[#1E2A38] bg-white shadow-xs border border-[#E2E8F0]/80"
                    : "font-semibold text-[#5A6E85] hover:text-[#1E2A38] bg-transparent"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {(view === "otp" || view === "forgot-password" || view === "reset-password") && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => { setView("login"); setLocalError(""); setLocalSuccess(""); }}
                className="flex items-center text-xs font-semibold text-[#5A6E85] hover:text-[#1E2A38] transition-colors border-none bg-transparent cursor-pointer p-0 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to login
              </button>
              <div className="w-11 h-11 bg-[#A8C5DA]/20 border border-[#A8C5DA]/40 rounded-xl flex items-center justify-center mb-4 text-[#4A6FA5] shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold text-[#1E2A38] mb-1.5 tracking-tight">
            {view === "login" && "Welcome back"}
            {view === "signup" && "Create an account"}
            {view === "otp" && "Check your email"}
            {view === "forgot-password" && "Reset Password"}
            {view === "reset-password" && "Create New Password"}
          </h3>
          <p className="text-xs text-[#5A6E85] mb-6 leading-relaxed">
            {view === "login" && "Sign in to access your Fintecc practice management workspace."}
            {view === "signup" && "Create your account to start managing clients, compliance, and firm workflows."}
            {view === "otp" && <>We&apos;ve sent a 6-digit account verification code to <strong className="text-[#1E2A38] font-semibold">{authEmail}</strong></>}
            {view === "forgot-password" && "Enter your registered email address to receive password reset instructions."}
            {view === "reset-password" && "Enter the 6-digit code sent to your email and set a new password."}
          </p>

          {localSuccess && (
            <div className="text-xs font-medium text-[#3D7A64] bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.25)] rounded-lg p-3 mb-4 leading-relaxed">
              {localSuccess}
            </div>
          )}

          {view === "otp" && (
            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-base text-[#1E2A38] text-center tracking-[0.5em] font-mono bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                  required
                />
              </div>

              {localError && (
                <div className="text-xs font-medium text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border border-[rgba(158,74,74,0.25)] rounded-lg p-3 leading-relaxed">
                  {localError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyLoading || otp.length !== 6}
                className={`w-full py-2.5 mt-1.5 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  (isVerifyLoading || otp.length !== 6)
                    ? "bg-[#A8C5DA] cursor-not-allowed text-white/80"
                    : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isVerifyLoading ? "Verifying..." : "Verify & Continue"}
                {!isVerifyLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendLoading || resendTimer > 0}
                  className={`text-xs font-semibold bg-transparent border-none p-0 transition-colors ${
                    isResendLoading || resendTimer > 0
                      ? "text-[#8E9FAA] cursor-not-allowed"
                      : "text-[#4A6FA5] hover:text-[#3D5D8A] cursor-pointer"
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
                <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="ca@yourfirm.com"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                  required
                />
              </div>

              {localError && (
                <div className="text-xs font-medium text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border border-[rgba(158,74,74,0.25)] rounded-lg p-3 leading-relaxed">
                  {localError}
                </div>
              )}

              <button
                type="submit"
                disabled={isForgotLoading}
                className={`w-full py-2.5 mt-1.5 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isForgotLoading
                    ? "bg-[#A8C5DA] cursor-wait text-white/80"
                    : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
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
                <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Reset Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-base text-[#1E2A38] text-center tracking-[0.5em] font-mono bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                  required
                />
              </div>

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

              {localError && (
                <div className="text-xs font-medium text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border border-[rgba(158,74,74,0.25)] rounded-lg p-3 leading-relaxed">
                  {localError}
                </div>
              )}

              <button
                type="submit"
                disabled={isResetLoading || otp.length !== 6 || !newPassword}
                className={`w-full py-2.5 mt-1.5 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  (isResetLoading || otp.length !== 6 || !newPassword)
                    ? "bg-[#A8C5DA] cursor-not-allowed text-white/80"
                    : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
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
                <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ca@yourfirm.com"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#1E2A38]">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot-password"); setAuthEmail(loginEmail); setLocalError(""); setLocalSuccess(""); }}
                    className="text-xs font-semibold text-[#4A6FA5] hover:text-[#3D5D8A] bg-transparent border-none cursor-pointer p-0 transition-colors"
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
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all pr-10 placeholder:text-[#8E9FAA]"
                    required
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

              {localError && (
                <div className="text-xs font-medium text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border border-[rgba(158,74,74,0.25)] rounded-lg p-3 leading-relaxed">
                  {localError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoginLoading}
                className={`w-full py-2.5 mt-2 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isLoginLoading
                    ? "bg-[#A8C5DA] cursor-wait text-white/80"
                    : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isLoginLoading ? "Signing in..." : "Sign in"}
                {!isLoginLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Firm Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Your CA Firm"
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">User Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] mb-1.5">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="ca@yourfirm.com"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all placeholder:text-[#8E9FAA]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1E2A38] mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all pr-10 placeholder:text-[#8E9FAA]"
                    required
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
                <label className="text-xs font-semibold text-[#1E2A38] mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/15 rounded-lg text-sm text-[#1E2A38] bg-white outline-none transition-all pr-10 placeholder:text-[#8E9FAA]"
                    required
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

              {localError && (
                <div className="text-xs font-medium text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border border-[rgba(158,74,74,0.25)] rounded-lg p-3 leading-relaxed">
                  {localError}
                </div>
              )}

              <button
                type="submit"
                disabled={isRegisterLoading}
                className={`w-full py-2.5 mt-2 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isRegisterLoading
                    ? "bg-[#A8C5DA] cursor-wait text-white/80"
                    : "bg-[#4A6FA5] hover:bg-[#3D5D8A] active:scale-[0.99] cursor-pointer"
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
                <div className="flex-1 h-[1px] bg-[#E2E8F0]" />
                <span className="text-[10px] font-bold text-[#8E9FAA] uppercase tracking-wider">OR</span>
                <div className="flex-1 h-[1px] bg-[#E2E8F0]" />
              </div>

              <div className="w-full flex justify-center mt-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>

              <p className="text-xs text-[#5A6E85] text-center mt-6">
                {view === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setView("signup"); setLocalError(""); setLocalSuccess(""); }}
                      className="text-xs font-semibold text-[#4A6FA5] hover:text-[#3D5D8A] bg-transparent border-none cursor-pointer p-0 transition-colors"
                    >
                      Register to get started
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setView("login"); setLocalError(""); setLocalSuccess(""); }}
                      className="text-xs font-semibold text-[#4A6FA5] hover:text-[#3D5D8A] bg-transparent border-none cursor-pointer p-0 transition-colors"
                    >
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
