import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Landmark, ReceiptText, UploadCloud, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden" data-purpose="hero-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Built exclusively for Indian Chartered Accountants
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
              The operating <span className="accent-gradient-text">system</span>
              <br />
              for your CA firm.
            </h1>

            {/* Subhead paragraph */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              GST, ITR, TDS, ROC compliance, bank statements, invoices — one secure workspace that understands Indian tax law.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-glow-emerald transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer text-sm"
              >
                View products
              </Link>
            </div>

            {/* Trust highlights checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full">
              {[
                "No credit card needed",
                "ICAI compliant",
                "AES-256 encrypted",
              ].map((highlight) => (
                <div key={highlight} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Product Showcase Preview */}
          <div className="lg:col-span-5 relative" data-purpose="hero-preview-box">
            {/* Decorative backdrop glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 rounded-3xl blur-xl opacity-60 pointer-events-none" />
            <div className="relative rounded-2xl glass-card p-6 shadow-glow-card">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                    AVAILABLE PRODUCTS
                  </span>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  Live v2.4
                </span>
              </div>

              {/* Interactive Product Preview List */}
              <div className="space-y-4">
                {/* Preview Card 1: Bank Converter */}
                <Link
                  href="/dashboard/converters?type=bank"
                  className="block group p-4 rounded-xl bg-[#101828]/90 border border-white/10 hover:border-emerald-500/40 hover:bg-[#101828] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Bank Statement Converter
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal mb-2">
                        Convert PDF bank statements from 1000s of banks into clean Excel format instantly.
                      </p>
                      {/* Mini Interactive Upload Simulation */}
                      <div className="py-2 px-3 rounded-lg bg-white/5 border border-dashed border-white/15 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                          Drop PDF (e.g. HDFC, ICICI, SBI)
                        </span>
                        <span className="text-emerald-400 font-semibold text-[10px]">
                          Parse → XLS
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Preview Card 2: Tax Invoice Converter */}
                <Link
                  href="/dashboard/converters?type=tax"
                  className="block group p-4 rounded-xl bg-[#101828]/90 border border-white/10 hover:border-emerald-500/40 hover:bg-[#101828] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <ReceiptText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Tax Invoice Converter
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal mb-2">
                        Extract line items, GSTIN, tax amounts from scanned or digital invoices for GST reconciliation.
                      </p>
                      {/* Tag badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                          GSTIN Split
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                          GSTR-2B Match
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                          Batch OCR
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Security Tag in Box */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Encrypted In-Memory Processing
                </span>
                <span className="text-slate-400">Zero File Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
