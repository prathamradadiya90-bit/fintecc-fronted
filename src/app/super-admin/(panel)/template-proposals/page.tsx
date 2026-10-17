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
  ArrowRight,
  Layers,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetProposalsQuery } from "@/lib/store/api/bankStatementsApi";
import type { ProposalStatus, TemplateProposal } from "@/lib/types/templateProposal.types";

export default function TemplateProposalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "ALL">("ALL");

  const {
    data: proposalsRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProposalsQuery({
    status: statusFilter,
    search: searchQuery.trim() || undefined,
  });

  const proposals: TemplateProposal[] = proposalsRes?.data || [];

  // Summary counts
  const pendingCount = proposals.filter((p) => p.status === "PENDING").length;
  const approvedCount = proposals.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = proposals.filter((p) => p.status === "REJECTED").length;
  const totalVolume = proposals.reduce((acc, p) => acc + (p.matchCount || 1), 0);

  const getStatusBadge = (status: ProposalStatus) => {
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
      default:
        return null;
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
                AI + Super Admin Verification
              </span>
            </div>
            <p className="text-sm text-[#5A6E85] mt-1 max-w-3xl">
              When an unrecognized bank layout is uploaded, Gemini Vision proposes column positions once.
              Super Admins verify or adjust layout boundaries here. Once approved, the template is saved to
              PostgreSQL for all firms without requiring code redeployment.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />}
          className="text-xs shrink-0 self-start md:self-center"
        >
          Refresh
        </Button>
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
            <p className="text-sm font-medium text-[#5A6E85]">Needs Review</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">{pendingCount} pending</p>
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
            <p className="text-sm font-medium text-[#5A6E85]">Total Seen Volume</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">{totalVolume} encounters</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#9E4A4A]/10 text-[#9E4A4A] shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5A6E85]">Rejected Formats</p>
            <p className="text-xl font-bold text-[#1E2A38] mt-0.5">{rejectedCount} formats</p>
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
            className="w-full text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] placeholder-[#8E9FAA] focus:outline-hidden focus:border-[#4A6FA5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#8E9FAA] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | "ALL")}
            className="text-sm px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] focus:outline-hidden focus:border-[#4A6FA5] cursor-pointer w-full sm:w-48"
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
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-sm text-[#5A6E85]">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A6FA5]" />
            <span>Loading template proposals from database...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-[#9E4A4A] p-6 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-[#9E4A4A]" />
            <p className="font-semibold">Failed to fetch template proposals</p>
            <p className="text-xs text-[#5A6E85]">
              {(error as any)?.data?.message || "Please make sure you are logged in as Super Admin."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs mt-2">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#E2E8F0] text-xs font-semibold text-[#5A6E85] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Bank & Layout Variant</th>
                  <th className="py-3.5 px-4">Fingerprint Hash</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Times Seen</th>
                  <th className="py-3.5 px-4 text-center">First Seen</th>
                  <th className="py-3.5 px-4">Detected Columns</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#8E9FAA]">
                      No template proposals match the selected filters.
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal) => {
                    const columns =
                      proposal.proposedTemplate?.layout?.columns?.map((c) => c.name) ||
                      proposal.fingerprint?.headerWords ||
                      [];

                    return (
                      <tr key={proposal.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                        {/* Bank & Variant */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#1E2A38]">
                            {proposal.bankName || proposal.bankCode || "Unrecognized Bank"}
                          </div>
                          <div className="text-xs text-[#5A6E85] mt-0.5">
                            {proposal.proposedTemplate?.name ||
                              `${proposal.bankCode || "Custom"} Layout Variant`}
                          </div>
                        </td>

                        {/* Fingerprint */}
                        <td className="py-4 px-4 font-mono text-xs text-[#5A6E85]">
                          <span
                            className="bg-[#F7F9FB] px-2 py-1 rounded border border-[#E2E8F0]"
                            title={proposal.fingerprintHash}
                          >
                            {proposal.fingerprintHash
                              ? `${proposal.fingerprintHash.substring(0, 14)}...`
                              : "N/A"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(proposal.status)}
                        </td>

                        {/* Times Seen */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5]">
                            {proposal.matchCount || 1}x
                          </span>
                        </td>

                        {/* First Seen */}
                        <td className="py-4 px-4 text-center text-xs text-[#5A6E85]">
                          {proposal.firstSeenAt
                            ? new Date(proposal.firstSeenAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Detected Columns */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {columns.slice(0, 3).map((col, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-[#F7F9FB] border border-[#E2E8F0] text-[#5A6E85] px-1.5 py-0.5 rounded"
                              >
                                {col}
                              </span>
                            ))}
                            {columns.length > 3 && (
                              <span className="text-[11px] text-[#8E9FAA] self-center">
                                +{columns.length - 3} more
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
