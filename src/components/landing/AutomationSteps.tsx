import React from "react";
import { UserPlus, ListTodo, ShieldCheck, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlights: string[];
}

const steps: StepItem[] = [
  {
    number: "01",
    title: "Onboard Clients",
    description:
      "Import clients via Excel or add manually. We auto-configure compliance calendars and assign recurring tasks instantly.",
    icon: UserPlus,
    highlights: ["Excel & CSV Import", "Auto-KYC Setup", "Client Vault"],
  },
  {
    number: "02",
    title: "Automate Tasks & Reminders",
    description:
      "Tasks auto-create for GST, TDS, and ITR due dates. WhatsApp and email reminders are sent to clients for documents and payments.",
    icon: ListTodo,
    highlights: ["Statutory Due Dates", "WhatsApp & Email Alerts", "Maker-Checker"],
  },
  {
    number: "03",
    title: "Track, Review & Stay Compliant",
    description:
      "Monitor filing status, get expiry alerts for DSCs and registrations, and run review workflows — all from one dashboard.",
    icon: ShieldCheck,
    highlights: ["DSC Expiry Gate", "Live Filing Status", "Audit Trail"],
  },
];

export function AutomationSteps() {
  return (
    <section 
      className="relative py-14 md:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-hidden" 
      id="how-it-works"
      data-purpose="how-it-works-steps"
    >
      {/* Modern subtle dot-grid texture (no blurry smudges) */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" 
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6FA5] animate-pulse" />
            Practice Automation
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E2A38] mb-3">
            Automate your CA Office in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-[#5A6E85] font-normal leading-relaxed max-w-xl mx-auto">
            From client onboarding to billing — minutes, not days.
          </p>
        </div>

        {/* 3 Connected Modern Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.title}
                className="relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#4A6FA5]/50 transition-all duration-300 hover:-translate-y-1.5 group"
              >
                {/* Top Subtle Animated Gradient Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#4A6FA5] group-hover:to-indigo-500 rounded-t-2xl transition-all duration-300" />

                <div>
                  {/* Step Header with Icon & Index Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 text-[#4A6FA5] flex items-center justify-center group-hover:bg-[#4A6FA5] group-hover:text-white group-hover:scale-105 transition-all duration-300">
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#F1F5F9] text-[#4A6FA5] border border-[#E2E8F0] group-hover:border-[#4A6FA5]/30 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E2A38] mb-2.5 tracking-tight group-hover:text-[#4A6FA5] transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-[#5A6E85] leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Micro-Features / Highlights list */}
                <div className="pt-4 border-t border-[#F1F5F9] space-y-2">
                  {step.highlights.map((item) => (
                    <div 
                      key={item} 
                      className="flex items-center gap-2 text-xs text-[#5A6E85] font-medium"
                    >
                      <Check className="w-3.5 h-3.5 text-[#3D7A64] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <span className="text-xs sm:text-sm text-[#5A6E85]">
            Ready to streamline your firm&apos;s daily workflow?
          </span>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] border border-[#4A6FA5] transition-all duration-200 group cursor-pointer"
          >
            <span>Explore Practice Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
