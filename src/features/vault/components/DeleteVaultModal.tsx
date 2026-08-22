'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDeleteVaultItemMutation } from '@/lib/store/api/vaultApi';
import { useToast } from '@/components/ui/Toast';
import { AlertTriangle } from 'lucide-react';
import type { VaultItem } from '@/lib/types/vault.types';

interface DeleteVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultItem: VaultItem | null;
}

export function DeleteVaultModal({
  isOpen,
  onClose,
  vaultItem,
}: DeleteVaultModalProps) {
  const { showToast } = useToast();
  const [deleteVaultItem, { isLoading }] = useDeleteVaultItemMutation();

  if (!vaultItem) return null;

  const handleDelete = async () => {
    try {
      await deleteVaultItem(vaultItem.id).unwrap();
      showToast('Credential removed from vault', 'success');
      onClose();
    } catch (error: any) {
      console.error('Delete vault item error:', error);
      showToast(error?.data?.message || 'Failed to remove credential', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Credential"
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Delete credential for {vaultItem.title}?
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            This stored username and encrypted password will be permanently deleted from the vault.
          </p>
        </div>
      </div>
    </Modal>
  );
}
