"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetPublicPlansQuery } from "@/lib/store/api/plansApi";
import { formatPlanBillingPeriod, cleanPlanFeature } from "@/lib/utils/subscriptionUtils";
import { PricingSlider } from "./PricingSlider";
import type { PricingPlanItem } from "./PricingCard";

const DEFAULT_CA_PLANS: PricingPlanItem[] = [
  {
    id: "solo-ca-tier",
    name: "Solo Practitioner",
    tagline: "Essential compliance automation for individual CA practice",
    price: 4999,
    billingPeriod: "year",
    badge: "Emerging Practice",
    discountBadge: "Save 30% annually",
    popular: false,
    features: [
      "Up to 300 bank statement conversions / year",
      "Automated GST 2A/2B vs PR reconciliation",
      "Single login with Tally XML & Excel exports",
      "Standard tax audit check templates",
      "Email & in-app support within 24h",
    ],
  },
  {
    id: "prime-plan-default",
    name: "Practice Prime",
    tagline: "All services, automated updates, & priority OCR processing",
    price: 11999,
    billingPeriod: "year",
    badge: "Most Popular • CA Firm Pass",
    discountBadge: "Save 40% annually",
    popular: true,
    features: [
      "Unlimited bank statement conversions",
      "Unlimited tax invoice parsing & splits",
      "Team access for up to 5 article assistants/staff",
      "Multi-client workspace & client portal sharing",
      "All upcoming modules included at no extra cost",
      "Priority WhatsApp & phone support from CA team",
    ],
  },
  {
    id: "enterprise-ca-tier",
    name: "Firm Enterprise",
    tagline: "High volume automation & multi-branch firm control",
    price: 24999,
    billingPeriod: "year",
    badge: "Multi-Partner Firm",
    discountBadge: "Full CA Suite",
    popular: false,
    features: [
      "Unlimited conversions & tax invoice parsing",
      "Unlimited article assistants & staff logins",
      "Dedicated account manager & CA compliance lead",
      "Advanced branch-wise audit trail & access controls",
      "Custom ERP & accounting software integration",
      "Priority SLA & 1-on-1 team onboarding sessions",
    ],
  },
];

export function Pricing() {
  const router = useRouter();
  const { data, isLoading } = useGetPublicPlansQuery();
  const handleSelectPlan = (planId: string) => {
    router.push(`/dashboard/subscription?plan=${encodeURIComponent(planId)}`);
  };

  const formattedPlans: PricingPlanItem[] = useMemo(() => {
    const plans = data?.data || [];
    if (plans && plans.length > 1) {
      const popularIdx = plans.findIndex(
        (p) => p.name.toLowerCase() === "prime" || p.name.toLowerCase().includes("popular")
      );
      const resolvedPopularIndex = popularIdx >= 0 ? popularIdx : 1;

      return plans.map((plan, index) => {
        const isPopular = index === resolvedPopularIndex;

        return {
          id: plan.id,
          name: plan.name,
          tagline:
            plan.description && plan.description.trim()
              ? plan.description
              : "Comprehensive CA compliance and firm automation suite",
          price: Number(plan.price) || 0,
          billingPeriod: formatPlanBillingPeriod(plan),
          badge: isPopular ? "Most Popular • CA Firm Pass" : undefined,
          discountBadge: isPopular ? "Save 40% annually" : undefined,
          popular: isPopular,
          features:
            plan.features && plan.features.length > 0 && plan.features[0] !== "Unlimited services"
              ? plan.features.map(cleanPlanFeature)
              : [
                  "Bank statement OCR conversion",
                  "Automated GST & tax reconciliation",
                  "Team & staff collaboration access",
                  "Priority support from CA team",
                ],
        };
      });
    }

    if (plans && plans.length === 1) {
      const livePlan = plans[0];
      return [
        DEFAULT_CA_PLANS[0],
        {
          id: livePlan.id,
          name: livePlan.name || DEFAULT_CA_PLANS[1].name,
          tagline: livePlan.description || DEFAULT_CA_PLANS[1].tagline,
          price: Number(livePlan.price) || DEFAULT_CA_PLANS[1].price,
          billingPeriod: formatPlanBillingPeriod(livePlan),
          badge: DEFAULT_CA_PLANS[1].badge,
          discountBadge: DEFAULT_CA_PLANS[1].discountBadge,
          popular: true,
          features:
            livePlan.features && livePlan.features.length > 0
              ? livePlan.features.map(cleanPlanFeature)
              : DEFAULT_CA_PLANS[1].features,
        },
        DEFAULT_CA_PLANS[2],
      ];
    }

    return DEFAULT_CA_PLANS;
  }, [data?.data]);

  return (
    <section className="py-12 md:py-16 lg:py-20 relative bg-white border-t border-[#E2E8F0]" data-purpose="pricing-plan" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
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

        {/* Pricing Slider or Skeleton */}
        {isLoading ? (
          <div className="flex justify-center gap-5 overflow-hidden py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[310px] sm:w-[350px] h-[480px] rounded-2xl animate-pulse bg-[#F7F9FB] border border-[#E2E8F0] shrink-0"
              />
            ))}
          </div>
        ) : (
          <PricingSlider
            plans={formattedPlans}
            onSelectPlan={handleSelectPlan}
          />
        )}

      </div>
    </section>
  );
}
