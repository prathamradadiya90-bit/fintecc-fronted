'use client';

import React, { useState } from 'react';
import {
  History,
  UploadCloud,
  RotateCcw,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  File,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetVersionHistoryQuery,
  useUploadNewVersionMutation,
  useRevertVersionMutation,
} from '@/lib/store/api/clientDocumentsApi';
import type { ClientDocument } from '@/lib/types/client.types';

interface DocumentVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: ClientDocument | null;
  clientId?: string;
}

export function DocumentVersionDrawer({
  isOpen,
  onClose,
  document,
  clientId,
}: DocumentVersionDrawerProps) {
  const { showToast } = useToast();
  const documentId = document?.id || '';

  const { data: historyResponse, isLoading, refetch } = useGetVersionHistoryQuery(documentId, {
    skip: !documentId || !isOpen,
  });

  const [uploadNewVersion, { isLoading: isUploading }] = useUploadNewVersionMutation();
  const [revertVersion, { isLoading: isReverting }] = useRevertVersionMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const historyData = historyResponse?.data;
  const currentVersion = historyData?.currentVersion;
  const previousVersions = historyData?.history || [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !documentId) {
      showToast('Please select a replacement file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await uploadNewVersion({
        id: documentId,
        formData,
        clientId: clientId || document?.clientId,
      }).unwrap();

      showToast(`Version uploaded successfully for ${document?.title}`, 'success');
      setSelectedFile(null);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to upload new version', 'error');
    }
  };

  const handleRevert = async (versionNumber: number) => {
    if (!confirm(`Revert "${document?.title}" back to Version ${versionNumber}?`)) return;
    try {
      await revertVersion({
        id: documentId,
        versionNumber,
        clientId: clientId || document?.clientId,
      }).unwrap();

      showToast(`Document reverted back to version ${versionNumber}`, 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to revert version', 'error');
    }
  };

  if (!isOpen || !document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Document Version History: ${document.title}`}
      maxWidth="lg"
    >
      <div className="space-y-5 text-sm text-[#1E2A38] dark:text-slate-100">
        {/* Upload New Version Section */}
        <form
          onSubmit={handleUploadVersion}
          className="p-3.5 rounded-xl border border-dashed border-[#4A6FA5]/40 bg-[#4A6FA5]/5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#4A6FA5]" />
            <span className="font-semibold text-xs text-[#1E2A38] dark:text-white">
              Upload Revised Document Version
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#4A6FA5] file:text-white hover:file:bg-[#3D5C8A] cursor-pointer"
            />

            <Button
              type="submit"
              size="sm"
              disabled={!selectedFile || isUploading}
              className="w-full sm:w-auto bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white shrink-0 text-xs"
            >
              {isUploading ? 'Uploading...' : 'Commit New Version'}
            </Button>
          </div>
        </form>

        {/* Current Active Version Banner */}
        {currentVersion && (
          <div className="p-3 rounded-xl bg-[#3D7A64]/10 border border-[#3D7A64]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3D7A64]/20 text-[#3D7A64] flex items-center justify-center font-bold text-xs">
                v{currentVersion.versionNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#1E2A38] dark:text-white">
                    Current Active Version (v{currentVersion.versionNumber})
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#3D7A64] text-white">
                    LIVE
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6E85] mt-0.5">
                  Size: {formatFileSize(currentVersion.fileSize)} • Updated:{' '}
                  {new Date(currentVersion.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Version History List */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6E85] dark:text-slate-400">
            <History className="w-3.5 h-3.5" />
            <span>Audit History & Archived Versions</span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#5A6E85]">Loading version history...</div>
          ) : previousVersions.length === 0 ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-[#5A6E85] dark:text-slate-400 bg-white dark:bg-[#131C2E]">
              No previous revisions archived yet. Uploading a revised file will preserve the current file here.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#131C2E] divide-y divide-slate-100 dark:divide-slate-800">
              {previousVersions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                      v{ver.versionNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#1E2A38] dark:text-white">
                        Revision v{ver.versionNumber}
                      </div>
                      <div className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                        Size: {formatFileSize(ver.fileSize)} • Archived:{' '}
                        {new Date(ver.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isReverting}
                    onClick={() => handleRevert(ver.versionNumber)}
                    className="flex items-center gap-1.5 text-xs text-[#4A6FA5] border-[#4A6FA5]/30 hover:bg-[#4A6FA5]/10 h-7"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Revert to v{ver.versionNumber}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
