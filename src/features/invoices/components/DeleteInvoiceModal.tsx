'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDeleteInvoiceMutation } from '@/lib/store/api/invoicesApi';
import { useToast } from '@/components/ui/Toast';
import { AlertTriangle } from 'lucide-react';
import type { Invoice } from '@/lib/types/invoice-management.types';

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function DeleteInvoiceModal({
  isOpen,
  onClose,
  invoice,
}: DeleteInvoiceModalProps) {
  const { showToast } = useToast();
  const [deleteInvoice, { isLoading }] = useDeleteInvoiceMutation();

  if (!invoice) return null;

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice.id).unwrap();
      showToast('Invoice deleted successfully', 'success');
      onClose();
    } catch (error: any) {
      console.error('Delete invoice error:', error);
      showToast(error?.data?.message || 'Failed to delete invoice', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Invoice"
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Are you sure you want to delete invoice {invoice.invoiceNumber}?
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            This action cannot be undone. All associated line items and sync states will be permanently deleted.
          </p>
        </div>
      </div>
    </Modal>
  );
}
