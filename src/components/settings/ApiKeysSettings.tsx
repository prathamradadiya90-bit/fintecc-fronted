'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Terminal,
  Zap,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} from '@/lib/store/api/apiKeysApi';

export function ApiKeysSettings() {
  const { showToast } = useToast();
  const { data: apiKeysResponse, isLoading } = useGetApiKeysQuery();
  const [createApiKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');

  // Security Raw Key Display Modal State
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ name: string; rawKey: string } | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [showRawKey, setShowRawKey] = useState(true);

  const keys = apiKeysResponse?.data || [];

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      showToast('Key description/name is required', 'error');
      return;
    }

    try {
      const res = await createApiKey({ name: keyName.trim() }).unwrap();
      const rawKey = res.data.rawKey;
      setNewlyCreatedKey({ name: res.data.name, rawKey });
      setIsCreateModalOpen(false);
      setKeyName('');
      setHasCopied(false);
      setShowRawKey(true);
      showToast('API Key generated successfully! Please save it now.', 'success');
    } catch (err: unknown) {
      console.error('Create API Key error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to generate API Key', 'error');
    }
  };

  const handleCopyRawKey = () => {
    if (newlyCreatedKey?.rawKey) {
      navigator.clipboard.writeText(newlyCreatedKey.rawKey);
      setHasCopied(true);
      showToast('API Key copied to clipboard!', 'success');
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to revoke API Key "${name}"? Any external services using this key will immediately lose access.`)) {
      return;
    }

    try {
      await revokeApiKey(id).unwrap();
      showToast('API Key revoked successfully', 'success');
    } catch (err: unknown) {
      console.error('Revoke API Key error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to revoke API Key', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div
        className="p-6 rounded-2xl border space-y-6"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Developer & Public API Keys
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  v1 Public API
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Empower your firm to connect Fintecc to Zapier, Make.com, internal accounting bots, and ERPs.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Generate New Key
          </Button>
        </div>

        {/* Integration Ecosystem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Zapier & Make.com</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Trigger new invoice generation or sync client KYC when forms are completed.
            </p>
          </div>

          <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>Custom CLI / Scripts</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Authenticate automated batch document ingestion and status pipelines.
            </p>
          </div>

          <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>SHA-256 Security</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Raw keys are never stored in the database. Only one-way hashes are retained.
            </p>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Firm API Keys
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-14 rounded-xl border animate-pulse" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }} />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border space-y-2 text-xs"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <KeyRound className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No API keys generated yet
              </p>
              <p className="text-slate-500 text-[11px]">
                Create a key to connect Fintecc to external workflow automation tools.
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-subtle)' }}>
                    <th className="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-300">Key Name</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-300">Key Prefix</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-300">Created At</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {k.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        <code>{k.keyPrefix}••••••••</code>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(k.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            k.isActive
                              ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                          }`}
                        >
                          {k.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {k.isActive && (
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k.id, k.name)}
                            disabled={isRevoking}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            title="Revoke Key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Generate API Key */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New API Key"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-key-form"
              size="sm"
              isLoading={isCreating}
              leftIcon={<KeyRound className="w-4 h-4 text-emerald-300" />}
            >
              Generate Key
            </Button>
          </div>
        }
      >
        <form id="create-key-form" onSubmit={handleCreateKey} className="space-y-4">
          <Input
            label="Key Identifier / Integration Name *"
            placeholder="e.g. Zapier Production Sync"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            required
            autoFocus
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Name the integration so you can identify which tool is accessing your firm&apos;s data. You will be shown the raw key immediately after creation.
          </p>
        </form>
      </Modal>

      {/* MODAL 2: CRITICAL ONE-TIME RAW KEY DISPLAY MODAL */}
      {newlyCreatedKey && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!hasCopied) {
              if (window.confirm('You have not confirmed copying your API key. Once closed, it can never be viewed again. Are you sure?')) {
                setNewlyCreatedKey(null);
              }
            } else {
              setNewlyCreatedKey(null);
            }
          }}
          title="Save Your New API Key Securely"
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500">
                {hasCopied ? '✅ Key copied to clipboard' : '⚠️ Make sure you copy it now'}
              </span>
              <Button
                size="sm"
                onClick={() => setNewlyCreatedKey(null)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                I Have Safely Saved My Key
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* High-visibility Warning Alert */}
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-sm block">
                  Copy this key now. It will NEVER be shown again!
                </span>
                <p className="leading-relaxed">
                  For strict cryptographic security, Fintecc only stores a one-way SHA-256 hash of this key. If you lose this key, you will have to revoke it and generate a new one.
                </p>
              </div>
            </div>

            {/* Key Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  API Key for <strong className="text-slate-900 dark:text-slate-100">{newlyCreatedKey.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowRawKey(!showRawKey)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  {showRawKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showRawKey ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>

              <div
                className="p-3.5 rounded-xl border flex items-center justify-between gap-3 font-mono text-xs select-all break-all"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {showRawKey
                    ? newlyCreatedKey.rawKey
                    : '•'.repeat(newlyCreatedKey.rawKey.length)}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyRawKey}
                  leftIcon={hasCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  className="shrink-0"
                >
                  {hasCopied ? 'Copied!' : 'Copy Key'}
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                HTTP Header Usage Example:
              </span>
              <pre className="font-mono text-[11px] p-2 rounded bg-slate-100 dark:bg-slate-950 overflow-x-auto text-emerald-600 dark:text-emerald-400">
                Authorization: Bearer {newlyCreatedKey.rawKey}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
