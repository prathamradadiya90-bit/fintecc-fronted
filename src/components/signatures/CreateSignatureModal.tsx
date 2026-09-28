'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useCreateSignatureMutation } from '@/lib/store/api/signaturesApi';
import { FileSignature, ShieldCheck } from 'lucide-react';

interface CreateSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSignatureModal: React.FC<CreateSignatureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const { data: clientsResponse, isLoading: isLoadingClients } = useGetClientsQuery();
  const [createSignature, { isLoading }] = useCreateSignatureMutation();

  const [clientId, setClientId] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const clients = clientsResponse?.data || [];

  const resetForm = () => {
    setClientId('');
    setDocumentName('');
    setDocumentUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      showToast('Please select a client', 'error');
      return;
    }
    if (!documentName.trim()) {
      showToast('Document name is required', 'error');
      return;
    }
    if (!documentUrl.trim()) {
      showToast('Document URL or file link is required', 'error');
      return;
    }

    try {
      await createSignature({
        clientId,
        documentName: documentName.trim(),
        documentUrl: documentUrl.trim(),
      }).unwrap();

      showToast('Digital signature request generated successfully!', 'success');
      resetForm();
      onClose();
    } catch (err: unknown) {
      console.error('Create signature request error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to create signature request', 'error');
    }
  };

  const handleUseSampleTemplate = () => {
    setDocumentName('Standard CA Engagement Letter FY 2026-27');
    setDocumentUrl('s3://fintecc-firm-vault/templates/engagement_letter_standard.pdf');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Digital Signature Request"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUseSampleTemplate}
            className="text-xs text-emerald-600 hover:text-emerald-700"
          >
            Use Sample Engagement Template
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-signature-form"
              size="sm"
              isLoading={isLoading}
              leftIcon={<FileSignature className="w-4 h-4 text-emerald-300" />}
            >
              Generate eSign Request
            </Button>
          </div>
        </div>
      }
    >
      <form id="create-signature-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Client Selection */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Select Client *
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">-- Choose a Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName || c.name} {c.email ? `(${c.email})` : ''}
              </option>
            ))}
          </select>
          {isLoadingClients && (
            <span className="text-[10px] text-slate-400 mt-1 block">Loading client directory...</span>
          )}
        </div>

        {/* Document Name */}
        <div>
          <Input
            label="Document / Agreement Title *"
            placeholder="e.g. Engagement Letter FY 2026-27"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            required
          />
        </div>

        {/* Document URL */}
        <div>
          <Input
            label="Document Source URL / S3 Path *"
            placeholder="s3://firm-bucket/docs/engagement_letter.pdf or https://..."
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            required
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Provide the direct cloud storage or S3 URI of the unsigned PDF document.
          </span>
        </div>

        {/* Provider Info Badge */}
        <div className="p-3 rounded-xl border border-[#4A6FA5]/20 bg-[#4A6FA5]/5 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#4A6FA5]">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliant with Aadhaar eSign (ESP) & DocuSign</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Fintecc generates legal audit trails, tracking document views, timestamps, and verified digital signatures in accordance with the Information Technology Act.
          </p>
        </div>
      </form>
    </Modal>
  );
};
