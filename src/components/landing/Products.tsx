import React from "react";
import Link from "next/link";
import { 
  Landmark, 
  ReceiptText, 
  ArrowRight, 
  Check 
} from "lucide-react";

export function Products() {
  return (
    <section className="py-20 relative border-t border-white/5 bg-[#0B111E]/40" data-purpose="core-products-suite" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            Products
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Everything your CA firm needs
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Start with what you need today. More compliance modules coming soon to replace fragmented tools.
          </p>
        </div>

        {/* Available Now: 2 Featured Deep Dive Cards */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">Available Now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Card 1: Bank Statement Converter */}
            <div className="group relative rounded-3xl transition-all duration-500 hover:-translate-y-1.5">
              {/* Luminous ambient background bloom for glass refraction */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/30 via-emerald-500/20 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

              <div className="relative h-full rounded-3xl p-8 sm:p-9 flex flex-col justify-between backdrop-blur-2xl bg-gradient-to-b from-white/[0.09] via-slate-900/30 to-slate-950/45 border border-white/15 hover:border-emerald-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_25px_60px_-10px_rgba(16,185,129,0.25),inset_0_1px_2px_0_rgba(255,255,255,0.35)] overflow-hidden transition-all duration-300">
                {/* Top specular highlight sheen */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-transparent pointer-events-none" />
                {/* Ambient corner light spot */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none group-hover:bg-blue-500/25 transition-colors duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-400/30 backdrop-blur-xl flex items-center justify-center text-blue-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-300">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      Live
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-emerald-300 transition-colors">
                    Bank Statement Converter
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Upload any PDF bank statement and get a clean, structured Excel file in seconds. Supports 1000+ Indian and international banks.
                  </p>

                  {/* Detailed Bullet points */}
                  <ul className="space-y-3 mb-8 text-sm text-slate-200">
                    {[
                      "SBI, HDFC, ICICI, Axis & 1000+ more",
                      "Multi-page PDFs supported without page limits",
                      "Instant Excel (.xlsx, .csv) standardized output",
                      "Password-protected PDFs automated unlock",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                          <Check className="w-3 h-3 text-emerald-300" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-2">
                  <Link
                    href="/dashboard/converters?type=bank"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 border border-blue-400/30 shadow-[0_4px_20px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all cursor-pointer text-sm transform hover:scale-[1.01]"
                  >
                    <span>Open Product</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Card 2: Tax Invoice Converter */}
            <div className="group relative rounded-3xl transition-all duration-500 hover:-translate-y-1.5">
              {/* Luminous ambient background bloom for glass refraction */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/35 via-emerald-400/25 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

              <div className="relative h-full rounded-3xl p-8 sm:p-9 flex flex-col justify-between backdrop-blur-2xl bg-gradient-to-b from-white/[0.09] via-slate-900/30 to-slate-950/45 border border-white/15 hover:border-emerald-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_25px_60px_-10px_rgba(16,185,129,0.25),inset_0_1px_2px_0_rgba(255,255,255,0.35)] overflow-hidden transition-all duration-300">
                {/* Top specular highlight sheen */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-transparent pointer-events-none" />
                {/* Ambient corner light spot */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-xl flex items-center justify-center text-emerald-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-300">
                      <ReceiptText className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      Live
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-emerald-300 transition-colors">
                    Tax Invoice Converter
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Extract line items, GSTIN, tax amounts from scanned or digital invoices and export to structured Excel for GST reconciliation.
                  </p>

                  {/* Detailed Bullet points */}
                  <ul className="space-y-3 mb-8 text-sm text-slate-200">
                    {[
                      "GST invoice parsing (Scanned + E-Invoices)",
                      "CGST / SGST / IGST automated split verification",
                      "High-volume batch processing for monthly tallies",
                      "One-click Excel / CSV export matching Tally & Busy",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                          <Check className="w-3 h-3 text-emerald-300" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-2">
                  <Link
                    href="/dashboard/converters?type=tax"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all cursor-pointer text-sm transform hover:scale-[1.01]"
                  >
                    <span>Open Product</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
