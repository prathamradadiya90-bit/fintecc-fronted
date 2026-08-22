'use client';

import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Building2,
  Shield,
  Lock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  useGetVaultItemsQuery,
  useLazyGetVaultItemByIdQuery,
} from '@/lib/store/api/vaultApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { VaultFormModal } from '@/features/vault/components/VaultFormModal';
import { DeleteVaultModal } from '@/features/vault/components/DeleteVaultModal';
import type { VaultItem } from '@/lib/types/vault.types';

export default function VaultPage() {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetVaultItemsQuery();
  const [getVaultItemById] = useLazyGetVaultItemByIdQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  // Decrypted passwords cache in local state for reveal toggle
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const vaultItems = response?.data || [];

  const filteredItems = useMemo(() => {
    return vaultItems.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(query) ||
        (item.username && item.username.toLowerCase().includes(query)) ||
        (item.client?.name && item.client.name.toLowerCase().includes(query)) ||
        (item.client?.companyName && item.client.companyName.toLowerCase().includes(query));

      const matchCategory =
        selectedCategory === 'ALL' ||
        item.title.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
    });
  }, [vaultItems, searchTerm, selectedCategory]);

  const handleTogglePassword = async (item: VaultItem) => {
    const isCurrentlyVisible = !!visiblePasswords[item.id];

    if (isCurrentlyVisible) {
      setVisiblePasswords((prev) => ({ ...prev, [item.id]: false }));
      return;
    }

    if (decryptedPasswords[item.id]) {
      setVisiblePasswords((prev) => ({ ...prev, [item.id]: true }));
      return;
    }

    try {
      const res = await getVaultItemById(item.id).unwrap();
      if (res?.data?.encryptedPass) {
        setDecryptedPasswords((prev) => ({ ...prev, [item.id]: res.data.encryptedPass! }));
        setVisiblePasswords((prev) => ({ ...prev, [item.id]: true }));
      }
    } catch (err: any) {
      console.error('Fetch decrypted password error:', err);
      showToast('Failed to decrypt password', 'error');
    }
  };

  const handleCopy = async (text: string, fieldId: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      showToast(`${label} copied to clipboard!`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
  };

  const handleCopyPassword = async (item: VaultItem) => {
    let pass = decryptedPasswords[item.id];
    if (!pass) {
      try {
        const res = await getVaultItemById(item.id).unwrap();
        pass = res?.data?.encryptedPass || '';
        if (pass) {
          setDecryptedPasswords((prev) => ({ ...prev, [item.id]: pass }));
        }
      } catch (err) {
        showToast('Failed to decrypt password for copy', 'error');
        return;
      }
    }

    if (pass) {
      handleCopy(pass, `pass-${item.id}`, 'Password');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Client Password Vault
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> AES-256 Encrypted
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Safely store and retrieve GST, Income Tax, MCA, TRACES, and Banking portal credentials.
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedItem(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Credential
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search portal, username, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Portals' },
            { id: 'gst', label: 'GST' },
            { id: 'tax', label: 'Income Tax' },
            { id: 'mca', label: 'MCA' },
            { id: 'bank', label: 'Banking' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#00C2B3] text-white shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--color-text-secondary)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Credentials */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl animate-pulse"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center shadow-sm space-y-3"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="w-12 h-12 rounded-full bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No credentials found
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {searchTerm || selectedCategory !== 'ALL'
              ? 'No credentials match your filters.'
              : 'Add your first encrypted portal login to keep client credentials secure.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isRevealed = !!visiblePasswords[item.id];
            const passwordValue = decryptedPasswords[item.id] || '••••••••••••';

            return (
              <div
                key={item.id}
                className="rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Header: Title & Actions */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {item.title}
                        </h3>
                        {item.client ? (
                          <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                            <Building2 className="w-3 h-3 text-[#00C2B3]" />
                            {item.client.companyName || item.client.name}
                          </p>
                        ) : (
                          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                            Firm Shared
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsFormModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Edit Credential"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Username & Password Rows */}
                <div className="space-y-2 text-xs">
                  {/* Username */}
                  <div
                    className="flex items-center justify-between p-2 rounded-xl"
                    style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-subtle)' }}
                  >
                    <div className="space-y-0.5 truncate mr-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        Username / ID
                      </span>
                      <p className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {item.username || '—'}
                      </p>
                    </div>

                    {item.username && (
                      <button
                        onClick={() => handleCopy(item.username!, `user-${item.id}`, 'Username')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C2B3] transition-colors shrink-0"
                        title="Copy Username"
                      >
                        {copiedField === `user-${item.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Password */}
                  <div
                    className="flex items-center justify-between p-2 rounded-xl"
                    style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-subtle)' }}
                  >
                    <div className="space-y-0.5 truncate mr-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        Password
                      </span>
                      <p className="font-mono text-xs font-medium tracking-wider truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {isRevealed ? passwordValue : '••••••••••••'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePassword(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title={isRevealed ? 'Hide Password' : 'Show Password'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopyPassword(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C2B3] transition-colors"
                        title="Copy Password"
                      >
                        {copiedField === `pass-${item.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Timestamp */}
                <div className="pt-1 text-[10px] text-right" style={{ color: 'var(--color-text-muted)' }}>
                  Updated {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <VaultFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedItem(null);
        }}
        vaultItemToEdit={selectedItem}
      />

      <DeleteVaultModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        vaultItem={selectedItem}
      />
    </div>
  );
}
