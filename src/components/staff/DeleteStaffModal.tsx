"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDeleteStaffMutation } from '@/lib/store/api/authApi';
import { useToast } from '@/components/ui/Toast';
import type { User } from '@/lib/types/auth.types';

interface DeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User | null;
}

export function DeleteStaffModal({ isOpen, onClose, staff }: DeleteStaffModalProps) {
  const [deleteStaff, { isLoading }] = useDeleteStaffMutation();
  const { showToast } = useToast();

  if (!staff) return null;

  const handleDelete = async () => {
    try {
      await deleteStaff(staff.id).unwrap();
      showToast('Staff member permanently deleted');
      onClose();
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Failed to delete staff member';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Staff Member"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete Staff
          </Button>
        </>
      }
    >
      <div className="py-2 text-slate-600">
        <p>
          Are you sure you want to permanently remove <strong>{staff.name}</strong> from your CA firm? 
          This action cannot be undone and will immediately revoke their access.
        </p>
      </div>
    </Modal>
  );
}
