"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { useGetDocumentsByClientIdQuery, useDeleteDocumentMutation, useDownloadDocumentMutation } from '@/lib/store/api/clientDocumentsApi';
import { AddDocumentModal } from './AddDocumentModal';
import { useToast } from '@/components/ui/Toast';
import type { ClientDocument } from '@/lib/types/client.types';

interface ClientDocumentsTabProps {
  clientId: string;
}

// ─── File type config ────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PDF:  { bg: 'bg-red-100',    text: 'text-red-600',    label: 'PDF' },
  JPG:  { bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'JPG' },
  JPEG: { bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'JPG' },
  PNG:  { bg: 'bg-purple-100', text: 'text-purple-600', label: 'PNG' },
  XLS:  { bg: 'bg-green-100',  text: 'text-green-600',  label: 'XLS' },
  XLSX: { bg: 'bg-green-100',  text: 'text-green-600',  label: 'XLS' },
  CSV:  { bg: 'bg-green-100',  text: 'text-green-600',  label: 'CSV' },
  DOC:  { bg: 'bg-sky-100',    text: 'text-sky-700',    label: 'DOC' },
  DOCX: { bg: 'bg-sky-100',    text: 'text-sky-700',    label: 'DOC' },
};

function getFileTypeConfig(fileType?: string) {
  const key = (fileType || '').toUpperCase();
  return FILE_TYPE_CONFIG[key] ?? { bg: 'bg-slate-100', text: 'text-slate-500', label: key || 'FILE' };
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Document Card ───────────────────────────────────────────────────────────

interface DocumentCardProps {
  doc: ClientDocument;
  onDelete: (doc: ClientDocument) => void;
  onPreview: (doc: ClientDocument) => void;
  isDeleting: boolean;
}

function DocumentCard({ doc, onDelete, onPreview, isDeleting }: DocumentCardProps) {
  const typeConfig = getFileTypeConfig(doc.fileType);
  const [downloadDocument, { isLoading: isDownloading }] = useDownloadDocumentMutation();
  const { showToast } = useToast();

  const handleDownload = async () => {
    const ext = doc.fileType?.toLowerCase() ?? doc.filePath.split('.').pop() ?? 'file';
    const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
    try {
      await downloadDocument({ id: doc.id, filename }).unwrap();
    } catch {
      showToast('Failed to download document', 'error');
    }
  };

  return (
    <div 
      onClick={() => onPreview(doc)}
      className="rounded-2xl p-4 flex flex-col shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Top Row: Icon + Title */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${typeConfig.bg} rounded-xl flex items-center justify-center shrink-0`}>
          <span className={`text-[11px] font-black ${typeConfig.text}`}>{typeConfig.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--color-text-primary)' }}>{doc.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {formatFileSize(doc.fileSize)} · Uploaded {formatDate(doc.createdAt)}
          </p>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between pt-2.5 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        {/* Category badge */}
        {doc.category ? (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--color-bg-skeleton)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {doc.category}
          </span>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1">
          <button
            title="Download"
            disabled={isDownloading}
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="p-1.5 rounded-lg hover:text-[#00C2B3] hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {isDownloading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
          </button>
          <button
            title="Delete"
            disabled={isDeleting}
            onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
            className="p-1.5 rounded-lg hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Placeholder Card ────────────────────────────────────────────────────

function AddDocumentCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[108px] hover:border-[#00C2B3] hover:text-[#00C2B3] hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all duration-200 group"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
    >
      <div className="w-9 h-9 rounded-full group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 flex items-center justify-center transition-colors" style={{ background: 'var(--color-bg-skeleton)' }}>
        <Plus className="w-4 h-4" />
      </div>
      <span className="text-xs font-semibold">Add Document</span>
    </button>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

interface DeleteConfirmProps {
  doc: ClientDocument;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DeleteConfirmModal({ doc, onConfirm, onCancel, isLoading }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60" onClick={onCancel} />
      <div className="relative rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ background: 'var(--color-bg-card)' }}>
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Delete Document</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>"{doc.title}"</span>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-3 rounded-b-2xl" style={{ background: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2 border text-xs font-semibold rounded-xl transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-xs font-bold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────

export function ClientDocumentsTab({ clientId }: ClientDocumentsTabProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<ClientDocument | null>(null);

  const { data, isLoading, isError } = useGetDocumentsByClientIdQuery(clientId);
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  const { showToast } = useToast();

  const documents = data?.data ?? [];

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument({ id: docToDelete.id, clientId }).unwrap();
      showToast('Document deleted');
      setDocToDelete(null);
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Documents</h3>
          {!isLoading && !isError && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Document
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading documents...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-5 text-sm text-center">
          Failed to load documents. Please try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onPreview={(d) => {
                if (d.filePath) {
                  window.open(d.filePath, '_blank', 'noopener,noreferrer');
                } else {
                  showToast('Preview not available for this document', 'error');
                }
              }}
              onDelete={(d) => setDocToDelete(d)}
              isDeleting={isDeleting && docToDelete?.id === doc.id}
            />
          ))}
          <AddDocumentCard onClick={() => setIsUploadOpen(true)} />
        </div>
      )}

      {/* Upload Modal */}
      <AddDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        clientId={clientId}
      />

      {/* Delete Confirm Modal */}
      {docToDelete && (
        <DeleteConfirmModal
          doc={docToDelete}
          onConfirm={handleDelete}
          onCancel={() => setDocToDelete(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
