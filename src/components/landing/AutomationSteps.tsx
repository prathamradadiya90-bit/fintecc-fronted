import React from "react";
import { UserPlus, ListTodo, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: StepItem[] = [
  {
    number: "1",
    title: "Onboard Clients",
    description:
      "Import clients via Excel or add manually. We auto-configure compliance calendars and assign recurring tasks instantly.",
    icon: UserPlus,
  },
  {
    number: "2",
    title: "Automate Tasks & Reminders",
    description:
      "Tasks auto-create for GST, TDS, and ITR due dates. WhatsApp and email reminders are sent to clients for documents and payments.",
    icon: ListTodo,
  },
  {
    number: "3",
    title: "Track, Review & Stay Compliant",
    description:
      "Monitor filing status, get expiry alerts for DSCs and registrations, and run review workflows — all from one dashboard.",
    icon: ShieldCheck,
  },
];

export function AutomationSteps() {
  return (
    <section 
      className="relative py-12 md:py-16 lg:py-20 bg-[#F7F9FB] border-b border-[#E2E8F0] overflow-hidden" 
      id="how-it-works"
      data-purpose="how-it-works-steps"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#4A6FA5]/6 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-3 shadow-xs">
            Practice Automation
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E2A38] mb-3">
            Automate your CA Office in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-[#5A6E85] font-normal leading-relaxed">
            From client onboarding to billing — minutes, not days.
          </p>
        </div>

        {/* 3 Connected Steps */}
        <div className="relative">
          {/* Horizontal connecting line for desktop (behind the circles) */}
          <div 
            className="hidden md:block absolute top-9 left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-[#4A6FA5]/20 via-[#4A6FA5] to-[#4A6FA5]/20 z-0 pointer-events-none" 
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.title}
                  className="flex flex-col items-center text-center group relative px-4"
                >
                  {/* Circular Icon Node */}
                  <div className="relative mb-6">
                    {/* Outer glow ring */}
                    <div className="absolute -inset-2 rounded-full bg-[#4A6FA5]/15 blur-md group-hover:bg-[#4A6FA5]/30 transition-all duration-300" />

                    <div className="relative w-18 h-18 rounded-full bg-gradient-to-tr from-[#3D5D8A] to-[#4A6FA5] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(74,111,165,0.25)] group-hover:scale-105 group-hover:shadow-[0_12px_30px_rgba(74,111,165,0.4)] transition-all duration-300">
                      <Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                    </div>

                    {/* Step index badge */}
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#4A6FA5] text-[#4A6FA5] text-[11px] font-bold flex items-center justify-center font-mono shadow-xs">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E2A38] mb-2.5 tracking-tight group-hover:text-[#4A6FA5] transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-[#5A6E85] leading-relaxed max-w-sm">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Bottom CTA strip */}
        <div className="mt-14 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <span className="text-xs sm:text-sm text-[#5A6E85]">
            Ready to streamline your firm&apos;s daily workflow?
          </span>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] transition-all shadow-[0_4px_16px_rgba(74,111,165,0.2)] cursor-pointer"
          >
            <span>Explore Practice Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
