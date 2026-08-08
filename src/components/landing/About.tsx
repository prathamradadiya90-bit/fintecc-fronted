import React from "react";

export function About() {
  return (
    <section id="about" className="py-20 px-6 md:px-12 bg-[#0A1628]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
          Built for the <span className="text-emerald-400">Indian CA</span>
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-9">
          Fintecc is a unified fintech platform designed specifically for Chartered Accountants in India. We understand the complexity of Indian tax law, compliance deadlines, and the daily challenges CA firms face - so you do not have to juggle 5 different tools anymore.
        </p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { num: "1000+", label: "Banks Supported" },
            { num: "AES-256", label: "Encryption" },
            { num: "ICAI", label: "Compliant Platform" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl md:text-xl font-black text-emerald-400 mb-1">
                {s.num}
              </div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
