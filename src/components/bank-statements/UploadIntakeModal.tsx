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

interface UploadIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

export function UploadIntakeModal({
  isOpen,
  onClose,
  preselectedClientId,
}: UploadIntakeModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState<string>(preselectedClientId || '');
  const [isDragOver, setIsDragOver] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatementId, setProcessingStatementId] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<'upload' | 'ocr' | 'mapping' | 'complete'>('upload');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();
  const [uploadStatementIntake, { isLoading: isUploading }] = useUploadStatementIntakeMutation();

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (preselectedClientId) {
      setClientId(preselectedClientId);
    }
  }, [preselectedClientId]);

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const clients = clientsData?.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const pollStatementStatus = (statementId: string) => {
    setProcessingStage('ocr');

    let attempts = 0;
    const maxAttempts = 30; // 30 * 2.5s = 75 seconds timeout

    pollingTimerRef.current = setInterval(async () => {
      attempts++;

      // Advance stage animation visually
      if (attempts > 2) setProcessingStage('mapping');

      try {
        const result = await (dispatch as any)(
          bankStatementsApi.endpoints.getStatementById.initiate(statementId, { subscribe: false, forceRefetch: true })
        ).unwrap();

        const status = result?.data?.status;

        if (status === 'REVIEW' || status === 'COMPLETED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setProcessingStage('complete');
          showToast('Document parsed & mapped with AI! Opening review...', 'success');

          setTimeout(() => {
            onClose();
            router.push(`/dashboard/bank-statements/${statementId}/review`);
          }, 1000);
        } else if (status === 'FAILED' || status === 'FAILED_PASSWORD') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setIsProcessing(false);
          setErrorMessage(
            status === 'FAILED_PASSWORD'
              ? 'PDF is password protected. Please remove the password and try again.'
              : 'AI extraction failed. The document format could not be processed.'
          );
        }
      } catch (err) {
        console.error('Polling error:', err);
      }

      if (attempts >= maxAttempts) {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        setIsProcessing(false);
        setErrorMessage('Processing is taking longer than expected. Please check your bank statements dashboard shortly.');
      }
    }, 2500);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please choose a statement file to upload', 'error');
      return;
    }
    if (!clientId) {
      showToast('Please select a client entity', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStage('upload');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('statement', file);
      formData.append('clientId', clientId);

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
      setIsProcessing(false);
      setErrorMessage(err?.data?.message || 'Failed to upload document for intake');
      showToast(err?.data?.message || 'Upload failed', 'error');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return <ImageIcon className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl p-6 relative space-y-5 animate-scaleUp"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Document Intake & AI Extraction
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Native PDF · Scanned OCR · Vision Image · Excel
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="py-8 px-4 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-4 border-[#00C2B3]/20 border-t-[#00C2B3] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#00C2B3] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {processingStage === 'upload' && 'Uploading document to vault...'}
                {processingStage === 'ocr' && 'AI OCR & Document Parsing in progress...'}
                {processingStage === 'mapping' && 'Applying 3-Tier AI Ledger Mapping...'}
                {processingStage === 'complete' && 'Parsing complete! Preparing CA review...'}
              </h4>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                {processingStage === 'ocr' && 'Google Document AI & Gemini Vision are extracting transaction tables.'}
                {processingStage === 'mapping' && 'Categorizing narrations using firm learned patterns and standard Tally ledgers.'}
                {processingStage === 'complete' && 'Redirecting to interactive CA Review Interface...'}
              </p>
            </div>

            {/* Stages Step Bar */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-medium">
              <span className={`px-2.5 py-1 rounded-full ${processingStage === 'upload' ? 'bg-[#00C2B3] text-white font-bold' : 'bg-slate-500/10 text-slate-500'}`}>
                1. Upload
              </span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-full ${processingStage === 'ocr' ? 'bg-[#00C2B3] text-white font-bold' : 'bg-slate-500/10 text-slate-500'}`}>
                2. AI OCR
              </span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-full ${processingStage === 'mapping' ? 'bg-[#00C2B3] text-white font-bold' : 'bg-slate-500/10 text-slate-500'}`}>
                3. Ledger Mapping
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Client Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <Building2 className="w-3.5 h-3.5 text-[#00C2B3]" /> Select Client Entity <span className="text-rose-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full text-xs px-3 py-2.5 rounded-xl border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3] cursor-pointer"
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
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Statement File <span className="text-rose-500">*</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragOver
                    ? 'border-[#00C2B3] bg-[#00C2B3]/5'
                    : 'border-[var(--color-border)] hover:border-[#00C2B3]/60'
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
                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] max-w-sm">
                      {getFileIcon(file.name)}
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {file.name}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-[#00C2B3]/10 text-[#00C2B3]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Click to browse or drag & drop statement file
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        PDF (scanned or digital), PNG, JPG, or Excel sheets up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Info note */}
            <div className="p-3 rounded-xl border text-[11px] space-y-1" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
              <div className="font-semibold text-[#00C2B3] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-detection Pipeline
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Fintecc automatically routes scanned pages to OCR and invokes the 3-Tier AI Mapping engine to classify ledgers with confidence scores.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Button type="button" variant="ghost" onClick={onClose} size="sm" className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                disabled={!file || !clientId}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="text-xs"
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
