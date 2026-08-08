"use client";

import React, { useCallback, useRef, useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { useUploadDocumentMutation } from '@/lib/store/api/clientDocumentsApi';
import { useToast } from '@/components/ui/Toast';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function AddDocumentModal({ isOpen, onClose, clientId }: AddDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();
  const { showToast } = useToast();

  const resetState = () => {
    setSelectedFile(null);
    setTitle('');
    setIsDragging(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      // Auto-populate title from filename (strip extension)
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!selectedFile || !title.trim()) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('clientId', clientId);
    formData.append('title', title.trim());

    try {
      await uploadDocument(formData).unwrap();
      showToast('Document uploaded successfully');
      handleClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to upload document', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative dark:bg-slate-900 bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-800 border-slate-100">
          <h3 className="text-base font-semibold dark:text-slate-200 text-slate-800">Upload Document</h3>
          <button
            onClick={handleClose}
            className="dark:text-slate-500 text-slate-400 hover:dark:dark:text-slate-500 text-slate-400 text-slate-600 hover:dark:bg-slate-800 bg-slate-100 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
              ${isDragging
                ? 'border-[#00C2B3] bg-teal-50'
                : selectedFile
                  ? 'border-teal-300 bg-teal-50/50'
                  : 'dark:border-slate-700 border-slate-200 hover:border-slate-300 hover:dark:bg-slate-800/50 bg-slate-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleInputChange}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.doc,.docx"
            />
            {selectedFile ? (
              <>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold dark:text-slate-200 text-slate-800 break-all">{selectedFile.name}</p>
                  <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setTitle(''); }}
                  className="text-xs dark:text-slate-500 text-slate-400 hover:text-red-500 transition-colors underline"
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 dark:bg-slate-800 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 dark:text-slate-500 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold dark:text-slate-300 text-slate-700">Drop a file here or click to browse</p>
                  <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">PDF, JPG, PNG, XLS, CSV, DOC supported</p>
                </div>
              </>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold dark:text-slate-300 text-slate-700 mb-1.5">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PAN Card, Aadhaar, Bank Statement..."
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-sm dark:text-slate-300 text-slate-700 transition-all"
            />
          </div>

          {!selectedFile && title && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">Please select a file to upload.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-slate-800 border-slate-100 dark:bg-slate-800/50 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2 border dark:border-slate-700 border-slate-200 text-xs font-semibold dark:dark:text-slate-500 text-slate-400 text-slate-600 rounded-xl hover:dark:bg-slate-800 bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile || !title.trim()}
            className="px-5 py-2 bg-[#00C2B3] hover:bg-[#00a89b] text-xs font-bold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
