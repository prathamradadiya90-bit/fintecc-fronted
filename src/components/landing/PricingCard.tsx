"use client";

import React from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export interface PricingPlanItem {
  id: string;
  name: string;
  tagline: string;
  price: number;
  billingPeriod: string;
  badge?: string;
  discountBadge?: string;
  popular?: boolean;
  features: string[];
}

interface PricingCardProps {
  plan: PricingPlanItem;
  isActive?: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function PricingCard({
  plan,
  isActive = false,
  isDragging = false,
  onSelect,
  className = "",
  style,
}: PricingCardProps) {
  const isPopular = Boolean(plan.popular);

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    onSelect();
  };

  return (
    <div
      style={style}
      className={`flex flex-col p-6 rounded-2xl w-full h-full transition-all duration-300 relative select-none ${
        isPopular
          ? "bg-white border-2 border-[#4A6FA5] shadow-[0_12px_36px_rgba(74,111,165,0.14)]"
          : isActive
          ? "bg-white border-2 border-[#A8C5DA] shadow-[0_8px_24px_rgba(74,111,165,0.08)]"
          : "bg-[#F7F9FB] border border-[#E2E8F0] hover:border-[#A8C5DA]"
      } ${className}`}
    >
      {/* Top Badge Section */}
      <div className="flex items-center justify-between min-h-[26px] mb-3">
        {plan.badge ? (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
              isPopular
                ? "bg-[#4A6FA5] text-white"
                : "bg-[#A8C5DA]/25 text-[#1E2A38] border border-[#A8C5DA]/40"
            }`}
          >
            {isPopular && <Sparkles className="w-2.5 h-2.5" />}
            {plan.badge}
          </span>
        ) : (
          <span />
        )}

        {plan.discountBadge && (
          <span className="text-[11px] font-semibold text-[#4A6FA5]">
            {plan.discountBadge}
          </span>
        )}
      </div>

      {/* Title & Tagline */}
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-bold text-[#1E2A38] tracking-tight">
          {plan.name}
        </h3>
        <p className="text-xs text-[#5A6E85] mt-1 line-clamp-2 leading-relaxed">
          {plan.tagline}
        </p>
      </div>

      {/* Price Block */}
      <div className="flex items-baseline gap-1.5 mb-4 pb-4 border-b border-[#E2E8F0]">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#1E2A38] tracking-tight">
          ₹{Number(plan.price).toLocaleString()}
        </span>
        <span className="text-[#8E9FAA] text-xs font-medium">
          {plan.billingPeriod.startsWith("/") ? plan.billingPeriod : `/${plan.billingPeriod}`}
        </span>
      </div>

      {/* Features Checklist */}
      <ul className="space-y-2.5 mb-6 text-xs text-[#1E2A38] flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.2)] flex items-center justify-center text-[#3D7A64] shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span className="text-xs text-[#5A6E85] font-medium leading-tight">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isPopular
            ? "bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white shadow-xs"
            : "bg-white hover:bg-[#E3EBF3] text-[#1E2A38] border border-[#E2E8F0]"
        }`}
      >
        <span>Subscribe Now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
