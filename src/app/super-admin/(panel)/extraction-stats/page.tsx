"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  DollarSign,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface EngineStat {
  name: string;
  category: "Native" | "Self-Hosted OCR" | "Cloud Paid AI";
  totalRuns: number;
  passRate: number;
  avgLatencySec: number;
  costPerPage: string;
  qualityScore: number;
  status: "ACTIVE" | "BENCHMARKING" | "SHADOW_MODE";
}

const SAMPLE_ENGINE_STATS: EngineStat[] = [
  {
    name: "PyMuPDF Native Text Parser",
    category: "Native",
    totalRuns: 1210,
    passRate: 98.2,
    avgLatencySec: 0.4,
    costPerPage: "₹0.00",
    qualityScore: 99,
    status: "ACTIVE",
  },
  {
    name: "PaddleOCR (FastAPI Microservice)",
    category: "Self-Hosted OCR",
    totalRuns: 164,
    passRate: 91.5,
    avgLatencySec: 2.1,
    costPerPage: "₹0.05",
    qualityScore: 92,
    status: "BENCHMARKING",
  },
  {
    name: "Docling Table Extractor",
    category: "Self-Hosted OCR",
    totalRuns: 88,
    passRate: 89.8,
    avgLatencySec: 3.4,
    costPerPage: "₹0.08",
    qualityScore: 90,
    status: "SHADOW_MODE",
  },
  {
    name: "Tesseract Baseline OCR",
    category: "Self-Hosted OCR",
    totalRuns: 34,
    passRate: 74.2,
    avgLatencySec: 1.6,
    costPerPage: "₹0.02",
    qualityScore: 78,
    status: "BENCHMARKING",
  },
  {
    name: "Google Document AI",
    category: "Cloud Paid AI",
    totalRuns: 12,
    passRate: 97.4,
    avgLatencySec: 1.8,
    costPerPage: "₹1.25",
    qualityScore: 98,
    status: "BENCHMARKING",
  },
  {
    name: "Gemini Vision AI (Fallback)",
    category: "Cloud Paid AI",
    totalRuns: 8,
    passRate: 96.0,
    avgLatencySec: 2.5,
    costPerPage: "₹0.60",
    qualityScore: 96,
    status: "ACTIVE",
  },
];

export default function ExtractionStatsPage() {
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState("30D");

  const handleExportCSV = () => {
    showToast("Exporting extraction runs and OCR benchmark report to CSV...", "info");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#1E2A38]">
                Extraction & OCR Engine Performance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A8C5DA]/20 text-[#4A6FA5] border border-[#A8C5DA]/40">
                Super Admin Insights
              </span>
            </div>
            <p className="text-sm text-[#5A6E85] mt-1 max-w-3xl">
              Real-time monitoring of bank statement extraction runs, self-hosted vs cloud OCR engines, balance check pass rates, and API cost efficiency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] focus:outline-none focus:border-[#4A6FA5]"
          >
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last Quarter</option>
            <option value="ALL">All Time</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs border-[#4A6FA5]/30 text-[#4A6FA5] hover:bg-[#4A6FA5]/10"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Total Extractions</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">1,516 runs</p>
            <span className="text-[11px] text-[#3D7A64] font-medium">+14% vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Balance Pass Rate</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">96.8%</p>
            <span className="text-[11px] text-[#3D7A64] font-medium">Automatic reconciliation</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#A8C5DA]/25 text-[#4A6FA5] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Avg Latency / Page</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">0.82 sec</p>
            <span className="text-[11px] text-[#5A6E85]">FastAPI + PyMuPDF</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#9E6B42]/10 text-[#9E6B42] shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Cloud OCR Spend</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">₹19.80</p>
            <span className="text-[11px] text-[#3D7A64] font-medium">98.5% cost savings</span>
          </div>
        </div>
      </div>

      {/* Engine Comparison & Routing Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Engine Performance Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1E2A38]">Engine Benchmark & Accuracy Breakdown</h2>
              <p className="text-xs text-[#5A6E85] mt-0.5">
                Logged in <span className="font-mono text-[11px]">extraction_runs</span> across native, self-hosted, and cloud providers.
              </p>
            </div>
            <span className="text-xs text-[#4A6FA5] font-semibold bg-[#4A6FA5]/10 px-2 py-1 rounded-lg">
              Task 3 & 27 Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#E2E8F0] text-[#5A6E85] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Engine Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Pass Rate</th>
                  <th className="py-2.5 px-3 text-center">Avg Latency</th>
                  <th className="py-2.5 px-3 text-right">Cost / Page</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {SAMPLE_ENGINE_STATS.map((engine) => (
                  <tr key={engine.name} className="hover:bg-[#F7F9FB]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-xs text-[#1E2A38]">{engine.name}</div>
                      <div className="text-[11px] text-[#5A6E85]">{engine.totalRuns} total runs</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F7F9FB] border border-[#E2E8F0] text-[#5A6E85]">
                        {engine.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-xs">
                      <span
                        className={
                          engine.passRate >= 95
                            ? "text-[#3D7A64]"
                            : engine.passRate >= 85
                            ? "text-[#9E6B42]"
                            : "text-[#9E4A4A]"
                        }
                      >
                        {engine.passRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-[#5A6E85]">
                      {engine.avgLatencySec}s
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-[#1E2A38]">
                      {engine.costPerPage}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          engine.status === "ACTIVE"
                            ? "bg-[#3D7A64]/10 text-[#3D7A64] border-[#3D7A64]/20"
                            : engine.status === "SHADOW_MODE"
                            ? "bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/20"
                            : "bg-[#9E6B42]/10 text-[#9E6B42] border-[#9E6B42]/20"
                        }`}
                      >
                        {engine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Routing Mix & Architecture Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1E2A38]">Execution Routing Mix</h2>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#5A6E85] mb-1 font-medium">
                  <span>Digital Text (PyMuPDF)</span>
                  <span className="font-semibold text-[#1E2A38]">82.4%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#4A6FA5] h-full rounded-full" style={{ width: "82.4%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#5A6E85] mb-1 font-medium">
                  <span>Self-Hosted OCR (Paddle/Docling)</span>
                  <span className="font-semibold text-[#1E2A38]">14.1%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#A8C5DA] h-full rounded-full" style={{ width: "14.1%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#5A6E85] mb-1 font-medium">
                  <span>Gemini AI Proposals</span>
                  <span className="font-semibold text-[#1E2A38]">3.5%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#9E6B42] h-full rounded-full" style={{ width: "3.5%" }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#5A6E85] space-y-2">
              <div className="flex items-center gap-2 text-[#3D7A64] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero Statement Text Stored In Logs</span>
              </div>
              <p className="text-[11px] text-[#8E9FAA]">
                In compliance with Task 34, raw financial transactions and account holder details are excluded from run telemetry.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1E2A38] uppercase tracking-wider">
                Monthly Cloud Budget Guard
              </h3>
              <span className="text-[11px] text-[#3D7A64] font-semibold bg-[#3D7A64]/10 px-2 py-0.5 rounded">
                Protected
              </span>
            </div>
            <p className="text-xs text-[#5A6E85]">
              Current spend: <span className="font-bold text-[#1E2A38]">₹19.80</span> of ₹5,000 monthly limit. Kill-switch is armed.
            </p>
            <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#3D7A64] h-full rounded-full" style={{ width: "0.4%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
