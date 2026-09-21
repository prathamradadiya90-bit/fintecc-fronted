'use client';

import React, { useState } from 'react';
import { Download, Database, ShieldCheck, FileArchive, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function DataExportSettings() {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiBaseUrl}/export/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/zip',
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

      showToast('Firm export downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Export download error:', error);
      showToast(error?.message || 'Error exporting firm data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-heading)' }}>
              Self-Serve Firm Data Export
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Download a complete offline archive of all records, clients, tasks, and financial data for your firm.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <FileArchive className="w-4 h-4 text-indigo-500" />
              <span>What is included in the ZIP archive?</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Clients Directory & Master Contact Profiles (JSON/CSV format)</li>
              <li>Work Board Tasks & Execution Histories</li>
              <li>GST Profiles, Filings & Returns Records</li>
              <li>Invoices, Ledger Settings & Tax Slab Master</li>
              <li>Attendance & Staff Allocation Records</li>
              <li>Security Audit Trails & Login Logs</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Confidentiality & Compliance Notice:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                This export contains sensitive client and financial data. Store this file securely in compliance with ICAI and local data protection regulations.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
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
    </div>
  );
}
