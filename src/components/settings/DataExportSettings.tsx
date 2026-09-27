'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Database,
  ShieldCheck,
  FileArchive,
  Lock,
  Cloud,
  Server,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useGetIntegrationsQuery,
  useSaveIntegrationMutation,
} from '@/lib/store/api/integrationsApi';

export function DataExportSettings() {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Integrations query for AWS_S3
  const { data: integrationsResponse } = useGetIntegrationsQuery();
  const [saveIntegration, { isLoading: isSavingS3 }] = useSaveIntegrationMutation();

  // AWS S3 State
  const [s3Status, setS3Status] = useState<'ACTIVE' | 'INACTIVE'>('INACTIVE');
  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [s3BucketName, setS3BucketName] = useState('');
  const [s3Region, setS3Region] = useState('ap-south-1');

  useEffect(() => {
    if (integrationsResponse?.data) {
      const s3Config = integrationsResponse.data.find((item) => item.provider === 'AWS_S3');
      if (s3Config) {
        setS3Status(s3Config.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
        setS3AccessKey(s3Config.apiKey || '');
        setS3SecretKey(s3Config.apiSecret || '');
        if (s3Config.metadata) {
          setS3BucketName(s3Config.metadata.bucketName || '');
          setS3Region(s3Config.metadata.region || 'ap-south-1');
        }
      }
    }
  }, [integrationsResponse]);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiBaseUrl}/export/download`, {
        method: 'GET',
        headers: {
          Accept: 'application/zip',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errMsg = 'Failed to generate export archive';
        try {
          const errJson = await response.json();
          errMsg = errJson.message || errMsg;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `fintecc-firm-export-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Firm export archive downloaded successfully!', 'success');
    } catch (error: unknown) {
      console.error('Export download error:', error);
      const errObj = error as { message?: string };
      showToast(errObj?.message || 'Error exporting firm data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveS3Config = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!s3AccessKey.trim() || !s3BucketName.trim()) {
      showToast('AWS Access Key ID and S3 Bucket Name are required', 'error');
      return;
    }

    try {
      await saveIntegration({
        provider: 'AWS_S3',
        status: s3Status,
        apiKey: s3AccessKey.trim(),
        apiSecret: s3SecretKey.trim() || undefined,
        metadata: {
          bucketName: s3BucketName.trim(),
          region: s3Region.trim(),
        },
      }).unwrap();

      showToast('AWS S3 Automated Backup integration saved!', 'success');
    } catch (err: unknown) {
      console.error('Save AWS S3 integration error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to save S3 integration', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* SECTION 1: Manual Self-Serve ZIP Export */}
      <div
        className="p-6 rounded-2xl border space-y-6"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Self-Serve Firm Data Export (.ZIP)
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Download a complete offline archive of all database records, clients, tasks, and financial files.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <FileArchive className="w-4 h-4 text-emerald-500" />
              <span>What is included in the ZIP archive?</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Clients Directory & Master Contact Profiles (JSON/CSV)</li>
              <li>Work Board Tasks & Execution Histories</li>
              <li>GST Profiles, Filings & Returns Records</li>
              <li>Invoices, Ledger Settings & Tax Slab Master</li>
              <li>Digital Signatures Registry & Audit Records</li>
              <li>Staff Profiles (excluding passwords) & Security Audit Logs</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Confidentiality & Compliance Notice:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                This export contains sensitive client, tax, and billing data. Store this file securely in compliance with ICAI and local data protection regulations.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Restricted to Firm Owners only</span>
            </div>

            <Button
              onClick={handleDownload}
              isLoading={isExporting}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download Firm Data Archive (.ZIP)
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Automated S3 Backups (Data Sovereignty) */}
      <div
        className="p-6 rounded-2xl border space-y-6"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Automated S3 Tenant Backups (Data Sovereignty)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Premium Enterprise
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Automatically stream daily tenant database snapshots directly to your firm's own AWS S3 bucket.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                s3Status === 'ACTIVE'
                  ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-slate-500 bg-slate-500/10 border-slate-500/20'
              }`}
            >
              {s3Status === 'ACTIVE' ? 'Daily Sync Active' : 'Not Configured'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveS3Config} className="space-y-4">
          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>Nightly Automated Cron Schedule</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every night at 00:00 UTC, the backend automated cron job generates an encrypted snapshot of all firm records and pipes it directly into your AWS S3 bucket. You retain 100% data custody.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="AWS Access Key ID"
              placeholder="AKIAIOSFODNN7EXAMPLE"
              value={s3AccessKey}
              onChange={(e) => setS3AccessKey(e.target.value)}
              required
            />

            <Input
              type="password"
              label="AWS Secret Access Key"
              placeholder={s3SecretKey ? '••••••••' : 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'}
              value={s3SecretKey}
              onChange={(e) => setS3SecretKey(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="AWS S3 Bucket Name"
              placeholder="e.g. my-ca-firm-backups"
              value={s3BucketName}
              onChange={(e) => setS3BucketName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                AWS Region
              </label>
              <select
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="ap-south-1">Asia Pacific (Mumbai) ap-south-1</option>
                <option value="ap-south-2">Asia Pacific (Hyderabad) ap-south-2</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore) ap-southeast-1</option>
                <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                <option value="eu-west-1">Europe (Ireland) eu-west-1</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={s3Status === 'ACTIVE'}
                onChange={(e) => setS3Status(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span style={{ color: 'var(--color-text-primary)' }}>
                Enable Automated Daily S3 Sync
              </span>
            </label>

            <Button
              type="submit"
              size="sm"
              isLoading={isSavingS3}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save S3 Backup Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
