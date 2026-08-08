import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  Landmark, 
  ReceiptText, 
  ChevronRight 
} from "lucide-react";

export function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-64px)] px-6 md:px-12 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 gap-12">
      {/* Left */}
      <div className="flex-1 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-6 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700">
            Built for Indian Chartered Accountants
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A1628] leading-[1.1] mb-6">
          The operating <span className="text-emerald-500">system</span> for your CA firm.
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-8 max-w-lg">
          GST, ITR, TDS, ROC compliance, bank statements, invoices — one secure workspace that understands Indian tax law.
        </p>

        <div className="flex flex-wrap gap-4 mb-10">
          <Link
            href="#products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer text-sm"
          >
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#products"
            className="px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-[#0A1628] font-semibold rounded-xl transition-all duration-200 cursor-pointer text-sm"
          >
            View products
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {["No credit card needed", "ICAI compliant", "AES-256 encrypted", "Free 14-day trial"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-500">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — product cards preview */}
      <div className="w-full lg:max-w-md flex flex-col gap-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Available Products
        </div>

        {[
          {
            icon: Landmark,
            title: "Bank Statement Converter",
            desc: "Convert PDF bank statements from 1000s of banks into clean Excel format instantly.",
            tag: "Live",
            color: "text-blue-500",
            bg: "bg-blue-50",
            product: "bank",
          },
          {
            icon: ReceiptText,
            title: "Tax Invoice Converter",
            desc: "Extract and convert tax invoices to structured data for GST reconciliation.",
            tag: "Live",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            product: "tax",
          },
        ].map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.title}
              href={`/dashboard/converters?type=${p.product}`}
              className="flex items-start gap-4 p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${p.bg} shrink-0`}>
                <Icon className={`w-5.5 h-5.5 ${p.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">{p.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {p.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">{p.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 self-center" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
