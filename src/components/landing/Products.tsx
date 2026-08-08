import React from "react";
import Link from "next/link";
import { 
  Landmark, 
  ReceiptText, 
  ArrowRight, 
  Check, 
  FileText, 
  Receipt, 
  FileSpreadsheet, 
  Building2 
} from "lucide-react";

export function Products() {
  return (
    <section id="products" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center px-3.5 py-1 mb-4 bg-indigo-50 border border-indigo-200 rounded-full">
          <span className="text-xs font-semibold text-indigo-700">Products</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1628] mb-3 tracking-tight">
          Everything your CA firm needs
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
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
                href={`/dashboard/converters?type=${p.product}`}
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
                <p className="text-xs text-slate-500 leading-relaxed mb-5">{p.desc}</p>
                
                <div className="flex flex-col gap-2 mb-6 mt-auto">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${p.color}`} />
                      <span className="text-xs font-medium text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
                
                <div className={`w-full py-2.5 text-center text-white font-bold rounded-lg ${p.buttonBg} flex items-center justify-center gap-1.5 transition-colors text-sm`}>
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
  );
}
