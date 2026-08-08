import React from "react";
import { Check } from "lucide-react";

export function Pricing() {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Starter */}
          <div className="flex flex-col p-8 bg-[#0F1E36] rounded-3xl border border-slate-800/60 hover:border-slate-700 transition-colors">
            <h3 className="text-base font-bold text-white mb-2 text-center">Starter</h3>
            <p className="text-sm text-slate-400 mb-8 text-center h-10">For independent CAs just starting out.</p>
            <div className="flex items-end justify-center gap-1 mb-10">
              <span className="text-xl font-black text-white tracking-tighter">₹0</span>
              <span className="text-xs text-slate-400 mb-0.5 font-medium">/mo</span>
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              {[
                "Up to 50 Clients",
                "Basic GST Tracking",
                "Manual Client Sync",
                "1 User Account",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Professional */}
          <div className="flex flex-col p-8 bg-[#0F1E36] rounded-3xl border border-slate-800/60 hover:border-slate-700 transition-colors">
            <h3 className="text-base font-bold text-white mb-2 text-center">Professional</h3>
            <p className="text-sm text-slate-400 mb-8 text-center h-10">Perfect for growing practices.</p>
            <div className="flex items-end justify-center gap-1 mb-10">
              <span className="text-xl font-black text-white tracking-tighter">₹1,999</span>
              <span className="text-xs text-slate-400 mb-0.5 font-medium">/mo</span>
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              {[
                "Up to 500 Clients",
                "Automated GST GSTR-1 & 3B",
                "Tally ERP Integration",
                "Up to 5 Staff Users",
                "Basic DSC Vault",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise */}
          <div className="flex flex-col p-8 bg-[#132342] rounded-3xl border-2 border-indigo-500 relative transform lg:-translate-y-4 shadow-2xl shadow-indigo-500/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-2 text-center mt-2">Enterprise</h3>
            <p className="text-sm text-slate-400 mb-8 text-center h-10">For mid-to-large CA firms.</p>
            <div className="flex items-end justify-center gap-1 mb-10">
              <span className="text-xl font-black text-white tracking-tighter">₹4,999</span>
              <span className="text-xs text-slate-400 mb-0.5 font-medium">/mo</span>
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              {[
                "Unlimited Clients",
                "AI Bank Statement OCR (Gemini)",
                "Up to 20 Staff Users",
                "Advanced DSC & Credential Vault",
                "Priority Support",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimate */}
          <div className="flex flex-col p-8 bg-[#0F1E36] rounded-3xl border border-slate-800/60 hover:border-slate-700 transition-colors">
            <h3 className="text-base font-bold text-white mb-2 text-center">Ultimate</h3>
            <p className="text-sm text-slate-400 mb-8 text-center h-10">Full-scale automation.</p>
            <div className="flex items-end justify-center gap-1 mb-10">
              <span className="text-xl font-black text-white tracking-tighter">₹9,999</span>
              <span className="text-xs text-slate-400 mb-0.5 font-medium">/mo</span>
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              {[
                "Unlimited Everything",
                "Custom ERP Integrations",
                "Dedicated Account Manager",
                "On-premise deployment option",
                "Custom SLA",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
