"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  FileSpreadsheet,
  Play,
  RotateCcw,
  Check,
  GitMerge,
  Save,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Search,
  Loader2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  useGetProposalByIdQuery,
  useGetProposalImageQuery,
  useEditProposalMutation,
  useApproveProposalMutation,
  useReopenProposalMutation,
} from "@/lib/store/api/bankStatementsApi";
import ColumnCanvasEditor from "@/components/super-admin/template-proposals/ColumnCanvasEditor";
import RejectProposalModal from "@/components/super-admin/template-proposals/RejectProposalModal";
import MergeVariantModal from "@/components/super-admin/template-proposals/MergeVariantModal";
import TestSampleModal from "@/components/super-admin/template-proposals/TestSampleModal";
import type { LayoutColumn, ProposedTemplate } from "@/lib/types/templateProposal.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const COMMON_COLUMN_NAMES = [
  "date",
  "description",
  "reference",
  "debit",
  "credit",
  "balance",
  "amount",
  "valueDate",
];

export default function TemplateProposalDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const proposalId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  // Queries & Mutations
  const {
    data: proposalRes,
    isLoading,
    error,
    refetch,
  } = useGetProposalByIdQuery(proposalId);

  const { data: imageRes } = useGetProposalImageQuery(proposalId, {
    skip: !proposalId,
  });

  const [editProposal, { isLoading: isSaving }] = useEditProposalMutation();
  const [approveProposal, { isLoading: isApproving }] = useApproveProposalMutation();
  const [reopenProposal, { isLoading: isReopening }] = useReopenProposalMutation();

  // Modal States
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);

  // Form Editor States
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [numberGrouping, setNumberGrouping] = useState<"indian" | "standard">("indian");
  const [detectPatternsText, setDetectPatternsText] = useState("");
  const [columns, setColumns] = useState<LayoutColumn[]>([]);

  const proposal = proposalRes?.data;

  // Initialize form state when proposal data loads
  useEffect(() => {
    if (proposal) {
      setBankName(proposal.bankName || "");
      setBankCode(proposal.bankCode || "");

      const proposed = proposal.proposedTemplate || {};
      setTemplateName(proposed.name || `${proposal.bankName || proposal.bankCode || "Bank"} Statement Template`);
      setDateFormat(proposed.layout?.dateFormat || "DD/MM/YYYY");
      setNumberGrouping(
        (proposed.numberFormat?.grouping as "indian" | "standard") || "indian"
      );

      const patterns = proposed.detectPatterns || [proposal.bankName || proposal.bankCode || ""];
      setDetectPatternsText(patterns.filter(Boolean).join(", "));

      // Parse layout columns
      if (proposed.layout?.columns && proposed.layout.columns.length > 0) {
        setColumns(proposed.layout.columns);
      } else if (proposal.fingerprint?.headerWords) {
        // Fallback: build default columns from header words
        const words = proposal.fingerprint.headerWords;
        const count = words.length;
        const fallbackCols: LayoutColumn[] = words.map((w, i) => {
          const lower = w.toLowerCase();
          let name = `col_${i + 1}`;
          if (lower.includes("date")) name = "date";
          else if (lower.includes("narration") || lower.includes("particular") || lower.includes("desc"))
            name = "description";
          else if (lower.includes("chq") || lower.includes("ref")) name = "reference";
          else if (lower.includes("dr") || lower.includes("withdr")) name = "debit";
          else if (lower.includes("cr") || lower.includes("dep")) name = "credit";
          else if (lower.includes("bal")) name = "balance";

          return {
            name,
            headerWords: [w],
            xStart: Number((i / count).toFixed(3)),
            xEnd: Number(((i + 1) / count).toFixed(3)),
            required: name === "date",
            alignment: ["debit", "credit", "balance", "amount"].includes(name) ? "right" : "left",
          };
        });
        setColumns(fallbackCols);
      }
    }
  }, [proposal]);

  // Construct current overrides bundle
  const getCurrentOverrides = (): Partial<ProposedTemplate> => {
    const patterns = detectPatternsText
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    return {
      name: templateName,
      bankCode: bankCode.trim().toUpperCase() || undefined,
      bankName: bankName.trim() || undefined,
      detectPatterns: patterns,
      layout: {
        columns,
        dateFormat,
      },
      numberFormat: {
        decimal: ".",
        thousand: ",",
        grouping: numberGrouping,
      },
    };
  };

  // Handle Save Draft
  const handleSaveDraft = async () => {
    try {
      const overrides = getCurrentOverrides();
      await editProposal({
        id: proposalId,
        data: {
          bankName: bankName.trim(),
          bankCode: bankCode.trim().toUpperCase(),
          proposedTemplate: overrides,
          layout: overrides.layout,
        },
      }).unwrap();

      showToast("Proposal draft layout saved successfully.", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to save draft.", "error");
    }
  };

  // Handle Approve and Promote
  const handleApprove = async () => {
    try {
      const overrides = getCurrentOverrides();
      await approveProposal({
        id: proposalId,
        overrides,
      }).unwrap();

      showToast("Template approved and activated into PostgreSQL for all firms!", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to approve template.", "error");
    }
  };

  // Handle Reopen
  const handleReopen = async () => {
    try {
      await reopenProposal({ id: proposalId }).unwrap();
      showToast("Proposal reopened back to PENDING review status.", "info");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to reopen proposal.", "error");
    }
  };

  // Column manipulation helpers
  const handleAddColumn = () => {
    const newIdx = columns.length;
    const newCol: LayoutColumn = {
      name: `custom_col_${newIdx + 1}`,
      headerWords: [`Column ${newIdx + 1}`],
      xStart: 0.85,
      xEnd: 0.98,
      alignment: "left",
      required: false,
    };
    setColumns([...columns, newCol]);
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const handleUpdateColumn = (idx: number, patch: Partial<LayoutColumn>) => {
    const updated = [...columns];
    updated[idx] = { ...updated[idx], ...patch };
    setColumns(updated);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-24 flex flex-col items-center justify-center gap-3 text-sm text-[#5A6E85]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A6FA5]" />
        <span>Loading template proposal details...</span>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#9E4A4A] mx-auto" />
        <h2 className="text-lg font-bold text-[#1E2A38]">Proposal Not Found</h2>
        <p className="text-sm text-[#5A6E85]">
          {(error as any)?.data?.message || "The requested template proposal does not exist or access is restricted."}
        </p>
        <Link href="/super-admin/template-proposals">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Proposals
          </Button>
        </Link>
      </div>
    );
  }

  const isApproved = proposal.status === "APPROVED";
  const isRejected = proposal.status === "REJECTED";
  const isPending = proposal.status === "PENDING";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/template-proposals"
              className="text-xs font-semibold flex items-center gap-1 text-[#4A6FA5] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Proposals
            </Link>
            <span className="text-[#8E9FAA]">/</span>
            <span className="text-xs text-[#5A6E85]">Proposal Review & Calibration</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#1E2A38]">
              {bankName || proposal.bankCode || "Unrecognized Bank"}: {templateName}
            </h1>
            {isPending && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#9E6B42] bg-[#9E6B42]/10 border border-[#9E6B42]/20">
                Needs Super Admin Decision
              </span>
            )}
            {isApproved && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#3D7A64] bg-[#3D7A64]/10 border border-[#3D7A64]/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Template
              </span>
            )}
            {isRejected && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#9E4A4A] bg-[#9E4A4A]/10 border border-[#9E4A4A]/20 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Rejected Format
              </span>
            )}
          </div>

          <p className="text-xs text-[#5A6E85]">
            Fingerprint Hash:{" "}
            <span className="font-mono text-[#1E2A38] bg-slate-100 px-1.5 py-0.5 rounded">
              {proposal.fingerprintHash}
            </span>{" "}
            · Seen <span className="font-semibold text-[#4A6FA5]">{proposal.matchCount} times</span> across firms
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTestOpen(true)}
            leftIcon={<Play className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Test on Samples
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>

          {isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMergeOpen(true)}
                leftIcon={<GitMerge className="w-3.5 h-3.5" />}
                className="text-xs border-[#4A6FA5]/40 text-[#4A6FA5] hover:bg-[#4A6FA5]/10"
              >
                Merge as Variant
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectOpen(true)}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                className="text-xs border-[#9E4A4A]/30 text-[#9E4A4A] hover:bg-[#9E4A4A]/10"
              >
                Reject
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={isApproving}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
              >
                {isApproving ? "Promoting..." : "Approve & Promote"}
              </Button>
            </>
          )}

          {(isApproved || isRejected) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReopen}
              disabled={isReopening}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-[#9E6B42] border-[#9E6B42]/30 hover:bg-[#9E6B42]/10"
            >
              {isReopening ? "Reopening..." : "Reopen Review"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Split-View: Left Canvas, Right Form Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Column Canvas Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <ColumnCanvasEditor
            columns={columns}
            onChange={(newCols) => setColumns(newCols)}
            imageUrl={proposal.pageImageUrl || imageRes?.data?.pageImageUrl}
            imageBase64={proposal.pageImageBase64 || imageRes?.data?.pageImageBase64}
            sampleText={proposal.sampleText}
            bankName={bankName}
            isRestricted={proposal.samplesAccessRestricted}
          />

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-[#4A6FA5] shrink-0 mt-0.5" />
            <div className="text-xs text-[#5A6E85] leading-relaxed">
              <span className="font-semibold text-[#1E2A38]">Column Alignment Guidelines: </span>
              Drag boundary handles on the canvas above to tightly hug each table column. Numeric amount
              columns (<span className="font-mono text-[#1E2A38]">debit</span>,{" "}
              <span className="font-mono text-[#1E2A38]">credit</span>,{" "}
              <span className="font-mono text-[#1E2A38]">balance</span>) should use right alignment. Date
              and narration use left alignment.
            </div>
          </div>
        </div>

        {/* Right Column: Editable Template Rules & Column Fields */}
        <div className="lg:col-span-5 space-y-5">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
              <Sliders className="w-4 h-4 text-[#4A6FA5]" />
              <h3 className="text-sm font-bold text-[#1E2A38]">Template Specifications</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#1E2A38] block mb-1">
                  Template Display Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1E2A38] block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1E2A38] block mb-1">Bank Code</label>
                  <input
                    type="text"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC"
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1E2A38] block mb-1">
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    <option value="DD/MM/YY">DD/MM/YY</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#1E2A38] block mb-1">
                    Number Grouping
                  </label>
                  <select
                    value={numberGrouping}
                    onChange={(e) =>
                      setNumberGrouping(e.target.value as "indian" | "standard")
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
                  >
                    <option value="indian">Indian (1,00,000.00)</option>
                    <option value="standard">International (100,000.00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1E2A38] block mb-1">
                  Detect Patterns (Comma-separated)
                </label>
                <input
                  type="text"
                  value={detectPatternsText}
                  onChange={(e) => setDetectPatternsText(e.target.value)}
                  placeholder="e.g. HDFC BANK, RTGS / NEFT, NetBanking"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
                />
                <p className="text-[10px] text-[#8E9FAA] mt-1">
                  Identifiers that confirm this statement belongs to this bank format.
                </p>
              </div>
            </div>
          </div>

          {/* Column Breakdown Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#4A6FA5]" />
                <h3 className="text-sm font-bold text-[#1E2A38]">
                  Column Bounds ({columns.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs h-7 px-2"
              >
                Add Column
              </Button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] hover:border-[#4A6FA5]/40 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-bold text-[#4A6FA5] text-xs w-4">
                        {idx + 1}.
                      </span>
                      <select
                        value={col.name}
                        onChange={(e) => handleUpdateColumn(idx, { name: e.target.value })}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white font-semibold text-[#1E2A38] text-xs flex-1"
                      >
                        {COMMON_COLUMN_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name.toUpperCase()}
                          </option>
                        ))}
                        {!COMMON_COLUMN_NAMES.includes(col.name) && (
                          <option value={col.name}>{col.name.toUpperCase()}</option>
                        )}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={col.alignment || "left"}
                        onChange={(e) =>
                          handleUpdateColumn(idx, {
                            alignment: e.target.value as "left" | "right",
                          })
                        }
                        className="p-1 rounded border border-[#E2E8F0] bg-white text-[11px] text-[#5A6E85]"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(idx)}
                        className="p-1 text-[#8E9FAA] hover:text-[#9E4A4A] rounded hover:bg-white transition-colors"
                        title="Delete column"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Manual Coordinates */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-[#8E9FAA]">xStart: </span>
                      <input
                        type="number"
                        step="0.005"
                        min="0"
                        max="1"
                        value={col.xStart ?? 0}
                        onChange={(e) =>
                          handleUpdateColumn(idx, {
                            xStart: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 p-1 rounded border border-[#E2E8F0] bg-white text-[#1E2A38]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8E9FAA]">xEnd: </span>
                      <input
                        type="number"
                        step="0.005"
                        min="0"
                        max="1"
                        value={col.xEnd ?? 1}
                        onChange={(e) =>
                          handleUpdateColumn(idx, {
                            xEnd: parseFloat(e.target.value) || 1,
                          })
                        }
                        className="w-16 p-1 rounded border border-[#E2E8F0] bg-white text-[#1E2A38]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <RejectProposalModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        proposalId={proposalId}
        bankName={bankName}
        onSuccess={() => {
          refetch();
          router.push("/super-admin/template-proposals");
        }}
      />

      <MergeVariantModal
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        proposalId={proposalId}
        bankCode={bankCode}
        bankName={bankName}
        proposedName={templateName}
        onSuccess={() => {
          refetch();
        }}
      />

      <TestSampleModal
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        proposalId={proposalId}
        defaultSampleText={proposal.sampleText}
        currentOverrides={getCurrentOverrides()}
      />
    </div>
  );
}
