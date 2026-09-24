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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Available Now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Card 1: Bank Statement Converter */}
            <div className="group glass-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  Bank Statement Converter
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Upload any PDF bank statement and get a clean, structured Excel file in seconds. Supports 1000+ Indian and international banks.
                </p>

                {/* Detailed Bullet points */}
                <ul className="space-y-3 mb-8 text-sm text-slate-300">
                  {[
                    "SBI, HDFC, ICICI, Axis & 1000+ more",
                    "Multi-page PDFs supported without page limits",
                    "Instant Excel (.xlsx, .csv) standardized output",
                    "Password-protected PDFs automated unlock",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard/converters?type=bank"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all cursor-pointer text-sm"
              >
                <span>Open Product</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Product Card 2: Tax Invoice Converter */}
            <div className="group glass-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <ReceiptText className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  Tax Invoice Converter
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Extract line items, GSTIN, tax amounts from scanned or digital invoices and export to structured Excel for GST reconciliation.
                </p>

                {/* Detailed Bullet points */}
                <ul className="space-y-3 mb-8 text-sm text-slate-300">
                  {[
                    "GST invoice parsing (Scanned + E-Invoices)",
                    "CGST / SGST / IGST automated split verification",
                    "High-volume batch processing for monthly tallies",
                    "One-click Excel / CSV export matching Tally & Busy",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard/converters?type=tax"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all cursor-pointer text-sm"
              >
                <span>Open Product</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
