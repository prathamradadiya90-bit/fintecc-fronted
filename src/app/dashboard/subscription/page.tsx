"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  useGetPublicPlansQuery,
  useGetMySubscriptionQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} from "@/lib/store/api/plansApi";
import type { Plan, SubscriptionStatus } from "@/lib/types/plan.types";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { useRazorpayCheckout } from "@/lib/hooks/useRazorpayCheckout";
import type { RootState } from "@/lib/store/store";
import { formatPlanBillingPeriod, cleanPlanFeature } from "@/lib/utils/subscriptionUtils";

/** Renders a status pill for the current subscription status */
function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const map: Record<SubscriptionStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    pending: {
      label: "Pending Payment",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    halted: {
      label: "Payment Failed",
      className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    expired: {
      label: "Expired",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    failed: {
      label: "Failed",
      className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
  };

  const { label, className } = map[status] ?? map.expired;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export default function SubscriptionPage() {
  const { data, isLoading, isError, refetch } = useGetPublicPlansQuery();
  const { data: mySubData, isLoading: isSubLoading } = useGetMySubscriptionQuery();
  const { showToast } = useToast();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const { initiateCheckout } = useRazorpayCheckout();

  const { user } = useSelector((state: RootState) => state.auth);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const hasActivePlan = Boolean(mySubData?.data?.hasActivePlan);
  const subscription = mySubData?.data?.subscription;
  const activePlan = mySubData?.data?.activePlan || subscription?.plan;
  const hasUsedFreePlan = Boolean(mySubData?.data?.hasUsedFreePlan);
  const subStatus = subscription?.status;

  const daysRemaining = subscription?.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const handleSubscribe = async (plan: Plan) => {
    // Only block same-plan re-purchase
    const isCurrentPlan =
      hasActivePlan &&
      (subscription?.planId === plan.id || activePlan?.id === plan.id);

    if (isCurrentPlan) {
      showToast("You are already on this plan.", "info");
      return;
    }

    if (Number(plan.price) === 0 && hasUsedFreePlan) {
      showToast(
        "You have already used the free plan. Please choose a paid plan.",
        "error"
      );
      return;
    }

    try {
      setProcessingPlanId(plan.id);

      // Step 1: Create order (or subscription) on backend
      const orderResponse = await createOrder({ planId: plan.id }).unwrap();

      // If backend returned an active subscription directly (free plan), we're done
      const responseData = orderResponse.data as any;
      if (!responseData.razorpaySubscriptionId && responseData.status === "active") {
        showToast(
          `Successfully subscribed to ${plan.name}! All dashboard features are now unlocked.`,
          "success"
        );
        return;
      }

      // Step 2: Open Razorpay subscription checkout
      const razorpayResponse = await initiateCheckout({
        subscriptionId: responseData.razorpaySubscriptionId,
        key: responseData.key || responseData.key_id || responseData.razorpayKeyId,
        name: "Fintecc",
        description: `Subscription: ${plan.name}`,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
      });

      // Step 3: Verify payment with backend using subscriptionId
      await verifyPayment({
        razorpaySubscriptionId: razorpayResponse.razorpay_subscription_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      }).unwrap();

      const actionLabel = hasActivePlan ? "switched to" : "subscribed to";
      showToast(
        `Successfully ${actionLabel} ${plan.name}! All dashboard features are now unlocked.`,
        "success"
      );
    } catch (error: any) {
      console.error("Subscription flow error:", error);
      showToast(
        error.message || "Failed to complete subscription. Please try again.",
        "error"
      );
    } finally {
      setProcessingPlanId(null);
    }
  };

  const plans = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#00C2B3]/10 to-transparent p-6 rounded-2xl border border-[#00C2B3]/20">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Subscription &amp; Plans
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Choose the perfect plan to scale your CA firm and unlock all compliance &amp; workflow features.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            Secure Payments
          </span>
        </div>
      </div>

      {/* ── Status Banners ── */}

      {/* No active plan → prompt to subscribe */}
      {!subscription && !isSubLoading && (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 animate-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl p-2 bg-amber-100 dark:bg-amber-900/40 shrink-0 text-amber-600 dark:text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Account Inactive – Feature Access Locked
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              You do not have an active subscription. All dashboard features (GST, ITR, Invoices, Tasks, Clients, Vault, etc.) are locked until you choose and activate a plan below.
            </p>
          </div>
        </div>
      )}

      {/* Halted → payment failed, access revoked */}
      {subStatus === "halted" && (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 animate-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl p-2 bg-rose-100 dark:bg-rose-900/40 shrink-0 text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Subscription Halted – Access Revoked
            </h3>
            <p className="text-sm text-rose-700 dark:text-rose-400 mt-0.5 leading-relaxed">
              All payment retry attempts have failed. Your account access has been revoked. Please choose a new plan below to restore access.
            </p>
          </div>
        </div>
      )}

      {/* Cancelled → access until expiry */}
      {subStatus === "cancelled" && (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 animate-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl p-2 bg-amber-100 dark:bg-amber-900/40 shrink-0 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Subscription Cancelled
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              Your subscription is cancelled. You retain access until{" "}
              <span className="font-semibold">
                {subscription?.endDate
                  ? new Date(subscription.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "the end of your billing period"}
              </span>
              . Renew below to continue uninterrupted access.
            </p>
          </div>
        </div>
      )}

      {/* Active subscription → success banner */}
      {hasActivePlan && subStatus === "active" && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {activePlan?.name || "Active Subscription"}
                  </span>
                  <SubscriptionStatusBadge status="active" />
                </div>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                  All platform features unlocked. Switch plans anytime — unused balance is prorated.
                </p>
              </div>
            </div>

            {subscription?.endDate && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-500/20">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <div className="text-left">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Renews / Expires</div>
                  <div className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {new Date(subscription.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                      ({daysRemaining} days left)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Plans Grid ── */}
      {isLoading || isSubLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl h-[450px] animate-pulse bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30 text-center">
          <Zap className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-base font-semibold text-red-600 dark:text-red-400">Failed to load plans</h3>
          <p className="text-sm text-red-500 dark:text-red-300 mt-2 mb-6">
            There was a problem fetching the subscription plans.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active plans available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentActivePlan =
              hasActivePlan &&
              (subscription?.planId === plan.id || activePlan?.id === plan.id);
            const isFree = Number(plan.price) === 0;
            const isFreeUsed = isFree && hasUsedFreePlan;
            const isProcessing = processingPlanId === plan.id;
            const anyProcessing = processingPlanId !== null;

            // Determine button label and disabled state
            let buttonLabel: string;
            let isButtonDisabled: boolean;

            if (isCurrentActivePlan) {
              buttonLabel = "Current Plan";
              isButtonDisabled = true;
            } else if (isFreeUsed && isFree) {
              buttonLabel = "Free Trial Used";
              isButtonDisabled = true;
            } else if (hasActivePlan) {
              // Allow plan switching — backend handles proration
              buttonLabel = (Number(plan.price) > Number(activePlan?.price ?? 0))
                ? "Upgrade Plan"
                : "Switch Plan";
              isButtonDisabled = anyProcessing;
            } else {
              buttonLabel = isFree ? "Start Free" : "Subscribe Now";
              isButtonDisabled = anyProcessing;
            }

            return (
              <div
                key={plan.id}
                className={`flex flex-col p-6 rounded-3xl transition-all duration-300 hover:shadow-xl group bg-white dark:bg-[#111827] border relative overflow-hidden ${
                  isCurrentActivePlan
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-[#00C2B3]/30 dark:hover:border-[#00C2B3]/30"
                }`}
              >
                {/* Current plan badge */}
                {isCurrentActivePlan && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Current Plan
                  </div>
                )}

                {/* Upgrade badge */}
                {!isCurrentActivePlan && hasActivePlan && Number(plan.price) > Number(activePlan?.price ?? 0) && (
                  <div className="absolute top-0 right-0 bg-[#00C2B3] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> Upgrade
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm min-h-[40px] mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-end gap-1 mb-8">
                  <span className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>
                    ₹{Number(plan.price).toLocaleString()}
                  </span>
                  <span className="text-sm mb-0.5 font-medium" style={{ color: "var(--color-text-muted)" }}>
                    {formatPlanBillingPeriod(plan)}
                  </span>
                </div>

                <div className="flex flex-col gap-3.5 mb-8 flex-1">
                  {plan.features?.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-0.5 bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <span className="text-sm leading-snug" style={{ color: "var(--color-text-on-card)" }}>
                        {cleanPlanFeature(feature)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-2">
                  <Button
                    variant={
                      isCurrentActivePlan
                        ? "secondary"
                        : !hasActivePlan && plan.price > 0
                        ? "primary"
                        : hasActivePlan && !isCurrentActivePlan
                        ? "primary"
                        : "secondary"
                    }
                    className={`w-full font-semibold py-2.5 rounded-xl transition-all ${
                      isButtonDisabled ? "opacity-80 cursor-not-allowed" : "group-hover:shadow-md"
                    }`}
                    onClick={() => handleSubscribe(plan)}
                    isLoading={isProcessing}
                    disabled={isButtonDisabled}
                  >
                    {buttonLabel}
                  </Button>

                  {/* Proration hint when switching plans */}
                  {hasActivePlan && !isCurrentActivePlan && !isFreeUsed && (
                    <p className="text-[11px] text-center text-slate-400">
                      Unused balance applied as credit
                    </p>
                  )}

                  {!hasActivePlan && isFreeUsed && (
                    <p className="text-[11px] text-center text-amber-500">
                      Free plan can only be claimed once
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
