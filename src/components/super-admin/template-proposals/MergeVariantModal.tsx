"use client";

import React, { useState } from "react";
import { X, GitMerge, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useGetActiveTemplatesQuery,
  useMergeProposalAsVariantMutation,
} from "@/lib/store/api/bankStatementsApi";
import { useToast } from "@/components/ui/Toast";

interface MergeVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  bankCode?: string | null;
  bankName?: string | null;
  proposedName?: string | null;
  onSuccess?: () => void;
}

export default function MergeVariantModal({
  isOpen,
  onClose,
  proposalId,
  bankCode,
  bankName,
  proposedName,
  onSuccess,
}: MergeVariantModalProps) {
  const { data: templatesRes, isLoading: loadingTemplates } = useGetActiveTemplatesQuery();
  const [mergeAsVariant, { isLoading }] = useMergeProposalAsVariantMutation();
  const { showToast } = useToast();

  const [targetTemplateId, setTargetTemplateId] = useState<string>("");
  const [variantName, setVariantName] = useState<string>(
    proposedName ? `${proposedName} (Variant)` : ""
  );
  const [priority, setPriority] = useState<number>(12);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeTemplates = templatesRes?.data || [];

  // Sort or preselect matching bank templates
  const filteredTemplates = bankCode
    ? activeTemplates.filter(
        (t) => t.bankCode?.toUpperCase() === bankCode?.toUpperCase()
      )
    : activeTemplates;

  const displayTemplates = filteredTemplates.length > 0 ? filteredTemplates : activeTemplates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTemplateId) {
      setError("Please select a target active template to merge under.");
      return;
    }

    try {
      await mergeAsVariant({
        id: proposalId,
        payload: {
          targetTemplateId,
          variantName: variantName.trim() || undefined,
          priority: Number(priority) || 12,
        },
      }).unwrap();

      showToast("Template proposal merged as active variant successfully!", "success");
      setError(null);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to merge template proposal as variant.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F7F9FB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E2A38]">Merge Proposal as Variant</h3>
              <p className="text-xs text-[#5A6E85]">
                {bankName || "Unknown Bank"} ({bankCode || "N/A"})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E9FAA] hover:text-[#1E2A38] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#5A6E85] leading-relaxed">
            Merging attaches this layout specification as a secondary variant under an existing official
            template. If the primary layout match score is lower, the engine falls back to this variant.
          </p>

          {/* Target Template Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E2A38]">
              Target Official Template <span className="text-[#9E4A4A]">*</span>
            </label>
            {loadingTemplates ? (
              <div className="flex items-center gap-2 text-xs text-[#5A6E85] py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4A6FA5]" /> Loading templates...
              </div>
            ) : (
              <select
                value={targetTemplateId}
                onChange={(e) => {
                  setTargetTemplateId(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
              >
                <option value="">-- Select Active Template --</option>
                {displayTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.bankName || t.bankCode}) - v{t.version}
                  </option>
                ))}
              </select>
            )}
            {displayTemplates.length === 0 && !loadingTemplates && (
              <p className="text-[11px] text-[#9E6B42]">
                No templates found for bank code {bankCode}. Showing all templates instead.
              </p>
            )}
          </div>

          {/* Variant Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E2A38]">
              Variant Display Name (Optional)
            </label>
            <input
              type="text"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="e.g. NetBanking e-Statement (2026 Layout)"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E2A38]">
              Matcher Priority
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10) || 12)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
            />
            <p className="text-[10px] text-[#8E9FAA]">
              Default is 12. Higher priority variants are evaluated first.
            </p>
          </div>

          {error && <p className="text-xs font-medium text-[#9E4A4A]">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !targetTemplateId}
              className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Merging...
                </>
              ) : (
                "Confirm & Merge Variant"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
