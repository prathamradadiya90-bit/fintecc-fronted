'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useUpdateSignatureStatusMutation } from '@/lib/store/api/signaturesApi';
import type { SignatureRequest, SignatureStatus } from '@/lib/types/signature.types';
import { FileCheck } from 'lucide-react';

interface UpdateSignatureModalProps {
  signature: SignatureRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const SignatureForm: React.FC<{
  signature: SignatureRequest;
  onClose: () => void;
}> = ({ signature, onClose }) => {
  const { showToast } = useToast();
  const [updateStatus, { isLoading }] = useUpdateSignatureStatusMutation();

  const [status, setStatus] = useState<SignatureStatus>(
    signature.status === 'PENDING' ? 'SIGNED' : signature.status
  );
  const [signedDocumentUrl, setSignedDocumentUrl] = useState(
    signature.signedDocumentUrl || ''
  );
  const [txnId, setTxnId] = useState(
    signature.providerMetadata?.txnId || `TXN-ESIGN-${Date.now().toString().slice(-6)}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatus({
        id: signature.id,
        status,
        signedDocumentUrl: signedDocumentUrl.trim() || undefined,
        providerMetadata: {
          txnId,
          updatedAt: new Date().toISOString(),
          provider: signature.provider || 'AADHAAR_ESIGN',
        },
      }).unwrap();

      showToast(`Signature request status updated to ${status}!`, 'success');
      onClose();
    } catch (err: unknown) {
      console.error('Update signature error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to update signature request', 'error');
    }
  };

  return (
    <form id="update-signature-form" onSubmit={handleSubmit} className="space-y-4">
      <div
        className="p-3 rounded-xl border space-y-1"
        style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Document
        </span>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {signature.documentName}
        </div>
        <div className="text-[11px] text-slate-500">
          Client: {signature.client?.companyName || signature.client?.name || 'Assigned Client'}
        </div>
      </div>

      {/* Status Selection */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          Execution Status *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'SIGNED', label: 'Signed ✅', color: 'border-[#3D7A64]/30 text-[#3D7A64] bg-[#3D7A64]/10' },
            { id: 'VIEWED', label: 'Viewed 👁️', color: 'border-[#4A6FA5]/30 text-[#4A6FA5] bg-[#4A6FA5]/10' },
            { id: 'DECLINED', label: 'Declined ❌', color: 'border-[#9E4A4A]/30 text-[#9E4A4A] bg-[#9E4A4A]/10' },
          ].map((st) => (
            <button
              type="button"
              key={st.id}
              onClick={() => setStatus(st.id as SignatureStatus)}
              className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                status === st.id
                  ? `${st.color} ring-2 ring-[#4A6FA5]/40 font-bold shadow-sm`
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Signed Document URL */}
      {status === 'SIGNED' && (
        <div>
          <Input
            label="Signed PDF URL (Optional)"
            placeholder="s3://firm-bucket/signed/engagement_signed.pdf"
            value={signedDocumentUrl}
            onChange={(e) => setSignedDocumentUrl(e.target.value)}
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Provide link or cloud URI where the final signed PDF with audit trail is stored.
          </span>
        </div>
      )}

      {/* Provider Transaction ID */}
      <div>
        <Input
          label="Provider Transaction / Audit ID"
          placeholder="e.g. TXN-ESIGN-849201"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
        />
        <span className="text-[10px] text-slate-400 mt-1 block">
          Aadhaar eSign / DocuSign certificate transaction identifier.
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          isLoading={isLoading}
          leftIcon={<FileCheck className="w-4 h-4 text-emerald-300" />}
        >
          Save Status
        </Button>
      </div>
    </form>
  );
};

export const UpdateSignatureModal: React.FC<UpdateSignatureModalProps> = ({
  signature,
  isOpen,
  onClose,
}) => {
  if (!signature || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Signature Status / Record eSign"
      maxWidth="md"
    >
      <SignatureForm signature={signature} onClose={onClose} />
    </Modal>
  );
};
