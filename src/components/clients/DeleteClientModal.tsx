import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDeleteClientMutation } from '@/lib/store/api/clientsApi';
import type { Client } from '@/lib/types/client.types';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function DeleteClientModal({ isOpen, onClose, client }: DeleteClientModalProps) {
  const [deleteClient, { isLoading }] = useDeleteClientMutation();

  if (!client) return null;

  const handleDelete = async () => {
    try {
      await deleteClient(client.id).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Client"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete Client
          </Button>
        </>
      }
    >
      <div className="py-2 text-slate-600">
        <p>
          Are you sure you want to delete <strong>{client.name}</strong>? 
          This action cannot be undone and will permanently remove all associated data.
        </p>
      </div>
    </Modal>
  );
}
