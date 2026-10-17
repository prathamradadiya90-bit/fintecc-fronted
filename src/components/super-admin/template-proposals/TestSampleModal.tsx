"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Table,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTestProposalMutation } from "@/lib/store/api/bankStatementsApi";
import type { TestProposalReport } from "@/lib/types/templateProposal.types";

interface TestSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  defaultSampleText?: string | null;
  currentOverrides?: any;
}

export default function TestSampleModal({
  isOpen,
  onClose,
  proposalId,
  defaultSampleText,
  currentOverrides,
}: TestSampleModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "text">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleText, setSampleText] = useState<string>(defaultSampleText || "");
  const [testResult, setTestResult] = useState<TestProposalReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [testProposal, { isLoading }] = useTestProposalMutation();

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setErrorMessage(null);
    setTestResult(null);

    try {
      if (activeTab === "file") {
        if (!selectedFile) {
          setErrorMessage("Please select a sample PDF file to test.");
          return;
        }

        const formData = new FormData();
        formData.append("statement", selectedFile);
        if (currentOverrides) {
          formData.append("templateOverrides", JSON.stringify(currentOverrides));
        }

        const res = await testProposal({
          id: proposalId,
          body: formData,
        }).unwrap();

        setTestResult(res.data);
      } else {
        const payload: {
          sampleText?: string;
          templateOverrides?: any;
        } = {
          sampleText: sampleText.trim() || undefined,
          templateOverrides: currentOverrides,
        };

        const res = await testProposal({
          id: proposalId,
          body: payload,
        }).unwrap();

        setTestResult(res.data);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Dry-run test failed to execute."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F7F9FB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E2A38]">
                Dry-Run Test on Statement Samples
              </h3>
              <p className="text-xs text-[#5A6E85]">
                Evaluate column boundaries and regex rules against sample statements
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

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-[#E2E8F0] flex gap-4 bg-white text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "text"
                ? "border-[#4A6FA5] text-[#4A6FA5]"
                : "border-transparent text-[#5A6E85] hover:text-[#1E2A38]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Sample Text Snippet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "file"
                ? "border-[#4A6FA5] text-[#4A6FA5]"
                : "border-transparent text-[#5A6E85] hover:text-[#1E2A38]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload Test PDF
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "text" ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E2A38] flex justify-between items-center">
                <span>Sample Statement Text Rows:</span>
                <span className="text-[11px] font-normal text-[#5A6E85]">
                  Extracted from first page or paste test lines
                </span>
              </label>
              <textarea
                rows={5}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="01/10/2026 SALARY CREDIT 0.00 45000.00 78200.50&#10;03/10/2026 UPI/RENT/PAYTM 12000.00 0.00 66200.50"
                className="w-full text-xs font-mono p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4A6FA5] text-[#1E2A38]"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#1E2A38]">
                Upload PDF Statement to Dry-Run:
              </label>
              <div className="border-2 border-dashed border-[#A8C5DA] rounded-xl p-6 text-center hover:bg-[#F7F9FB] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-[#4A6FA5] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#1E2A38]">
                  {selectedFile ? selectedFile.name : "Click to select or drag & drop a PDF sample"}
                </p>
                <p className="text-[10px] text-[#8E9FAA] mt-1">
                  File will be temporarily evaluated in-memory and automatically cleaned up.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-[#9E4A4A]/10 border border-[#9E4A4A]/30 rounded-xl flex items-center gap-2 text-xs text-[#9E4A4A]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Test Report View */}
          {testResult && (
            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F7F9FB] space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      testResult.matchScore >= 90
                        ? "text-[#3D7A64] bg-[#3D7A64]/10 border border-[#3D7A64]/20"
                        : testResult.matchScore >= 70
                        ? "text-[#9E6B42] bg-[#9E6B42]/10 border border-[#9E6B42]/20"
                        : "text-[#9E4A4A] bg-[#9E4A4A]/10 border border-[#9E4A4A]/20"
                    }`}
                  >
                    Match Score: {testResult.matchScore}%
                  </span>
                  <span className="text-xs text-[#5A6E85]">
                    Extracted {testResult.extractedCount} transactions ({testResult.sourceUsed})
                  </span>
                </div>
                {testResult.validation?.isValid ? (
                  <span className="text-xs font-bold text-[#3D7A64] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balance Reconciled (100% Pass)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#9E6B42] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Balance Discrepancy Found
                  </span>
                )}
              </div>

              {/* Balance Summary Cards */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  <p className="text-[10px] text-[#8E9FAA]">Opening Balance</p>
                  <p className="text-xs font-bold text-[#1E2A38]">
                    ₹{(testResult.validation?.openingBalance ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  <p className="text-[10px] text-[#8E9FAA]">Total Credits</p>
                  <p className="text-xs font-bold text-[#3D7A64]">
                    ₹{(testResult.validation?.totalCredits ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  <p className="text-[10px] text-[#8E9FAA]">Total Debits</p>
                  <p className="text-xs font-bold text-[#9E4A4A]">
                    ₹{(testResult.validation?.totalDebits ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  <p className="text-[10px] text-[#8E9FAA]">Closing Balance</p>
                  <p className="text-xs font-bold text-[#1E2A38]">
                    ₹{(testResult.validation?.closingBalance ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Transactions Preview Table */}
              {testResult.transactions && testResult.transactions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#1E2A38]">
                    Parsed Transactions Preview (First {testResult.transactions.length}):
                  </p>
                  <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto bg-white max-h-48 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-[#F7F9FB] border-b border-[#E2E8F0] text-[#5A6E85]">
                        <tr>
                          <th className="py-1.5 px-2.5 font-semibold">Date</th>
                          <th className="py-1.5 px-2.5 font-semibold">Description</th>
                          <th className="py-1.5 px-2.5 font-semibold text-right">Debit</th>
                          <th className="py-1.5 px-2.5 font-semibold text-right">Credit</th>
                          <th className="py-1.5 px-2.5 font-semibold text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {testResult.transactions.map((tx, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 font-mono">{tx.date || "—"}</td>
                            <td className="py-1.5 px-2.5 truncate max-w-xs">{tx.description || "—"}</td>
                            <td className="py-1.5 px-2.5 text-right font-mono text-[#9E4A4A]">
                              {tx.debit ? `₹${tx.debit.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono text-[#3D7A64]">
                              {tx.credit ? `₹${tx.credit.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-medium">
                              {tx.balance ? `₹${tx.balance.toFixed(2)}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Errors if any */}
              {testResult.errors && testResult.errors.length > 0 && (
                <div className="text-[11px] text-[#9E4A4A] bg-[#9E4A4A]/10 p-2.5 rounded-lg space-y-1">
                  <p className="font-bold">Errors encountered:</p>
                  {testResult.errors.map((e, idx) => (
                    <p key={idx}>• {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F7F9FB]">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunTest}
            disabled={isLoading || (activeTab === "file" && !selectedFile)}
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Testing Layout...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Run Dry-Run Test
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
