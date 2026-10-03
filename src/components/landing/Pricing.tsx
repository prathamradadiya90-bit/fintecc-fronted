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

  // Default featured Prime Plan fallback matching the design system
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
    <section className="py-14 md:py-20 relative bg-white border-t border-[#E2E8F0]" data-purpose="pricing-plan" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-2 shadow-xs">
            Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E2A38] tracking-tight mb-1.5">
            Simple, transparent pricing
          </h2>
          <p className="text-[#5A6E85] text-xs sm:text-sm">
            Choose the plan that best fits your firm&apos;s needs. Scale as you grow.
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-md mx-auto rounded-2xl h-[360px] animate-pulse bg-[#F7F9FB] border border-[#E2E8F0]" />
        ) : plans.length > 1 ? (
          <div className="flex flex-wrap justify-center gap-5">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plans.length === 1;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col p-5 rounded-2xl w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[300px] transition-all duration-300 relative ${
                    isPopular
                      ? 'bg-white border-2 border-[#4A6FA5] shadow-[0_10px_30px_rgba(74,111,165,0.12)]'
                      : 'bg-[#F7F9FB] border border-[#E2E8F0]'
                  }`}
                >
                  {isPopular && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#4A6FA5] text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-base font-bold text-[#1E2A38] mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-[#5A6E85] mb-3 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-3 pb-3 border-b border-[#E2E8F0]">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#1E2A38] tracking-tight">
                      ₹{Number(plan.price).toLocaleString()}
                    </span>
                    <span className="text-[#8E9FAA] text-xs font-medium">
                      /{formatPlanBillingPeriod(plan)}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-4 text-xs text-[#1E2A38] flex-1">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.2)] flex items-center justify-center text-[#3D7A64] flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs text-[#5A6E85] font-medium">{cleanPlanFeature(feature)}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPopular
                        ? 'bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white shadow-xs'
                        : 'bg-white hover:bg-[#E3EBF3] text-[#1E2A38] border border-[#E2E8F0]'
                    }`}
                  >
                    <span>Subscribe Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Featured Plan - Compact & Proportional */
          <div className="max-w-[440px] mx-auto relative">
            <div className="relative rounded-2xl bg-white border-2 border-[#4A6FA5]/80 p-5 sm:p-6 shadow-[0_15px_35px_rgba(74,111,165,0.1)] hover:border-[#4A6FA5] transition-all">
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#4A6FA5] text-white">
                  {defaultPrimePlan.badge}
                </span>
                <span className="text-xs text-[#4A6FA5] font-semibold">
                  {defaultPrimePlan.discountBadge}
                </span>
              </div>

              <div className="mb-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-[#1E2A38]">{plans[0]?.name || defaultPrimePlan.name}</h3>
                <p className="text-xs text-[#5A6E85] mt-0.5">
                  {plans[0]?.description || defaultPrimePlan.tagline}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-1.5 mb-3.5 pb-3 border-b border-[#E2E8F0]">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1E2A38] tracking-tight">
                  ₹{Number(plans[0]?.price ?? defaultPrimePlan.price).toLocaleString()}
                </span>
                <span className="text-[#8E9FAA] text-xs font-medium">
                  {plans[0] ? `/${formatPlanBillingPeriod(plans[0])}` : '/ year'}
                </span>
              </div>

              {/* Features Checklist */}
              <ul className="space-y-2 mb-4 text-xs text-[#1E2A38]">
                {(plans[0]?.features?.length && plans[0].features[0] !== "Unlimited services"
                  ? plans[0].features.map(cleanPlanFeature)
                  : defaultPrimePlan.features
                ).map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.2)] flex items-center justify-center text-[#3D7A64] flex-shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[#5A6E85] font-medium text-xs">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleGetStarted}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] transition-colors shadow-xs cursor-pointer text-xs sm:text-sm"
              >
                <span>Subscribe Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <p className="text-center text-[10px] text-[#8E9FAA] mt-2.5 leading-relaxed">
                14-day money-back guarantee • No questions asked • Instant tax invoice with GST credit
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
