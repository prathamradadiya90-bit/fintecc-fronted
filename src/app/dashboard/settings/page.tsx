'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Receipt,
  Percent,
  Mail,
  Save,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '@/lib/store/api/settingsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import type { TaxRate, InvoiceSettings, EmailSettings, SmsSettings, ThemeSettings } from '@/lib/types/settings.types';

type SettingsTab = 'invoice' | 'tax' | 'email' | 'theme';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [activeTab, setActiveTab] = useState<SettingsTab>('invoice');

  // Form State
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    prefix: 'INV-',
    nextNumber: 1,
    terms: 'Payment due within 30 days of receipt.',
  });

  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { name: 'GST Exempt (0%)', rate: 0 },
    { name: 'GST 5%', rate: 5 },
    { name: 'GST 12%', rate: 12 },
    { name: 'GST 18% (Standard)', rate: 18 },
    { name: 'GST 28%', rate: 28 },
  ]);

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    port: 587,
    user: '',
    pass: '',
  });

  useEffect(() => {
    if (response?.data) {
      if (response.data.invoiceSettings) {
        setInvoiceSettings(response.data.invoiceSettings);
      }
      if (response.data.taxRates && response.data.taxRates.length > 0) {
        setTaxRates(response.data.taxRates);
      }
      if (response.data.emailSettings) {
        setEmailSettings(response.data.emailSettings);
      }
    }
  }, [response]);

  // Tax Rate handlers
  const handleAddTaxRate = () => {
    setTaxRates([...taxRates, { name: 'New Tax Slab', rate: 0 }]);
  };

  const handleTaxRateChange = (index: number, field: keyof TaxRate, value: string | number) => {
    const updated = [...taxRates];
    updated[index] = {
      ...updated[index],
      [field]: field === 'rate' ? Number(value) || 0 : String(value),
    };
    setTaxRates(updated);
  };

  const handleRemoveTaxRate = (index: number) => {
    if (taxRates.length === 1) return;
    setTaxRates(taxRates.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        invoiceSettings,
        taxRates,
        emailSettings,
      }).unwrap();
      showToast('Settings saved successfully!', 'success');
    } catch (err: any) {
      console.error('Update settings error:', err);
      showToast(err?.data?.message || 'Failed to save settings', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
            Firm Settings & Configuration
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Manage invoice prefixes, billing terms, tax slab presets, and SMTP email parameters.
          </p>
        </div>

        <Button
          type="submit"
          form="settings-form"
          isLoading={isUpdating}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { id: 'invoice', label: 'Invoice & Billing', icon: Receipt },
          { id: 'tax', label: 'Tax Rates & Slabs', icon: Percent },
          { id: 'email', label: 'Email & SMTP', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#00C2B3] text-[#00C2B3]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Form */}
      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Invoice & Billing */}
        {activeTab === 'invoice' && (
          <div
            className="rounded-2xl p-6 shadow-sm space-y-5"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Invoice & Billing Preferences
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Default prefix, numbering sequences, and payment terms applied to new invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Invoice Number Prefix"
                placeholder="INV-2026-"
                value={invoiceSettings.prefix || ''}
                onChange={(e) =>
                  setInvoiceSettings((prev) => ({ ...prev, prefix: e.target.value }))
                }
              />

              <Input
                type="number"
                label="Next Invoice Sequence Number"
                placeholder="1001"
                value={invoiceSettings.nextNumber || 1}
                onChange={(e) =>
                  setInvoiceSettings((prev) => ({
                    ...prev,
                    nextNumber: Number(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Default Terms & Payment Notes
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Payment due within 30 days. Please quote invoice number on bank transfer."
                value={invoiceSettings.terms || ''}
                onChange={(e) =>
                  setInvoiceSettings((prev) => ({ ...prev, terms: e.target.value }))
                }
                className="w-full p-3 rounded-xl border text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Tax Rates */}
        {activeTab === 'tax' && (
          <div
            className="rounded-2xl p-6 shadow-sm space-y-5"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Tax Slabs & GST Rates
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Predefined tax percentages selectable across invoices, calculations, and conversions.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTaxRate}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Tax Slab
              </Button>
            </div>

            <div className="space-y-3">
              {taxRates.map((tax, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Slab Name (e.g. GST 18%)"
                      value={tax.name}
                      onChange={(e) => handleTaxRateChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                      style={{
                        background: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>

                  <div className="w-28 flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Rate"
                      value={tax.rate}
                      onChange={(e) => handleTaxRateChange(index, 'rate', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                      style={{
                        background: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTaxRate(index)}
                    disabled={taxRates.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors disabled:opacity-30"
                    title="Remove slab"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Email & SMTP */}
        {activeTab === 'email' && (
          <div
            className="rounded-2xl p-6 shadow-sm space-y-5"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Email & Custom SMTP Configuration
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Use your firm's domain SMTP server to dispatch invoices, tax filing receipts, and overdue alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="SMTP Host"
                  placeholder="smtp.gmail.com or mail.yourfirm.com"
                  value={emailSettings.smtpHost || ''}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({ ...prev, smtpHost: e.target.value }))
                  }
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="SMTP Port"
                  placeholder="587"
                  value={emailSettings.port || 587}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({
                      ...prev,
                      port: Number(e.target.value) || 587,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SMTP Username / Email"
                placeholder="billing@yourfirm.com"
                value={emailSettings.user || ''}
                onChange={(e) =>
                  setEmailSettings((prev) => ({ ...prev, user: e.target.value }))
                }
              />

              <Input
                type="password"
                label="SMTP Password / App Password"
                placeholder="••••••••••••"
                value={emailSettings.pass || ''}
                onChange={(e) =>
                  setEmailSettings((prev) => ({ ...prev, pass: e.target.value }))
                }
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
