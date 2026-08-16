"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Check, ShieldCheck, Zap } from "lucide-react";
import { 
  useGetPublicPlansQuery, 
  useCreateOrderMutation, 
  useVerifyPaymentMutation 
} from "@/lib/store/api/plansApi";
import type { Plan } from "@/lib/types/plan.types";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { useRazorpayCheckout } from "@/lib/hooks/useRazorpayCheckout";
import type { RootState } from "@/lib/store/store";

export default function SubscriptionPage() {
  const { data, isLoading, isError, refetch } = useGetPublicPlansQuery();
  const { showToast } = useToast();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const { initiateCheckout } = useRazorpayCheckout();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setProcessingPlanId(plan.id);

      // 1. Create order
      const orderResponse = await createOrder({ planId: plan.id }).unwrap();
      
      // If plan is free, the backend will activate it directly and return a subscription object (without orderId)
      // but our type assumes CreateOrderResponse. Let's check if orderId exists.
      if (!orderResponse.data.orderId && (orderResponse.data as any).status === 'active') {
          showToast(`Successfully subscribed to ${plan.name}`, "success");
          setProcessingPlanId(null);
          return;
      }

      // 2. Open Razorpay modal
      const razorpayResponse = await initiateCheckout({
        orderId: orderResponse.data.orderId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Fintecc',
        description: `Subscription: ${plan.name}`,
        prefill: {
          name: user?.name,
          email: user?.email,
        }
      });

      // 3. Verify payment
      await verifyPayment({
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      }).unwrap();

      showToast(`Successfully subscribed to ${plan.name}!`, "success");
      
    } catch (error: any) {
      console.error("Subscription flow error:", error);
      showToast(error.message || "Failed to complete subscription. Please try again.", "error");
    } finally {
      setProcessingPlanId(null);
    }
  };

  const plans = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#00C2B3]/10 to-transparent p-6 rounded-2xl border border-[#00C2B3]/20">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Upgrade Your Plan
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Choose the perfect plan to scale your CA firm and automate compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            Secure Payments
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl h-[450px] animate-pulse bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30 text-center">
          <Zap className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Failed to load plans</h3>
          <p className="text-sm text-red-500 dark:text-red-300 mt-2 mb-6">There was a problem fetching the subscription plans.</p>
          <Button onClick={() => refetch()} variant="outline">Try Again</Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No active plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-[#00C2B3]/30 dark:hover:border-[#00C2B3]/30 relative overflow-hidden"
            >
              {/* Optional popular badge logic could go here */}
              
              <div className="mb-6">
                <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{plan.name}</h3>
                <p className="text-sm min-h-[40px] mt-1" style={{ color: "var(--color-text-secondary)" }}>{plan.description}</p>
              </div>

              <div className="flex items-end gap-1 mb-8">
                <span className="text-3xl font-black" style={{ color: "var(--color-text-primary)" }}>₹{Number(plan.price).toLocaleString()}</span>
                <span className="text-sm mb-1 font-medium" style={{ color: "var(--color-text-muted)" }}>
                  /{plan.durationMonths === 1 ? 'mo' : plan.durationMonths === 12 ? 'yr' : `${plan.durationMonths}mo`}
                </span>
              </div>

              <div className="flex flex-col gap-3.5 mb-8 flex-1">
                {plan.features?.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full p-0.5 bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm leading-snug" style={{ color: "var(--color-text-on-card)" }}>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.price > 0 ? 'primary' : 'secondary'}
                className="w-full mt-auto font-semibold py-2.5 rounded-xl group-hover:shadow-md transition-all"
                onClick={() => handleSubscribe(plan)}
                isLoading={processingPlanId === plan.id}
                disabled={processingPlanId !== null}
              >
                {plan.price > 0 ? 'Subscribe Now' : 'Start Free'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
