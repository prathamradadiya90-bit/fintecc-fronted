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
    <section className="min-h-screen flex flex-col justify-center py-12 md:py-16 relative border-t border-[#E2E8F0] bg-white" data-purpose="core-products-suite" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 mb-2 shadow-xs">
            Products
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E2A38] tracking-tight mb-2">
            Everything your CA firm needs
          </h2>
          <p className="text-[#5A6E85] text-xs sm:text-sm leading-relaxed">
            Start with what you need today. High-accuracy conversion modules tailored for Indian audit standards and bank formats.
          </p>
        </div>

        {/* Available Now: 2 Featured Deep Dive Cards */}
        <div>
          <div className="flex items-center gap-2 md:ml-6 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3D7A64] animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#1E2A38]">Available Now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:mx-6">
            {/* Product Card 1: Bank Statement Converter */}
            <div className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="relative h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-white border border-[#E2E8F0] hover:border-[#4A6FA5]/50 shadow-[0_10px_30px_rgba(30,42,56,0.06)] hover:shadow-[0_20px_40px_rgba(74,111,165,0.15)] overflow-hidden transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center text-[#4A6FA5] shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border border-[rgba(61,122,100,0.2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-pulse" />
                      Live
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#1E2A38] mb-2 group-hover:text-[#4A6FA5] transition-colors">
                    Bank Statement Converter
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A6E85] leading-relaxed mb-4">
                    Upload any PDF bank statement and get a clean, structured Excel file in seconds. Supports 1000+ Indian and international banks.
                  </p>

                  {/* Detailed Bullet points */}
                  <ul className="space-y-2.5 mb-5 text-xs sm:text-sm text-[#1E2A38]">
                    {[
                      "SBI, HDFC, ICICI, Axis & 1000+ more",
                      "Multi-page PDFs supported without page limits",
                      "Instant Excel (.xlsx, .csv) & Tally XML output",
                      "Password-protected PDFs automated unlock",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <div className="w-4.5 h-4.5 rounded-full bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.2)] flex items-center justify-center flex-shrink-0 text-[#3D7A64]">
                          <Check className="w-3 h-3 text-[#3D7A64]" />
                        </div>
                        <span className="text-[#5A6E85] font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-1">
                  <Link
                    href="/dashboard/converters?type=bank"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] shadow-[0_4px_20px_rgba(74,111,165,0.25)] transition-all cursor-pointer text-sm transform hover:scale-[1.01]"
                  >
                    <span>Open Product</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Card 2: Tax Invoice Converter */}
            <div className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="relative h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-white border border-[#E2E8F0] hover:border-[#4A6FA5]/50 shadow-[0_10px_30px_rgba(30,42,56,0.06)] hover:shadow-[0_20px_40px_rgba(74,111,165,0.15)] overflow-hidden transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-center text-[#4A6FA5] shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <ReceiptText className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border border-[rgba(61,122,100,0.2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-pulse" />
                      Live
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#1E2A38] mb-2 group-hover:text-[#4A6FA5] transition-colors">
                    Tax Invoice Converter
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A6E85] leading-relaxed mb-4">
                    Extract line items, GSTIN, tax amounts from scanned or digital invoices and export to structured Excel for GST reconciliation.
                  </p>

                  {/* Detailed Bullet points */}
                  <ul className="space-y-2.5 mb-5 text-xs sm:text-sm text-[#1E2A38]">
                    {[
                      "GST invoice parsing (Scanned + E-Invoices)",
                      "CGST / SGST / IGST automated split verification",
                      "High-volume batch processing for monthly tallies",
                      "One-click Excel / CSV export matching Tally & Busy",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <div className="w-4.5 h-4.5 rounded-full bg-[rgba(61,122,100,0.08)] border border-[rgba(61,122,100,0.2)] flex items-center justify-center flex-shrink-0 text-[#3D7A64]">
                          <Check className="w-3 h-3 text-[#3D7A64]" />
                        </div>
                        <span className="text-[#5A6E85] font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-1">
                  <Link
                    href="/dashboard/converters?type=tax"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] shadow-[0_4px_20px_rgba(74,111,165,0.25)] transition-all cursor-pointer text-sm transform hover:scale-[1.01]"
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
