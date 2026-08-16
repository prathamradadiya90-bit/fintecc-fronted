"use client";

import React from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetPublicPlansQuery } from "@/lib/store/api/plansApi";

export function Pricing() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetPublicPlansQuery();
  const plans = data?.data || [];

  const handleGetStarted = () => {
    // If we want to take the user to the subscription page, we route them through login first if needed.
    // Assuming they are logged in, /dashboard/subscription. If not, /auth will handle redirect.
    // For simplicity, we just push to dashboard subscription which has an AuthGuard,
    // so it will redirect to /auth if they aren't logged in.
    router.push('/dashboard/subscription');
  };

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-[#0A1628] border-t border-slate-800/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Choose the plan that best fits your firm&apos;s needs. Scale as you grow.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6 justify-center">
             {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl h-[450px] animate-pulse bg-slate-800/50" />
             ))}
          </div>
        ) : isError ? (
          <div className="text-center text-red-400 p-8">
            Failed to load pricing plans. Please try again later.
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center text-slate-400 p-8">
            No plans available at the moment.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-6">
            {plans.map((plan, index) => {
              // Highlight the middle plan or second plan as popular for visual flair
              const isPopular = plans.length > 1 && index === 1;

              return (
                <div 
                  key={plan.id}
                  className={`flex flex-col p-8 rounded-3xl w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[280px] transition-all duration-300 ${
                    isPopular 
                      ? 'bg-[#132342] border-2 border-indigo-500 relative transform lg:-translate-y-4 shadow-2xl shadow-indigo-500/20' 
                      : 'bg-[#0F1E36] border border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-emerald-500 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-1.5 rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className={`text-base font-bold text-white mb-2 text-center ${isPopular ? 'mt-2' : ''}`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-8 text-center h-10 line-clamp-2">
                    {plan.description}
                  </p>
                  
                  <div className="flex items-end justify-center gap-1 mb-10">
                    <span className="text-2xl font-black text-white tracking-tighter">
                      ₹{Number(plan.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 mb-1 font-medium">
                       /{plan.durationMonths === 1 ? 'mo' : plan.durationMonths === 12 ? 'yr' : `${plan.durationMonths}mo`}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-auto mb-8">
                    {plan.features?.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleGetStarted}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      isPopular
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : plan.price === 0
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-[#00C2B3] hover:bg-[#00a89b] text-white'
                    }`}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Subscribe Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
