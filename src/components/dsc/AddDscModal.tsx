'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useCreateDscMutation, useUpdateDscMutation } from '@/lib/store/api/dscApi';
import { useToast } from '@/components/ui/Toast';
import type { DscToken, CreateDscRequest, DscStatus } from '@/lib/types/dsc.types';

interface AddDscModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingToken?: DscToken | null;
}

const PROVIDERS = ['eMudhra', 'Capricorn', 'Pantasign', 'Vsign', 'IDSign', 'Sify', 'Other'];

export const AddDscModal: React.FC<AddDscModalProps> = ({ isOpen, onClose, editingToken }) => {
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery({ limit: 100 });
  const [createDsc, { isLoading: isCreating }] = useCreateDscMutation();
  const [updateDsc, { isLoading: isUpdating }] = useUpdateDscMutation();
  const { showToast } = useToast();

  const [clientId, setClientId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [status, setStatus] = useState<DscStatus>('ACTIVE');

  useEffect(() => {
    if (editingToken) {
      setClientId(editingToken.clientId || '');
      setOwnerName(editingToken.ownerName || '');
      setProvider(editingToken.provider || PROVIDERS[0]);
      setPassword(editingToken.password || '');
      setExpiryDate(
        editingToken.expiryDate ? new Date(editingToken.expiryDate).toISOString().split('T')[0] : ''
      );
      setStorageLocation(editingToken.storageLocation || '');
      setStatus(editingToken.status || 'ACTIVE');
    } else {
      setClientId('');
      setOwnerName('');
      setProvider(PROVIDERS[0]);
      setPassword('');
      setExpiryDate('');
      setStorageLocation('');
      setStatus('ACTIVE');
    }
  }, [editingToken, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !ownerName || !provider || !expiryDate || !storageLocation) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingToken) {
        await updateDsc({
          id: editingToken.id,
          clientId,
          ownerName,
          provider,
          password: password || undefined,
          expiryDate: new Date(expiryDate).toISOString(),
          storageLocation,
          status,
        }).unwrap();
        showToast('DSC token updated successfully', 'success');
      } else {
        const payload: CreateDscRequest = {
          clientId,
          ownerName,
          provider,
          password: password || undefined,
          expiryDate: new Date(expiryDate).toISOString(),
          storageLocation,
          status,
        };
        await createDsc(payload).unwrap();
        showToast('DSC token registered successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to save DSC token', 'error');
    }
  };

  const clients = clientsData?.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingToken ? 'Edit DSC Token' : 'Register New DSC Token'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
          >
            <option value="">Select a Client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.pan ? `(${c.pan})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Owner Name */}
        <Input
          label="Token Holder / Signatory Name"
          placeholder="e.g. Ramesh Kumar (Director)"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />

        {/* Provider & Storage Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              DSC Provider <span className="text-red-500">*</span>
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Physical Storage Location"
            placeholder="e.g. Locker A / Desk 2"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            required
          />
        </div>

        {/* Expiry Date & PIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />

          <Input
            label="Token PIN / Password (Optional)"
            type="password"
            placeholder="e.g. 12345678"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Status (when editing) */}
        {editingToken && (
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DscStatus)}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating}>
            {editingToken ? 'Save Changes' : 'Register DSC'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
