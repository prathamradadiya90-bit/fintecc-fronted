'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, User, Building2, Key, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateDscLocationMutation } from '@/lib/store/api/dscApi';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { useToast } from '@/components/ui/Toast';
import type { DscToken } from '@/lib/types/dsc.types';

interface UpdateDscLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: DscToken | null;
}

export const UpdateDscLocationModal: React.FC<UpdateDscLocationModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const { showToast } = useToast();
  const [updateDscLocation, { isLoading: isUpdating }] = useUpdateDscLocationMutation();
  const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaffQuery();

  const [storageLocation, setStorageLocation] = useState('');
  const [assignedToId, setAssignedToId] = useState('');

  useEffect(() => {
    if (token) {
      setStorageLocation(token.storageLocation || '');
      setAssignedToId(token.assignedToId || token.assignedTo?.id || '');
    } else {
      setStorageLocation('');
      setAssignedToId('');
    }
  }, [token, isOpen]);

  if (!token) return null;

  const staffList = staffResponse?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await updateDscLocation({
        id: token.id,
        storageLocation: storageLocation.trim() || undefined,
        assignedToId: assignedToId ? assignedToId : null,
      }).unwrap();

      showToast('Physical DSC location updated successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to update DSC location', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Physical DSC Location"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token Info Card */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium text-sm">
            <Key className="w-4 h-4 text-[#00C2B3]" />
            <span>{token.ownerName}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {token.provider}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>{token.client?.name || 'Unassigned Client'}</span>
          </div>
        </div>

        {/* Storage Location Input */}
        <div>
          <Input
            label="Storage Location in Office"
            placeholder="e.g. Drawer B, Locker 2, Main Safe"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          />
          <p className="mt-1 text-xs text-slate-500">
            Specify the cabinet, drawer, or safe where this physical USB token is kept.
          </p>
        </div>

        {/* Assigned Staff Member Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Assigned Staff Custodian (Optional)
          </label>
          <div className="relative">
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              disabled={isLoadingStaff}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
            >
              <option value="">-- No Custodian Assigned (In Safe) --</option>
              {staffList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Select the team member currently possessing or responsible for this physical token.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isUpdating}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Update Location
          </Button>
        </div>
      </form>
    </Modal>
  );
};
