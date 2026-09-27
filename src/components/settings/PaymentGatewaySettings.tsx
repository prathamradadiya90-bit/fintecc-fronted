'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Save,
  Sparkles,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useGetIntegrationsQuery,
  useSaveIntegrationMutation,
} from '@/lib/store/api/integrationsApi';

export function PaymentGatewaySettings() {
  const { showToast } = useToast();
  const { data: integrationsResponse } = useGetIntegrationsQuery();
  const [saveIntegration, { isLoading: isSaving }] = useSaveIntegrationMutation();

  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('INACTIVE');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [hasExistingSecret, setHasExistingSecret] = useState(false);

  useEffect(() => {
    if (integrationsResponse?.data) {
      const razorpayConfig = integrationsResponse.data.find(
        (item) => item.provider === 'RAZORPAY'
      );
      if (razorpayConfig) {
        setStatus(razorpayConfig.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
        setApiKey(razorpayConfig.apiKey || '');
        setHasExistingSecret(Boolean(razorpayConfig.hasApiSecret || razorpayConfig.apiSecret));
        setApiSecret(razorpayConfig.apiSecret || '');
      }
    }
  }, [integrationsResponse]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      showToast('Razorpay Key ID is required', 'error');
      return;
    }
    if (!hasExistingSecret && !apiSecret.trim()) {
      showToast('Razorpay Key Secret is required for initial setup', 'error');
      return;
    }

    try {
      await saveIntegration({
        provider: 'RAZORPAY',
        status,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim() || undefined,
      }).unwrap();

      showToast('Razorpay Payment Gateway credentials saved successfully!', 'success');
      setHasExistingSecret(true);
    } catch (err: unknown) {
      console.error('Save Razorpay integration error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to save Razorpay settings', 'error');
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Direct Client Payment Collection (Razorpay)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Escrow-Free
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Connect your CA firm's Razorpay account to receive invoice payments directly into your bank account.
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              status === 'ACTIVE'
                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                : 'text-slate-500 bg-slate-500/10 border-slate-500/20'
            }`}
          >
            {status === 'ACTIVE' ? 'Gateway Active' : 'Disabled'}
          </span>
        </div>

        {/* Value Proposition Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-500" />
              <span>Direct Bank Account Settlement</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              When clients pay digital invoices (UPI, Netbanking, Cards), funds settle directly to your designated firm current account. Fintecc holds zero escrow funds.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
            <div className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Automatic Payment Links</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              New invoices automatically embed unique Razorpay payment links and QR codes, reconciling payments in real-time.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Razorpay Key ID *"
              placeholder="rzp_live_1234567890 or rzp_test_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Razorpay Key Secret *"
              placeholder={hasExistingSecret ? '••••••••••••••••' : 'Enter Secret Key'}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={status === 'ACTIVE'}
                onChange={(e) => setStatus(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span style={{ color: 'var(--color-text-primary)' }}>
                Enable Direct Payment Gateway on Invoices
              </span>
            </label>

            <Button
              type="submit"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Gateway Credentials
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
