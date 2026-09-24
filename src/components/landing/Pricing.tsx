"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetPublicPlansQuery } from "@/lib/store/api/plansApi";
import { formatPlanBillingPeriod, cleanPlanFeature } from "@/lib/utils/subscriptionUtils";

export function Pricing() {
  const router = useRouter();
  const { data, isLoading } = useGetPublicPlansQuery();
  const plans = data?.data || [];

  const handleGetStarted = () => {
    router.push('/dashboard/subscription');
  };

  // Default featured Prime Plan fallback matching the redesign design
  const defaultPrimePlan = {
    id: "prime-plan-default",
    name: "Prime Plan",
    tagline: "All services, automated updates, & priority processing",
    price: 11999,
    billingPeriod: "year",
    badge: "Most Popular • CA Firm Pass",
    discountBadge: "Save 40% annually",
    features: [
      "Unlimited bank statement conversions",
      "Unlimited tax invoice parsing & splits",
      "Team access for up to 5 article assistants/staff",
      "All upcoming modules included at no extra cost",
      "Priority WhatsApp & phone support from CA team",
    ],
  };

  return (
    <section className="py-20 relative bg-[#090E19] border-t border-white/5" data-purpose="pricing-plan" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Choose the plan that best fits your firm&apos;s needs. Scale as you grow.
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-lg mx-auto rounded-2xl h-[520px] animate-pulse bg-white/5 border border-white/10" />
        ) : plans.length > 1 ? (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-6">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plans.length === 1;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col p-8 rounded-2xl w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[320px] transition-all duration-300 relative ${
                    isPopular
                      ? 'bg-[#101828] border-2 border-emerald-500/60 shadow-2xl shadow-emerald-500/20'
                      : 'glass-card'
                  }`}
                >
                  {isPopular && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-400 text-slate-950">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 h-8 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-white/10">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      ₹{Number(plan.price).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">
                      /{formatPlanBillingPeriod(plan)}
                    </span>
                  </div>

                  <ul className="space-y-3.5 mb-8 text-sm text-slate-300 flex-1">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-300">{cleanPlanFeature(feature)}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-glow-emerald'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <span>Subscribe Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Featured Plan (Redesign Match from Backend) */
          <div className="max-w-lg mx-auto relative">
            {/* Subtle glow ring */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-emerald-500 via-emerald-600 to-transparent opacity-30 blur-lg pointer-events-none" />
            <div className="relative rounded-2xl bg-[#101828] border-2 border-emerald-500/50 p-8 sm:p-10 shadow-2xl">
              {/* Pill badge */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-400 text-slate-950">
                    {defaultPrimePlan.badge}
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">
                  {defaultPrimePlan.discountBadge}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">{plans[0]?.name || defaultPrimePlan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {plans[0]?.description || defaultPrimePlan.tagline}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-white/10">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  ₹{Number(plans[0]?.price ?? defaultPrimePlan.price).toLocaleString()}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  {plans[0] ? `/${formatPlanBillingPeriod(plans[0])}` : '/ year'}
                </span>
              </div>

              {/* Features Checklist */}
              <ul className="space-y-4 mb-8 text-sm text-slate-300">
                {(plans[0]?.features?.length && plans[0].features[0] !== "Unlimited services"
                  ? plans[0].features.map(cleanPlanFeature)
                  : defaultPrimePlan.features
                ).map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleGetStarted}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-glow-emerald cursor-pointer"
              >
                <span>Subscribe Now</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
                14-day money-back guarantee • No questions asked • Instant tax invoice with GST credit
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
