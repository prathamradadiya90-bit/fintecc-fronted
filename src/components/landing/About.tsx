import React from "react";
import { 
  Landmark, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Zap
} from "lucide-react";

export function About() {
  const pillars = [
    {
      icon: Landmark,
      badge: "Universal Parsing",
      badgeColor: "bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/20",
      title: "Direct Tally & Excel Engine",
      description:
        "Parse complex multi-page statements across 1000+ Indian banks into clean, ledger-mapped Tally XML or formatted Excel spreadsheets in seconds.",
      features: [
        "1000+ Indian & cooperative bank layouts",
        "Automated contra & transfer entry detection",
        "Multi-page parsing with zero page loss",
      ],
      accentGradient: "from-[#4A6FA5]/30",
    },
    {
      icon: ShieldCheck,
      badge: "ICAI Standards",
      badgeColor: "bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border-[rgba(61,122,100,0.2)]",
      title: "Zero-Retention Client Privacy",
      description:
        "Every file is parsed transiently in volatile RAM and immediately wiped. Client financial records are never saved to persistent cloud storage.",
      features: [
        "In-memory AES-256 encrypted parsing",
        "Zero server-side permanent file storage",
        "Compliant with ICAI audit trail standards",
      ],
      accentGradient: "from-[#3D7A64]/30",
    },
    {
      icon: Users,
      badge: "Practice Flow",
      badgeColor: "bg-[rgba(158,107,66,0.08)] text-[#9E6B42] border-[rgba(158,107,66,0.2)]",
      title: "Team & Article Collaboration",
      description:
        "Unify partners and article staff under one secure dashboard with role-based access, client document vaults, and statutory tax calculators.",
      features: [
        "Role-based staff & assistant management",
        "Centralized client document intake",
        "Integrated GST & Income Tax calculators",
      ],
      accentGradient: "from-[#9E6B42]/30",
    },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center py-12 md:py-16 relative overflow-hidden bg-[#F7F9FB] border-t border-[#E2E8F0]" data-purpose="about-section" id="about">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#4A6FA5]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-2 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-[#4A6FA5]" />
            Institutional Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A38] tracking-tight mb-2">
            Built exclusively for the <span className="accent-gradient-text">Modern Indian CA</span>
          </h2>
          <p className="text-[#5A6E85] text-xs sm:text-sm leading-relaxed">
            Fintecc replaces fragmented spreadsheets and ad-hoc software with an institutional operating system designed to elevate your firm&apos;s speed, accuracy, and client trust.
          </p>
        </div>

        {/* 3 Institutional Architecture Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="relative rounded-2xl p-5 sm:p-6 bg-white border border-[#E2E8F0] hover:border-[#4A6FA5]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center text-[#4A6FA5] transition-transform group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pillar.badgeColor}`}>
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#1E2A38] mb-1.5 group-hover:text-[#4A6FA5] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A6E85] leading-relaxed mb-4">
                    {pillar.description}
                  </p>

                  <ul className="space-y-2 mb-2 text-xs text-[#5A6E85]">
                    {pillar.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#3D7A64] shrink-0" />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subtle bottom hairline accent matching dashboard StatCard */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${pillar.accentGradient} to-transparent`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
