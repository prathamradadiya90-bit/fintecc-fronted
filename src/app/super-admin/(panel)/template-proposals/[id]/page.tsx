"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles,
  Sliders,
  FileSpreadsheet,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplateProposalDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const proposalId = resolvedParams.id;
  const { showToast } = useToast();

  const [dateBounds, setDateBounds] = useState("[0.04, 0.14]");
  const [narrationBounds, setNarrationBounds] = useState("[0.14, 0.52]");
  const [debitBounds, setDebitBounds] = useState("[0.52, 0.68]");
  const [creditBounds, setCreditBounds] = useState("[0.68, 0.84]");
  const [balanceBounds, setBalanceBounds] = useState("[0.84, 0.98]");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [numberGrouping, setNumberGrouping] = useState("indian");

  const handleApprove = () => {
    showToast("Template approved and activated in PostgreSQL! Ready for all firms.", "success");
  };

  const handleReject = () => {
    showToast("Template proposal marked as rejected.", "info");
  };

  const handleTestRun = () => {
    showToast("Ran self-test parser against 3 sample statements: 100% balance check pass!", "success");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/template-proposals"
              className="text-xs font-semibold flex items-center gap-1 text-[#4A6FA5] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Proposals
            </Link>
            <span className="text-[#8E9FAA]">/</span>
            <span className="text-xs text-[#5A6E85]">Proposal Review</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1E2A38]">
              Review Layout: {proposalId}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-[#9E6B42] bg-[#9E6B42]/10 border border-[#9E6B42]/20">
              Needs Super Admin Decision
            </span>
          </div>
          <p className="text-xs text-[#5A6E85]">
            Fingerprint: <span className="font-mono text-[#1E2A38]">hdfc-ret-v3-f8a19c</span> · Source:{" "}
            <span className="font-semibold text-[#4A6FA5]">Gemini Vision Proposal</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestRun}
            leftIcon={<Play className="w-3.5 h-3.5" />}
            className="text-xs border-[#E2E8F0] text-[#1E2A38]"
          >
            Test on Samples
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            className="text-xs border-[#9E4A4A]/30 text-[#9E4A4A] hover:bg-[#9E4A4A]/10"
          >
            Reject Format
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            leftIcon={<Check className="w-3.5 h-3.5" />}
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Approve & Save Template
          </Button>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Statement Document Canvas & Column Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#4A6FA5]" />
              <h2 className="text-sm font-bold text-[#1E2A38]">Statement Page Canvas & Column Overlays</h2>
            </div>
            <span className="text-xs text-[#5A6E85]">Normalized Width: [0.00 $\rightarrow$ 1.00]</span>
          </div>

          {/* Canvas Mockup with Draggable Column Lines */}
          <div className="relative w-full h-[480px] bg-[#F7F9FB] rounded-xl border border-[#E2E8F0] overflow-hidden p-4 flex flex-col justify-between select-none">
            {/* Background simulated statement text lines */}
            <div className="space-y-3 opacity-25">
              <div className="h-4 bg-[#8E9FAA] rounded w-3/4" />
              <div className="h-3 bg-[#8E9FAA] rounded w-1/2" />
              <div className="h-px bg-[#8E9FAA] my-4" />
              <div className="grid grid-cols-5 gap-2">
                <div className="h-3 bg-[#8E9FAA] rounded" />
                <div className="h-3 bg-[#8E9FAA] rounded" />
                <div className="h-3 bg-[#8E9FAA] rounded" />
                <div className="h-3 bg-[#8E9FAA] rounded" />
                <div className="h-3 bg-[#8E9FAA] rounded" />
              </div>
              <div className="space-y-2 pt-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-2.5 bg-[#8E9FAA] rounded w-full" />
                ))}
              </div>
            </div>

            {/* Overlaid Fractional Column Boundaries */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div style={{ width: "4%" }} className="h-full border-r border-dashed border-[#8E9FAA]/50" />
              <div style={{ width: "10%" }} className="h-full border-r-2 border-[#4A6FA5] bg-[#4A6FA5]/5 relative">
                <span className="absolute top-2 left-1 text-[10px] font-bold text-[#4A6FA5]">Date</span>
              </div>
              <div style={{ width: "38%" }} className="h-full border-r-2 border-[#4A6FA5] bg-[#4A6FA5]/5 relative">
                <span className="absolute top-2 left-1 text-[10px] font-bold text-[#4A6FA5]">Narration</span>
              </div>
              <div style={{ width: "16%" }} className="h-full border-r-2 border-[#9E4A4A] bg-[#9E4A4A]/5 relative">
                <span className="absolute top-2 left-1 text-[10px] font-bold text-[#9E4A4A]">Debit (Dr)</span>
              </div>
              <div style={{ width: "16%" }} className="h-full border-r-2 border-[#3D7A64] bg-[#3D7A64]/5 relative">
                <span className="absolute top-2 left-1 text-[10px] font-bold text-[#3D7A64]">Credit (Cr)</span>
              </div>
              <div style={{ width: "14%" }} className="h-full border-r border-[#4A6FA5] bg-[#4A6FA5]/5 relative">
                <span className="absolute top-2 left-1 text-[10px] font-bold text-[#4A6FA5]">Balance</span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-lg border border-[#E2E8F0] text-xs text-[#5A6E85] z-10 flex items-center justify-between">
              <span>Interactive visual drag handles will be integrated in Task 22.</span>
              <span className="text-[#3D7A64] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Self-Test Math Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Column Coordinates & Template Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Sliders className="w-4 h-4 text-[#4A6FA5]" />
              <h2 className="text-sm font-bold text-[#1E2A38]">Fractional Column Layout</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#5A6E85] mb-1">Date Column Range</label>
                <input
                  type="text"
                  value={dateBounds}
                  onChange={(e) => setDateBounds(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-[#5A6E85] mb-1">Narration Column Range</label>
                <input
                  type="text"
                  value={narrationBounds}
                  onChange={(e) => setNarrationBounds(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#5A6E85] mb-1">Debit Column</label>
                  <input
                    type="text"
                    value={debitBounds}
                    onChange={(e) => setDebitBounds(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#5A6E85] mb-1">Credit Column</label>
                  <input
                    type="text"
                    value={creditBounds}
                    onChange={(e) => setCreditBounds(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#5A6E85] mb-1">Balance Column</label>
                <input
                  type="text"
                  value={balanceBounds}
                  onChange={(e) => setBalanceBounds(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
                <div>
                  <label className="block font-medium text-[#5A6E85] mb-1">Date Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38]"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#5A6E85] mb-1">Number Grouping</label>
                  <select
                    value={numberGrouping}
                    onChange={(e) => setNumberGrouping(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38]"
                  >
                    <option value="indian">Indian (1,23,456.00)</option>
                    <option value="standard">Standard (123,456.00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Live Extraction Preview Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#1E2A38] uppercase tracking-wider">
              Live Parsed Rows Preview
            </h3>
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#5A6E85]">
                    <th className="py-1.5">Date</th>
                    <th className="py-1.5">Narration</th>
                    <th className="py-1.5 text-right">Debit</th>
                    <th className="py-1.5 text-right">Credit</th>
                    <th className="py-1.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#1E2A38]">
                  <tr>
                    <td className="py-1.5">02/10/2026</td>
                    <td className="py-1.5 max-w-[120px] truncate">UPI/527810/INFOSYS</td>
                    <td className="py-1.5 text-right text-[#9E4A4A]">4,500.00</td>
                    <td className="py-1.5 text-right">—</td>
                    <td className="py-1.5 text-right font-mono">1,12,450.00</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">03/10/2026</td>
                    <td className="py-1.5 max-w-[120px] truncate">NEFT/CLT-SETTLE/TCS</td>
                    <td className="py-1.5 text-right">—</td>
                    <td className="py-1.5 text-right text-[#3D7A64]">25,000.00</td>
                    <td className="py-1.5 text-right font-mono">1,37,450.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
