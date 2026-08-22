'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import {
  useCreateVaultItemMutation,
  useUpdateVaultItemMutation,
} from '@/lib/store/api/vaultApi';
import { useToast } from '@/components/ui/Toast';
import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import type { VaultItem } from '@/lib/types/vault.types';

interface VaultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultItemToEdit?: VaultItem | null;
  defaultClientId?: string;
}

const PORTAL_PRESETS = [
  'GST Portal (gst.gov.in)',
  'Income Tax e-Filing (incometax.gov.in)',
  'MCA V3 Portal (mca.gov.in)',
  'TRACES (tdscpc.gov.in)',
  'EPFO Unified Portal',
  'ESIC Portal',
  'DGFT Portal',
  'Bank Net Banking',
  'Custom / Other',
];

export function VaultFormModal({
  isOpen,
  onClose,
  vaultItemToEdit,
  defaultClientId,
}: VaultFormModalProps) {
  const { showToast } = useToast();
  const { data: clientsData, isLoading: isClientsLoading } = useGetClientsQuery({ limit: 100 });
  const [createVaultItem, { isLoading: isCreating }] = useCreateVaultItemMutation();
  const [updateVaultItem, { isLoading: isUpdating }] = useUpdateVaultItemMutation();

  const isEditing = !!vaultItemToEdit;

  // Form State
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vaultItemToEdit) {
      setClientId(vaultItemToEdit.clientId || '');
      setTitle(vaultItemToEdit.title || '');
      setUsername(vaultItemToEdit.username || '');
      setPassword(''); // Keep blank on edit unless updating
    } else {
      setClientId(defaultClientId || '');
      setTitle('');
      setUsername('');
      setPassword('');
    }
    setShowPassword(false);
    setErrors({});
  }, [vaultItemToEdit, defaultClientId, isOpen]);

  // Client dropdown options
  const clientOptions: SearchableOption[] = (clientsData?.data || []).map((client) => ({
    value: client.id,
    label: client.companyName || client.name,
    sublabel: client.name !== client.companyName ? client.name : undefined,
    badge: client.pan || client.gstin,
  }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title or Portal Name is required';
    if (!isEditing && !password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditing && vaultItemToEdit) {
        const payload: any = {
          title: title.trim(),
          username: username.trim() || null,
        };
        if (clientId) payload.clientId = clientId;
        if (password) payload.encryptedPass = password;

        await updateVaultItem({ id: vaultItemToEdit.id, data: payload }).unwrap();
        showToast('Vault credential updated successfully', 'success');
      } else {
        await createVaultItem({
          clientId: clientId || null,
          title: title.trim(),
          username: username.trim() || null,
          encryptedPass: password,
        }).unwrap();
        showToast('Credential safely stored in encrypted vault', 'success');
      }
      onClose();
    } catch (error: any) {
      console.error('Save vault item error:', error);
      showToast(error?.data?.message || 'Failed to save credential', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Portal Credential' : 'Store New Portal Credential'}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="vault-form"
            isLoading={isCreating || isUpdating}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Save to Vault'}
          </Button>
        </div>
      }
    >
      <form id="vault-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Security Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-700 dark:text-teal-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#00C2B3]" />
          <span>All passwords are encrypted with AES-256 before being stored.</span>
        </div>

        {/* Client Selector (Optional) */}
        <div>
          <SearchableSelect
            label="Client (Optional)"
            placeholder="Assign credential to client..."
            options={clientOptions}
            value={clientId}
            onChange={(val) => setClientId(val)}
            isLoading={isClientsLoading}
            clearable={true}
          />
        </div>

        {/* Quick Portal Title Presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Portal / Service Title *
          </label>
          <Input
            placeholder="e.g. GST Portal / SBI NetBanking"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PORTAL_PRESETS.slice(0, 4).map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setTitle(preset.split(' (')[0])}
                className="text-[11px] px-2 py-0.5 rounded-md border transition-colors hover:border-[#00C2B3] hover:text-[#00C2B3]"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {preset.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Username / Login ID */}
        <Input
          label="Username / Login ID / User ID"
          placeholder="e.g. 24AAACG1234F1Z5 or admin@client.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isEditing ? '••••••••' : 'Enter portal password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              className="w-full h-10 pl-3 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: errors.password ? '#f43f5e' : 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
        </div>
      </form>
    </Modal>
  );
}
