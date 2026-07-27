"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useCreateContactMessageMutation } from "@/lib/store/api/contactApi";
import { useToast } from "@/components/ui/Toast";
import type { RootState } from "@/lib/store/store";
import Logo from "@/components/ui/Logo";
import { 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Check, 
  Landmark, 
  ReceiptText, 
  ChevronRight, 
  FileText, 
  Receipt, 
  FileSpreadsheet, 
  Building2 
} from "lucide-react";

export default function Landing() {
  const productsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [createContactMessage, { isLoading }] = useCreateContactMessageMutation();

  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = async () => {
    if (!user) {
      showToast("Please log in to contact support.", "error");
      router.push("/auth");
      return;
    }
    if (!email || !message) {
      showToast("Please fill out both email and message.", "error");
      return;
    }
    try {
      await createContactMessage({ email, message }).unwrap();
      showToast("Message sent successfully!");
      if (!user?.email) {
        setEmail("");
      }
      setMessage("");
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to send message", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 md:px-12 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Logo width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-extrabold tracking-tight text-[#0A1628]">
            Fintecc
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={scrollToProducts} 
            className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors cursor-pointer"
          >
            Products
          </button>
          <a 
            href="#contact" 
            className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
          >
            Contact Us
          </a>
          <a 
            href="#about" 
            className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
          >
            About Us
          </a>
        </div>

        <div>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-[#0A1628] bg-transparent border-2 border-[#0A1628] rounded-lg hover:bg-[#0A1628] hover:text-white transition-all duration-150 cursor-pointer"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-64px)] px-6 md:px-12 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 gap-12">
        {/* Left */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-6 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">
              Built for Indian Chartered Accountants
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0A1628] leading-[1.1] mb-6">
            The operating <span className="text-emerald-500">system</span> for your CA firm.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
            GST, ITR, TDS, ROC compliance, bank statements, invoices — one secure workspace that understands Indian tax law.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <button
              onClick={scrollToProducts}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToProducts}
              className="px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-[#0A1628] font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              View products
            </button>
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
                href={`/auth?product=${p.product}`}
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

      {/* PRODUCTS SECTION */}
      <section ref={productsRef} id="products" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-3.5 py-1 mb-4 bg-indigo-50 border border-indigo-200 rounded-full">
            <span className="text-xs font-semibold text-indigo-700">Products</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1628] mb-3 tracking-tight">
            Everything your CA firm needs
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Start with what you need today. More compliance modules coming soon.
          </p>
        </div>

        {/* Live products */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Available Now
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Landmark,
                title: "Bank Statement Converter",
                desc: "Upload any PDF bank statement and get a clean, structured Excel file in seconds. Supports 1000+ Indian and international banks.",
                features: [
                  "SBI, HDFC, ICICI, Axis & more",
                  "Multi-page PDFs supported",
                  "Instant Excel download",
                  "Password-protected PDFs",
                ],
                color: "text-blue-500",
                buttonBg: "bg-blue-500 hover:bg-blue-600",
                iconBg: "bg-blue-50",
                product: "bank",
              },
              {
                icon: ReceiptText,
                title: "Tax Invoice Converter",
                desc: "Extract line items, GSTIN, tax amounts from scanned or digital invoices and export to structured Excel for GST reconciliation.",
                features: [
                  "GST invoice parsing",
                  "CGST/SGST/IGST split",
                  "Batch processing",
                  "Excel / CSV export",
                ],
                color: "text-emerald-500",
                buttonBg: "bg-emerald-500 hover:bg-emerald-600",
                iconBg: "bg-emerald-50",
                product: "tax",
              },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.title}
                  href={`/auth?product=${p.product}`}
                  className="group relative flex flex-col p-7 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ● Live
                    </span>
                  </div>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${p.iconBg} mb-5`}>
                    <Icon className={`w-6 h-6 ${p.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">{p.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">{p.desc}</p>
                  
                  <div className="flex flex-col gap-2 mb-6 mt-auto">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${p.color}`} />
                        <span className="text-xs font-medium text-slate-700">{f}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`w-full py-2.5 text-center text-white font-bold rounded-lg ${p.buttonBg} flex items-center justify-center gap-1.5 transition-colors`}>
                    Open Product
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming products */}
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Coming Soon
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, title: "ITR Filing", desc: "File all ITR forms for individuals & companies.", color: "text-violet-500" },
              { icon: Receipt, title: "GST Filing", desc: "GSTR-1, GSTR-3B, GSTR-9 for all clients.", color: "text-amber-500" },
              { icon: FileSpreadsheet, title: "TDS Returns", desc: "24Q, 26Q returns and Form 16 generation.", color: "text-red-500" },
              { icon: Building2, title: "ROC / MCA", desc: "AOC-4, MGT-7, DIR-3 KYC filings.", color: "text-teal-500" },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div 
                  key={p.title} 
                  className="p-5 bg-white border border-dashed border-slate-200 rounded-xl opacity-75"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-50 rounded-lg mb-3">
                    <Icon className={`w-5 h-5 ${p.color}`} />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Soon
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
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
                <div className="text-2xl md:text-3xl font-black text-emerald-400 mb-1">
                  {s.num}
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 md:px-12 bg-slate-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#0A1628] mb-3">Get in touch</h2>
          <p className="text-sm text-slate-500 mb-8">
            Have questions or want early access to upcoming products?
          </p>
          <div className="flex flex-col gap-3">
            <input 
              placeholder="Your email address" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!user?.email}
              className={`w-full px-4 py-3 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm bg-white outline-none transition-colors ${user?.email ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
            />
            <textarea 
              placeholder="Your message" 
              rows={4} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm bg-white outline-none resize-none transition-colors"
            />
            <button 
              onClick={handleContactSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-[#0A1628] hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A1628] py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-t border-slate-800 gap-4">
        <div className="flex items-center gap-2">
          <Logo width={28} height={28} className="rounded-md" />
          <span className="text-sm font-bold text-white">Fintecc</span>
        </div>
        <p className="text-xs text-slate-500">
          &copy; 2026 Fintecc. All rights reserved.
        </p>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Security"].map((l) => (
            <a key={l} href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              {l}
            </a>
          ))}
          <a href="#contact" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}


