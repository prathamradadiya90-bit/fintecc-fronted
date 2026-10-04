'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  Image as ImageIcon,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import {
  useUploadStatementIntakeMutation,
  bankStatementsApi,
} from '@/lib/store/api/bankStatementsApi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store/store';
import type { StatementStatus } from '@/lib/types/bankStatement.types';

interface UploadIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

type ModalView = 'upload' | 'password_prompt' | 'processing' | 'success' | 'error';

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  minProgress: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'upload',
    name: '1. Ingest & Hash',
    description: 'Document uploaded & duplicate SHA-256 hash verified.',
    minProgress: 15,
  },
  {
    id: 'inspect',
    name: '2. Document Inspection',
    description: 'Scanning digital text coordinates via PyMuPDF or initiating OCR.',
    minProgress: 40,
  },
  {
    id: 'extract',
    name: '3. Column Extraction',
    description: 'Sorting words into Date, Narration, Debit, Credit & Balance columns.',
    minProgress: 70,
  },
  {
    id: 'validate',
    name: '4. Balance Reconciliation',
    description: 'Verifying double-entry mathematical balance & ledger mappings.',
    minProgress: 90,
  },
  {
    id: 'ready',
    name: '5. Ready for Review',
    description: 'Statement parsed successfully! Redirecting to CA Review...',
    minProgress: 100,
  },
];

export function UploadIntakeModal({
  isOpen,
  onClose,
  preselectedClientId,
}: UploadIntakeModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<ModalView>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState<string>(preselectedClientId || '');
  const [isDragOver, setIsDragOver] = useState(false);

  // Password challenge states
  const [hasPasswordPreemptive, setHasPasswordPreemptive] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Processing & live pipeline states
  const [processingStatementId, setProcessingStatementId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [detectedBankName, setDetectedBankName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: clientsData } = useGetClientsQuery();
  const [uploadStatementIntake, { isLoading: isUploading }] = useUploadStatementIntakeMutation();

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (preselectedClientId) {
      setClientId(preselectedClientId);
    }
  }, [preselectedClientId]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const clients = clientsData?.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setPasswordError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
      setPasswordError(null);
    }
  };

  const startElapsedTimer = () => {
    setElapsedSeconds(0);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopElapsedTimer = () => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  };

  const mapStatusToStage = (status: StatementStatus, currentProgress?: number) => {
    if (status === 'UPLOADED') {
      setActiveStageIndex(0);
      setProgressPercent(Math.max(currentProgress || 20, 20));
    } else if (status === 'INSPECTING' || status === 'PROCESSING') {
      setActiveStageIndex(1);
      setProgressPercent(Math.max(currentProgress || 45, 45));
    } else if (status === 'EXTRACTING' || status === 'TEXT_PARSED' || status === 'NEEDS_OCR') {
      setActiveStageIndex(2);
      setProgressPercent(Math.max(currentProgress || 70, 70));
    } else if (status === 'VALIDATING' || status === 'NEEDS_REVIEW') {
      setActiveStageIndex(3);
      setProgressPercent(Math.max(currentProgress || 90, 90));
    } else if (status === 'REVIEW' || status === 'COMPLETED' || status === 'DONE') {
      setActiveStageIndex(4);
      setProgressPercent(100);
    }
  };

  const pollStatementStatus = (statementId: string) => {
    let attempts = 0;
    const maxAttempts = 40; // 40 * 2.5s = 100 seconds timeout

    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      attempts++;

      try {
        const result = await (dispatch as any)(
          bankStatementsApi.endpoints.getStatementById.initiate(statementId, {
            subscribe: false,
            forceRefetch: true,
          })
        ).unwrap();

        const stmt = result?.data;
        const status = stmt?.status as StatementStatus | undefined;

        if (stmt?.bankName) {
          setDetectedBankName(stmt.bankName);
        }

        if (status) {
          mapStatusToStage(status, stmt?.processingProgress);
        }

        // Successfully completed or ready for review
        if (status === 'REVIEW' || status === 'COMPLETED' || status === 'DONE') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          stopElapsedTimer();
          setCurrentView('success');
          showToast('Statement parsed & balance verified! Opening review...', 'success');

          setTimeout(() => {
            onClose();
            router.push(`/dashboard/bank-statements/${statementId}/review`);
          }, 1200);
        }
        // Password required challenge triggered by backend inspector
        else if (status === 'FAILED_PASSWORD' || status === 'LOCKED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          stopElapsedTimer();
          setCurrentView('password_prompt');
          setPasswordError('The PDF is encrypted. Please enter the password to unlock.');
        }
        // General fatal failure
        else if (status === 'FAILED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          stopElapsedTimer();
          setCurrentView('error');
          setErrorMessage(stmt?.errorMessage || 'Extraction pipeline failed. The document format could not be parsed.');
        }
      } catch (err: any) {
        console.error('Polling status error:', err);
      }

      if (attempts >= maxAttempts) {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        stopElapsedTimer();
        setCurrentView('error');
        setErrorMessage('Processing is taking longer than expected. Please check your bank statements dashboard shortly.');
      }
    }, 2500);
  };

  const executeUpload = async (providedPassword?: string) => {
    if (!file) {
      showToast('Please choose a statement file to upload', 'error');
      return;
    }
    if (!clientId) {
      showToast('Please select a client entity', 'error');
      return;
    }

    setCurrentView('processing');
    setActiveStageIndex(0);
    setProgressPercent(15);
    setErrorMessage(null);
    setPasswordError(null);
    startElapsedTimer();

    try {
      const formData = new FormData();
      formData.append('statement', file);
      formData.append('clientId', clientId);

      const passToUse = providedPassword || (hasPasswordPreemptive ? password : '');
      if (passToUse.trim()) {
        formData.append('password', passToUse.trim());
      }

      const response = await uploadStatementIntake(formData).unwrap();
      const statementId = response?.data?.statementId;

      if (statementId) {
        setProcessingStatementId(statementId);
        showToast('Document uploaded. Parsing in background...', 'info');
        pollStatementStatus(statementId);
      } else {
        throw new Error('No statement ID returned by backend');
      }
    } catch (err: any) {
      console.error('Upload intake error:', err);
      stopElapsedTimer();

      const errMsg = err?.data?.message || err?.message || 'Failed to upload document for intake';

      // Check if the backend responded with password required directly
      if (errMsg.includes('PASSWORD') || errMsg.includes('encrypted') || errMsg.includes('locked')) {
        setCurrentView('password_prompt');
        setPasswordError('Password required to decrypt this statement.');
        return;
      }

      if (errMsg.includes('ACCESS_DENIED') || errMsg.includes('LIMIT_EXCEEDED') || errMsg.includes('Plan Limit Reached')) {
        onClose();
        return;
      }

      setCurrentView('error');
      setErrorMessage(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeUpload();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter the statement password.');
      return;
    }
    executeUpload(password.trim());
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-6 h-6 text-[#3D7A64]" />;
    }
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      return <ImageIcon className="w-6 h-6 text-[#4A6FA5]" />;
    }
    return <FileText className="w-6 h-6 text-[#4A6FA5]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl p-6 relative space-y-5 animate-scaleUp"
        style={{
          background: 'var(--color-bg-card, #FFFFFF)',
          border: '1px solid var(--color-border, #E2E8F0)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border, #E2E8F0)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              {currentView === 'password_prompt' ? (
                <Lock className="w-5 h-5 text-[#9E6B42]" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#4A6FA5]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading, #1E2A38)' }}>
                {currentView === 'password_prompt'
                  ? 'Password Protected Statement'
                  : 'Document Intake & AI Extraction'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary, #5A6E85)' }}>
                {currentView === 'password_prompt'
                  ? 'Unlock encrypted PDF statement'
                  : 'Native PDF · Scanned OCR · Vision Image · Excel'}
              </p>
            </div>
          </div>

          {currentView !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-500/10 text-[#8E9FAA] hover:text-[#1E2A38] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* VIEW 1: Password Challenge View */}
        {currentView === 'password_prompt' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#9E6B42]/10 border border-[#9E6B42]/20 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-[#9E6B42] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-[#1E2A38]">
                <p className="font-semibold text-sm text-[#1E2A38]">
                  Password Required to Unlock
                </p>
                <p className="text-[#5A6E85]">
                  <strong className="text-[#1E2A38]">{file?.name || 'Your document'}</strong> is encrypted by the bank. Enter the password below to decrypt and extract the transactions.
                </p>
                <p className="text-[11px] text-[#8E9FAA]">
                  Common bank formats: Date of Birth (DDMMYYYY), PAN in uppercase, or last 4 digits of debit card / account number.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-[#9E4A4A]/10 border border-[#9E4A4A]/20 text-xs flex items-center gap-2 text-[#9E4A4A]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5A6E85]">
                Statement Password <span className="text-[#9E4A4A]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  autoFocus
                  placeholder="Enter PDF password..."
                  className="w-full text-sm pl-3 pr-10 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] focus:outline-none focus:border-[#4A6FA5] focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8E9FAA] hover:text-[#1E2A38]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="p-3 rounded-xl bg-[#F7F9FB] border border-[#E2E8F0] text-[11px] flex items-center gap-2 text-[#5A6E85]">
              <ShieldCheck className="w-4 h-4 text-[#3D7A64] shrink-0" />
              <span>
                <strong>Privacy Guaranteed:</strong> The password is decrypted in volatile memory only and is never saved to database or logs.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentView('upload')}
                size="sm"
                className="text-xs text-[#5A6E85]"
              >
                Back to Upload
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
              >
                Unlock & Process
              </Button>
            </div>
          </form>
        )}

        {/* VIEW 2: Live Processing Pipeline Tracker */}
        {currentView === 'processing' && (
          <div className="py-6 px-2 space-y-6">
            {/* Top Animation & Stage Heading */}
            <div className="text-center space-y-3">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-[#4A6FA5]/20 border-t-[#4A6FA5] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#4A6FA5] animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#1E2A38]">
                  {PIPELINE_STAGES[activeStageIndex]?.name.replace(/^\d+\.\s*/, '')}
                </h4>
                <p className="text-xs text-[#5A6E85] max-w-sm mx-auto mt-0.5">
                  {PIPELINE_STAGES[activeStageIndex]?.description}
                </p>
                {detectedBankName && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5]">
                    Detected Format: {detectedBankName}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#5A6E85] font-medium">
                <span>Pipeline Execution</span>
                <span className="font-mono text-[#1E2A38]">{progressPercent}% · {elapsedSeconds}s</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#4A6FA5] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Interactive Step Timeline */}
            <div className="space-y-2 pt-1">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isPassed = idx < activeStageIndex;
                const isCurrent = idx === activeStageIndex;

                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'border-[#4A6FA5] bg-[#4A6FA5]/5 text-[#1E2A38] font-medium shadow-2xs'
                        : isPassed
                        ? 'border-[#3D7A64]/30 bg-[#3D7A64]/5 text-[#3D7A64]'
                        : 'border-[#E2E8F0] bg-transparent text-[#8E9FAA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isPassed
                            ? 'bg-[#3D7A64] text-white'
                            : isCurrent
                            ? 'bg-[#4A6FA5] text-white animate-pulse'
                            : 'bg-[#E2E8F0] text-[#8E9FAA]'
                        }`}
                      >
                        {isPassed ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span>{stage.name}</span>
                    </div>

                    <span className="text-[11px]">
                      {isPassed && <span className="font-semibold text-[#3D7A64]">Complete</span>}
                      {isCurrent && <span className="font-semibold text-[#4A6FA5]">Running...</span>}
                      {!isPassed && !isCurrent && <span>Pending</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: Success State */}
        {currentView === 'success' && (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-[#3D7A64]/10 text-[#3D7A64] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#1E2A38]">
                Statement Parsed & Verified
              </h4>
              <p className="text-xs text-[#5A6E85] mt-1 max-w-xs mx-auto">
                Opening balance + credits - debits match closing balance. Redirecting to CA Review...
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#4A6FA5] font-semibold animate-pulse">
              <span>Redirecting</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* VIEW 4: Error State */}
        {currentView === 'error' && (
          <div className="py-6 px-4 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-[#9E4A4A]/10 text-[#9E4A4A] flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#1E2A38]">
                Extraction Failed
              </h4>
              <p className="text-xs text-[#5A6E85] max-w-sm mx-auto">
                {errorMessage || 'The document format could not be processed.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs text-[#5A6E85]"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentView('upload')}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 5: Default Initial Upload Form */}
        {currentView === 'upload' && (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#9E4A4A]/10 border border-[#9E4A4A]/20 text-xs flex items-center gap-2 text-[#9E4A4A]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Client Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5 text-[#5A6E85]">
                <Building2 className="w-3.5 h-3.5 text-[#4A6FA5]" /> Select Client Entity <span className="text-[#9E4A4A]">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] text-[#1E2A38] focus:outline-none focus:border-[#4A6FA5] cursor-pointer"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* File Dropzone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5A6E85]">
                Statement File <span className="text-[#9E4A4A]">*</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragOver
                    ? 'border-[#4A6FA5] bg-[#4A6FA5]/5'
                    : 'border-[#E2E8F0] hover:border-[#4A6FA5]/60'
                }`}
              >
                <input
                  type="file"
                  id="intake-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
                  className="hidden"
                />
                <label htmlFor="intake-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  {file ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] max-w-sm">
                      {getFileIcon(file.name)}
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-semibold truncate text-[#1E2A38]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-[#8E9FAA]">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-[#4A6FA5]/10 text-[#4A6FA5]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-[#1E2A38]">
                        Click to browse or drag & drop statement file
                      </p>
                      <p className="text-[11px] text-[#8E9FAA]">
                        PDF (scanned or digital), PNG, JPG, or Excel sheets up to 15MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Optional Pre-emptive Password Checkbox */}
            <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1E2A38]">
                <input
                  type="checkbox"
                  checked={hasPasswordPreemptive}
                  onChange={(e) => setHasPasswordPreemptive(e.target.checked)}
                  className="rounded text-[#4A6FA5] focus:ring-[#4A6FA5] cursor-pointer"
                />
                <span>This statement PDF is password-protected</span>
              </label>

              {hasPasswordPreemptive && (
                <div className="pt-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter statement password (DOB / PAN / Acc No)..."
                      className="w-full text-xs pl-3 pr-9 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#1E2A38] focus:outline-none focus:border-[#4A6FA5] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#8E9FAA] hover:text-[#1E2A38]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auto-detection & Security Info note */}
            <div className="p-3 rounded-xl border border-[#A8C5DA]/40 bg-[#F7F9FB] text-[11px] space-y-1">
              <div className="font-semibold text-[#4A6FA5] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 5-Stage Verification Pipeline
              </div>
              <p className="text-[#5A6E85]">
                Includes digital text parsing, auto-OCR for scanned statements, layout column extraction, and double-entry balance check with duplicate detection.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                size="sm"
                className="text-xs text-[#5A6E85]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                disabled={!file || !clientId}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
              >
                Upload & Process
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
