import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative py-10 sm:py-14 lg:py-16 overflow-hidden" data-purpose="hero-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
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

          {/* Right Column: Multi-Device Showcase Preview */}
          <div className="lg:col-span-6 relative flex items-center justify-center" data-purpose="hero-devices-preview">
            {/* Ambient soft glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#4A6FA5]/15 via-[#A8C5DA]/20 to-transparent rounded-3xl blur-3xl opacity-75 pointer-events-none" />

            <div className="relative w-full flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/devices.png"
                alt="Fintecc Operating System across Desktop, Laptop, Tablet, and Mobile"
                width={1492}
                height={954}
                priority
                className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(30,42,56,0.12)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
