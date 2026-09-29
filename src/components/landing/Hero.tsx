import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Landmark, ReceiptText, UploadCloud, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 md:py-12 overflow-hidden" data-purpose="hero-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 text-[#4A6FA5] text-xs sm:text-sm font-semibold mb-3.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#4A6FA5] animate-pulse" />
              Built exclusively for Indian Chartered Accountants
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E2A38] leading-[1.15] mb-3.5">
              The operating <span className="accent-gradient-text">system</span>
              <br />
              for your CA firm.
            </h1>

            {/* Subhead paragraph */}
            <p className="text-base sm:text-lg text-[#5A6E85] leading-relaxed mb-5 max-w-xl">
              GST, ITR, TDS, ROC compliance, bank statements, invoices — one secure workspace that understands Indian tax law.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5 mb-6 w-full sm:w-auto">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] shadow-[0_4px_20px_rgba(74,111,165,0.25)] transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-[#1E2A38] bg-white hover:bg-[#F0F4F8] border border-[#E2E8F0] hover:border-[#4A6FA5]/40 transition-all cursor-pointer text-sm shadow-xs"
              >
                View products
              </Link>
            </div>

            {/* Trust highlights checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 border-t border-[#E2E8F0] w-full">
              {[
                "No credit card needed",
                "ICAI compliant",
                "AES-256 encrypted",
              ].map((highlight) => (
                <div key={highlight} className="flex items-center gap-2 text-xs sm:text-sm text-[#5A6E85]">
                  <CheckCircle2 className="w-4 h-4 text-[#3D7A64] flex-shrink-0" />
                  <span className="font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Product Showcase Preview */}
          <div className="lg:col-span-5 relative" data-purpose="hero-preview-box">
            {/* Ambient soft glow */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#4A6FA5]/15 via-[#A8C5DA]/20 to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none" />

            <div className="relative rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_20px_50px_rgba(30,42,56,0.08)] overflow-hidden">
              <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9E4A4A]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9E6B42]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3D7A64]" />
                  <span className="ml-2 text-xs font-mono uppercase tracking-wider text-[#1E2A38] font-bold">
                    AVAILABLE PRODUCTS
                  </span>
                </div>
                <span className="text-xs text-[#4A6FA5] bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  Live v2.4
                </span>
              </div>

              {/* Interactive Product Preview List */}
              <div className="relative z-10 space-y-3">
                {/* Preview Card 1: Bank Converter */}
                <Link
                  href="/dashboard/converters?type=bank"
                  className="relative block group p-3.5 rounded-xl bg-[#F7F9FB] hover:bg-[#F0F4F8] border border-[#E2E8F0] hover:border-[#4A6FA5]/40 transition-all cursor-pointer overflow-hidden shadow-xs"
                >
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center flex-shrink-0 text-[#4A6FA5]">
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h2 className="text-sm font-bold text-[#1E2A38] group-hover:text-[#4A6FA5] transition-colors truncate">
                          Bank Statement Converter
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border border-[rgba(61,122,100,0.2)] flex-shrink-0">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-[#5A6E85] leading-normal mb-2">
                        Convert PDF bank statements from 1000s of banks into clean Excel format instantly.
                      </p>
                      {/* Mini Interactive Upload Simulation */}
                      <div className="py-1.5 px-2.5 rounded-lg bg-white border border-dashed border-[#CBD5E1] group-hover:border-[#4A6FA5]/40 flex items-center justify-between text-[11px] text-[#5A6E85] transition-all">
                        <span className="flex items-center gap-1.5 font-medium">
                          <UploadCloud className="w-3.5 h-3.5 text-[#4A6FA5]" />
                          Drop PDF (e.g. HDFC, ICICI, SBI)
                        </span>
                        <span className="text-[#4A6FA5] font-semibold text-[10px] bg-[#4A6FA5]/10 px-1.5 py-0.5 rounded border border-[#4A6FA5]/20">
                          Parse → XLS
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Preview Card 2: Tax Invoice Converter */}
                <Link
                  href="/dashboard/converters?type=tax"
                  className="relative block group p-3.5 rounded-xl bg-[#F7F9FB] hover:bg-[#F0F4F8] border border-[#E2E8F0] hover:border-[#4A6FA5]/40 transition-all cursor-pointer overflow-hidden shadow-xs"
                >
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center flex-shrink-0 text-[#4A6FA5]">
                      <ReceiptText className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h2 className="text-sm font-bold text-[#1E2A38] group-hover:text-[#4A6FA5] transition-colors truncate">
                          Tax Invoice Converter
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border border-[rgba(61,122,100,0.2)] flex-shrink-0">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-[#5A6E85] leading-normal mb-2">
                        Extract line items, GSTIN, tax amounts from scanned or digital invoices for GST reconciliation.
                      </p>
                      {/* Tag badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#5A6E85] border border-[#E2E8F0] font-medium">
                          GSTIN Split
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#5A6E85] border border-[#E2E8F0] font-medium">
                          GSTR-2B Match
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#5A6E85] border border-[#E2E8F0] font-medium">
                          Batch OCR
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Security Tag in Box */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#5A6E85]">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D7A64]" />
                  Encrypted In-Memory Processing
                </span>
                <span className="text-[#8E9FAA] font-mono text-[10px]">Zero File Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
