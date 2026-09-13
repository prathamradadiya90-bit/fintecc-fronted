"use client";

import React, { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { useCreateFolderMutation } from '@/lib/store/api/clientDocumentsApi';
import { useToast } from '@/components/ui/Toast';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

const SUGGESTED_FOLDERS = [
  'Identity Proofs',
  'Tax Returns',
  'Financials',
  'Audit Reports 2024',
  'MCA & Corporate',
  'GST Filings',
];

export function CreateFolderModal({ isOpen, onClose, clientId }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [createFolder, { isLoading }] = useCreateFolderMutation();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed) {
      showToast('Please enter a folder name', 'error');
      return;
    }

    try {
      await createFolder({ name: trimmed, clientId }).unwrap();
      showToast('Folder created successfully', 'success');
      setFolderName('');
      onClose();
    } catch (err: unknown) {
      let msg = 'Failed to create folder';
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const errorData = (err as { data: unknown }).data;
        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          msg = String((errorData as { message: unknown }).message);
        }
      }
      showToast(msg, 'error');
    }

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60" 
        onClick={onClose} 
      />

      <div 
        className="relative rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                New Vault Folder
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Organize client documents into dedicated folders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Audit Reports 2024"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#00C2B3]"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Suggestions */}
          <div>
            <span className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_FOLDERS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setFolderName(sug)}
                  className="px-2.5 py-1 text-xs rounded-lg transition-colors border hover:border-[#00C2B3]"
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div 
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold rounded-xl border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isLoading}
              className="px-5 py-2 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Folder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
