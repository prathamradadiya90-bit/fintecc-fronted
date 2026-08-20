'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { MasterExcelImportResponse } from '@/lib/types/task.types';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<MasterExcelImportResponse>;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<MasterExcelImportResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      setIsUploading(true);
      setError(null);
      const res = await onImport(file);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Import failed');
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to import excel file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Tasks from Master Excel"
      maxWidth="md"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleSubmit}
              disabled={!file}
              isLoading={isUploading}
              className="bg-[#00C2B3] hover:bg-[#00A89B] text-white"
            >
              Upload & Import
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {result ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Import Successful!</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-slate-700 dark:text-slate-300">
              <div>Total Rows Processed: <strong>{result.processedCount}</strong></div>
              <div>New Tasks Created: <strong>{result.newTasksCount}</strong></div>
              <div>New Clients Added: <strong>{result.newClientsCount}</strong></div>
              <div>Tasks Updated: <strong>{result.updatedTasksCount}</strong></div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-xs text-[var(--color-text-secondary)] space-y-1.5">
              <p>
                Import your firm&apos;s existing master Excel sheet to populate the Work Board.
              </p>
              <p className="font-semibold text-[var(--color-text-primary)]">
                Required Columns in Excel:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[var(--color-text-muted)]">
                <li><span className="font-medium text-[var(--color-text-secondary)]">Client Name</span> (e.g. Acme Corp)</li>
                <li><span className="font-medium text-[var(--color-text-secondary)]">Task Title</span> (e.g. GSTR-3B Filing)</li>
                <li>Optional: <span className="font-medium text-[var(--color-text-secondary)]">Due Date, Compliance Type, Priority, Status, Staff Email</span></li>
              </ul>
            </div>

            {/* File Upload Drop Area */}
            <div
              className="border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer"
              style={{
                borderColor: file ? '#00C2B3' : 'var(--color-border)',
                background: file ? 'rgba(0, 194, 179, 0.04)' : 'var(--color-bg-subtle)',
              }}
              onClick={() => document.getElementById('excel-file-input')?.click()}
            >
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="w-10 h-10 mx-auto text-[#00C2B3] mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-semibold text-[#00C2B3]">{file.name}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {(file.size / 1024).toFixed(1)} KB • Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Click to select your Excel file (.xlsx, .csv)
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Supports up to 5,000 tasks per upload
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
