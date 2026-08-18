'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { FileText, Plus, Download, Loader2, Users, AlertCircle, Eye } from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { useGetDocumentsByClientIdQuery, useDownloadDocumentMutation } from '@/lib/store/api/clientDocumentsApi';
import { AddDocumentModal } from '@/components/clients/AddDocumentModal';
import { useToast } from '@/components/ui/Toast';
import type { ClientDocument } from '@/lib/types/client.types';

const FILE_TYPE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PDF:  { bg: 'bg-red-100 dark:bg-red-950/40',    text: 'text-red-600 dark:text-red-400',    label: 'PDF' },
  JPG:  { bg: 'bg-blue-100 dark:bg-blue-950/40',   text: 'text-blue-600 dark:text-blue-400',   label: 'JPG' },
  JPEG: { bg: 'bg-blue-100 dark:bg-blue-950/40',   text: 'text-blue-600 dark:text-blue-400',   label: 'JPG' },
  PNG:  { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', label: 'PNG' },
  XLS:  { bg: 'bg-green-100 dark:bg-green-950/40',  text: 'text-green-600 dark:text-green-400',  label: 'XLS' },
  XLSX: { bg: 'bg-green-100 dark:bg-green-950/40',  text: 'text-green-600 dark:text-green-400',  label: 'XLS' },
  CSV:  { bg: 'bg-green-100 dark:bg-green-950/40',  text: 'text-green-600 dark:text-green-400',  label: 'CSV' },
  DOC:  { bg: 'bg-sky-100 dark:bg-sky-950/40',    text: 'text-sky-700 dark:text-sky-300',    label: 'DOC' },
  DOCX: { bg: 'bg-sky-100 dark:bg-sky-950/40',    text: 'text-sky-700 dark:text-sky-300',    label: 'DOC' },
};

function getFileTypeConfig(fileType?: string) {
  const key = (fileType || '').toUpperCase();
  return FILE_TYPE_CONFIG[key] ?? { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', label: key || 'FILE' };
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

interface ClientPortalDocCardProps {
  doc: ClientDocument;
  onPreview: (doc: ClientDocument) => void;
}

function ClientPortalDocCard({ doc, onPreview }: ClientPortalDocCardProps) {
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
      className="rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${typeConfig.bg} rounded-xl flex items-center justify-center shrink-0`}>
            <span className={`text-[11px] font-black ${typeConfig.text}`}>{typeConfig.label}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {doc.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
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
        <div className="flex items-center gap-1.5">
          <button
            title="Preview"
            onClick={(e) => { e.stopPropagation(); onPreview(doc); }}
            className="p-1.5 rounded-lg hover:text-[#00C2B3] hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            title="Download"
            disabled={isDownloading}
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="p-1.5 rounded-lg hover:text-[#00C2B3] hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isClient = user?.role === 'CLIENT';
  const clientId = user?.clientId;
  const { showToast } = useToast();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data, isLoading, isError } = useGetDocumentsByClientIdQuery(clientId || '', {
    skip: !clientId,
  });

  const documents = data?.data ?? [];

  if (isClient) {
    if (!clientId) {
      return (
        <div className="max-w-4xl mx-auto py-12">
          <div
            className="p-6 rounded-2xl flex items-start gap-4"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Client Profile Linking In Progress
              </h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Your account is being connected to your client record. Please contact your CA firm administrator if this persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold shrink-0 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
                My Documents
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Access all files uploaded by you or shared by your CA firm.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading documents...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6 text-sm text-center">
            Failed to load documents. Please check your connection and try again.
          </div>
        ) : documents.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center shadow-sm space-y-4"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'var(--color-bg-skeleton)' }}
            >
              <FileText className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                No Documents Yet
              </h3>
              <p className="text-xs sm:text-sm mt-1 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                You haven't uploaded any documents yet. Click the button below to upload your first document.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <ClientPortalDocCard
                key={doc.id}
                doc={doc}
                onPreview={(d) => {
                  if (d.filePath) {
                    window.open(d.filePath, '_blank', 'noopener,noreferrer');
                  } else {
                    showToast('Preview not available for this document', 'error');
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {clientId && (
          <AddDocumentModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            clientId={clientId}
          />
        )}
      </div>
    );
  }

  // Non-client view
  return (
    <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
      <div
        className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-sm"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <FileText className="w-8 h-8 text-[#00C2B3]" />
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
          Client Document Management
        </h2>
        <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          To view or upload client documents, navigate to the client profile in the directory.
        </p>
      </div>
      <div className="pt-2">
        <Link
          href="/dashboard/my-clients"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          Go to My Clients
        </Link>
      </div>
    </div>
  );
}
