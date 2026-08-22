'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, Loader2 } from 'lucide-react';

interface ReportUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function ReportUploader({ onFileSelect, isLoading = false }: ReportUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB.');
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#00C2B3] text-white flex items-center justify-center font-semibold text-xs">
          2
        </div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Upload Marketplace Sales Report
        </h2>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all text-center
          ${dragActive ? 'border-[#00C2B3] bg-[#00C2B3]/5' : ''}
          ${selectedFile ? 'border-[#00C2B3]/30 bg-[#00C2B3]/5' : ''}
        `}
        style={{
          borderColor: !dragActive && !selectedFile ? 'var(--color-border)' : undefined,
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
          id="ecommerce-upload"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-9 h-9 text-[#00C2B3] animate-spin" />
            <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Standardizing sales records and aggregating tax values...
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Applying B2C state-wise rate calculation
            </p>
          </div>
        ) : selectedFile ? (
          <div
            className="flex items-center justify-between w-full max-w-md p-4 rounded-xl shadow-sm"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-teal-500/10 text-[#00C2B3] rounded-xl flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3
                  className="font-semibold text-sm truncate max-w-[220px]"
                  style={{ color: 'var(--color-text-primary)' }}
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &middot; Ready to process
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1.5 text-red-400 hover:text-red-500 rounded-lg transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'var(--color-bg-skeleton)', color: 'var(--color-text-secondary)' }}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <label htmlFor="ecommerce-upload" className="cursor-pointer">
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Drag & drop your Excel / CSV report here or{' '}
                <span className="text-[#00C2B3] hover:underline">browse files</span>
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Supports .xlsx, .xls, and .csv &middot; Max 50MB
              </p>
            </label>
          </>
        )}

        {error && (
          <div className="mt-3 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
