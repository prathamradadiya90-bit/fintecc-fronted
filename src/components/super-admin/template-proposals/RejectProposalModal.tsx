"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRejectProposalMutation } from "@/lib/store/api/bankStatementsApi";
import { useToast } from "@/components/ui/Toast";

interface RejectProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  bankName?: string | null;
  onSuccess?: () => void;
}

export default function RejectProposalModal({
  isOpen,
  onClose,
  proposalId,
  bankName,
  onSuccess,
}: RejectProposalModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rejectProposal, { isLoading }] = useRejectProposalMutation();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejecting this template proposal.");
      return;
    }

    try {
      await rejectProposal({ id: proposalId, reason: reason.trim() }).unwrap();
      showToast("Template proposal rejected successfully.", "info");
      setReason("");
      setError(null);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to reject template proposal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F7F9FB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#9E4A4A]/10 text-[#9E4A4A] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E2A38]">Reject Template Proposal</h3>
              <p className="text-xs text-[#5A6E85]">{bankName || "Unrecognized Bank"}</p>
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
            Rejecting this proposal prevents it from being promoted as an active bank template.
            Please explain why this layout proposal was rejected so other admins have context.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E2A38]">
              Rejection Reason <span className="text-[#9E4A4A]">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Scanned image without clear tabular lines, missing balance column, or duplicate of existing HDFC v2 layout..."
              className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent text-[#1E2A38] placeholder:text-[#8E9FAA]"
            />
            {error && <p className="text-xs font-medium text-[#9E4A4A]">{error}</p>}
          </div>

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
              disabled={isLoading || !reason.trim()}
              className="text-xs bg-[#9E4A4A] hover:bg-[#853C3C] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Rejecting...
                </>
              ) : (
                "Reject Proposal"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
