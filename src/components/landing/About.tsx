import React from "react";

export function About() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#070A11]" data-purpose="trust-metrics" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Built for the <span className="accent-gradient-text">Indian CA</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Fintecc is a unified fintech platform designed specifically for Chartered Accountants in India. We understand the complexity of Indian tax law, compliance deadlines, and the daily challenges CA firms face — so you do not have to juggle 5 different tools anymore.
          </p>
        </div>

        {/* Metric Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              metric: "1000+",
              label: "Banks Supported",
              desc: "SBI, HDFC, ICICI, Axis, Kotak, regional cooperative & foreign banks with custom statement layouts.",
            },
            {
              metric: "AES-256",
              label: "Encryption",
              desc: "Zero data retention after processing. In-memory conversion ensures absolute client financial privacy.",
            },
            {
              metric: "ICAI",
              label: "Compliant Platform",
              desc: "Standardized output formats matching Indian tax compliance, audit trial guidelines, and UDIN standards.",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-8 rounded-2xl glass-card text-center flex flex-col items-center hover:border-emerald-500/40 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                {stat.metric}
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">
                {stat.label}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
