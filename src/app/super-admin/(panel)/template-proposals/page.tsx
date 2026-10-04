"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  Layers,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProposalItem {
  id: string;
  fingerprint: string;
  bankGuess: string;
  formatVariant: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  timesSeen: number;
  selfTestPassed: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  detectedColumns: string[];
}

const SAMPLE_PROPOSALS: ProposalItem[] = [
  {
    id: "prop-hdfc-01",
    fingerprint: "hdfc-ret-v3-f8a19c",
    bankGuess: "HDFC Bank",
    formatVariant: "Retail NetBanking e-Statement (2026 Layout)",
    status: "PENDING",
    timesSeen: 18,
    selfTestPassed: true,
    firstSeenAt: "2026-10-02T10:30:00Z",
    lastSeenAt: "2026-10-04T09:15:00Z",
    detectedColumns: ["Date", "Narration", "Chq/Ref No", "Withdrawal (Dr)", "Deposit (Cr)", "Closing Balance"],
  },
  {
    id: "prop-sbi-02",
    fingerprint: "sbi-corp-v1-4b72e1",
    bankGuess: "State Bank of India",
    formatVariant: "Corporate Current Account Statement",
    status: "PENDING",
    timesSeen: 7,
    selfTestPassed: true,
    firstSeenAt: "2026-10-03T14:20:00Z",
    lastSeenAt: "2026-10-04T11:45:00Z",
    detectedColumns: ["Txn Date", "Value Date", "Description", "Ref No", "Debit", "Credit", "Balance"],
  },
  {
    id: "prop-icici-03",
    fingerprint: "icici-ca-v2-39c80d",
    bankGuess: "ICICI Bank",
    formatVariant: "Business Current Account Statement",
    status: "APPROVED",
    timesSeen: 42,
    selfTestPassed: true,
    firstSeenAt: "2026-09-28T08:10:00Z",
    lastSeenAt: "2026-10-04T12:00:00Z",
    detectedColumns: ["Date", "Particulars", "Cheque No", "Withdrawals", "Deposits", "Auto-Sweep Balance"],
  },
  {
    id: "prop-kotak-04",
    fingerprint: "kotak-811-v1-77e40a",
    bankGuess: "Kotak Mahindra Bank",
    formatVariant: "811 Digital Savings Statement",
    status: "REJECTED",
    timesSeen: 2,
    selfTestPassed: false,
    firstSeenAt: "2026-09-30T16:05:00Z",
    lastSeenAt: "2026-10-01T11:20:00Z",
    detectedColumns: ["Date", "Transaction Details", "Amount", "Dr/Cr", "Balance"],
  },
];

export default function TemplateProposalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredProposals = SAMPLE_PROPOSALS.filter((p) => {
    const matchesSearch =
      p.bankGuess.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fingerprint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.formatVariant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = SAMPLE_PROPOSALS.filter((p) => p.status === "PENDING").length;
  const approvedCount = SAMPLE_PROPOSALS.filter((p) => p.status === "APPROVED").length;
  const totalVolume = SAMPLE_PROPOSALS.reduce((acc, p) => acc + p.timesSeen, 0);

  const getStatusBadge = (status: ProposalItem["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#3D7A64] bg-[#3D7A64]/10 border border-[#3D7A64]/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3D7A64]" /> Active Template
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#9E6B42] bg-[#9E6B42]/10 border border-[#9E6B42]/20">
            <Clock className="w-3.5 h-3.5 text-[#9E6B42]" /> Needs Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#9E4A4A] bg-[#9E4A4A]/10 border border-[#9E4A4A]/20">
            <XCircle className="w-3.5 h-3.5 text-[#9E4A4A]" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center shrink-0">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#1E2A38]">
                Bank Statement Template Proposals
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A8C5DA]/20 text-[#4A6FA5] border border-[#A8C5DA]/40">
                AI + Human Approval
              </span>
            </div>
            <p className="text-sm text-[#5A6E85] mt-1 max-w-3xl">
              When an unrecognized bank layout is uploaded, Gemini AI proposes column positions once.
              Super Admins verify or adjust layout boundaries here. Once approved, the template is saved to
              PostgreSQL for all firms without requiring code redeployment.
            </p>
          </div>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-xl bg-[#F7F9FB] border border-[#A8C5DA]/50 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#4A6FA5] shrink-0 mt-0.5" />
        <div className="text-sm text-[#1E2A38]">
          <span className="font-semibold text-[#1E2A38]">Deduplication & Provisional Parsing: </span>
          Multiple client uploads with identical column fingerprints increment the{" "}
          <span className="font-mono text-xs font-semibold bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
            times_seen
          </span>{" "}
          counter without generating duplicate requests. Pending proposals are provisionally applied with full balance validation.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#9E6B42]/10 text-[#9E6B42] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Pending Proposals</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">{pendingCount} formats</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Active Templates</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">{approvedCount} approved</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Statements Handled</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">{totalVolume} uploads</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#A8C5DA]/25 text-[#4A6FA5] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">AI Self-Test Rate</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">75% first-pass</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9FAA]" />
          <input
            type="text"
            placeholder="Search bank name or layout fingerprint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] placeholder-[#8E9FAA] focus:outline-none focus:border-[#4A6FA5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#8E9FAA] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] focus:outline-none focus:border-[#4A6FA5] cursor-pointer w-full sm:w-48"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Active (Approved)</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Proposals List Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#E2E8F0] text-xs font-semibold text-[#5A6E85] uppercase tracking-wider">
                <th className="py-3.5 px-4">Bank & Layout Variant</th>
                <th className="py-3.5 px-4">Fingerprint</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Times Seen</th>
                <th className="py-3.5 px-4 text-center">Self-Test</th>
                <th className="py-3.5 px-4">Detected Columns</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#8E9FAA]">
                    No template proposals match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                    {/* Bank & Variant */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#1E2A38]">{proposal.bankGuess}</div>
                      <div className="text-xs text-[#5A6E85] mt-0.5">{proposal.formatVariant}</div>
                    </td>

                    {/* Fingerprint */}
                    <td className="py-4 px-4 font-mono text-xs text-[#5A6E85]">
                      <span className="bg-[#F7F9FB] px-2 py-1 rounded border border-[#E2E8F0]">
                        {proposal.fingerprint}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(proposal.status)}
                    </td>

                    {/* Times Seen */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5]">
                        {proposal.timesSeen}x
                      </span>
                    </td>

                    {/* Self-Test */}
                    <td className="py-4 px-4 text-center">
                      {proposal.selfTestPassed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3D7A64]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9E4A4A]">
                          <AlertCircle className="w-3.5 h-3.5" /> Math Diff
                        </span>
                      )}
                    </td>

                    {/* Detected Columns */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proposal.detectedColumns.slice(0, 3).map((col, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-[#F7F9FB] border border-[#E2E8F0] text-[#5A6E85] px-1.5 py-0.5 rounded"
                          >
                            {col}
                          </span>
                        ))}
                        {proposal.detectedColumns.length > 3 && (
                          <span className="text-[11px] text-[#8E9FAA] self-center">
                            +{proposal.detectedColumns.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-4 text-right">
                      <Link href={`/super-admin/template-proposals/${proposal.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          className="text-xs font-medium border-[#4A6FA5]/30 text-[#4A6FA5] hover:bg-[#4A6FA5]/10"
                        >
                          Review Layout
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
