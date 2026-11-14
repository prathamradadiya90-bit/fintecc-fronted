'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Send, 
  Download, 
  RotateCcw,
  Table,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateMissingMasterModal } from '@/components/accounting/CreateMissingMasterModal';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';

const STANDARD_FIELDS = [
  { key: 'date', label: 'Voucher / Invoice Date', required: true },
  { key: 'voucherNumber', label: 'Voucher / Invoice Number', required: true },
  { key: 'partyName', label: 'Party / Customer / Vendor Name', required: true },
  { key: 'gstin', label: 'Party GSTIN', required: false },
  { key: 'taxableValue', label: 'Taxable Amount', required: true },
  { key: 'cgst', label: 'CGST Amount', required: false },
  { key: 'sgst', label: 'SGST Amount', required: false },
  { key: 'igst', label: 'IGST Amount', required: false },
  { key: 'totalAmount', label: 'Total Invoice Amount', required: true },
  { key: 'narration', label: 'Narration / Item Description', required: false }
];

export default function UniversalImportPage() {
  const { data: profilesData } = useGetProfilesQuery();
  const profiles = profilesData?.data || [];

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [voucherType, setVoucherType] = useState<'SALES' | 'PURCHASE'>('SALES');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [file, setFile] = useState<File | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Missing master modal
  const [missingMasterOpen, setMissingMasterOpen] = useState(false);
  const [missingMasterName, setMissingMasterName] = useState('');

  const activeClientId = selectedClientId || profiles[0]?.clientId || '';
  const selectedProfile = profiles.find(p => p.clientId === activeClientId);

  // Step 1: Detect Headers on file drop
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/v1/accounting/import/detect-headers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to detect headers');

      setDetectedHeaders(resData.data.headers);
      setSampleRows(resData.data.sampleRows);
      setMapping(resData.data.suggestedMapping || {});
      setStep(2);
    } catch (err: any) {
      alert(err.message || 'Error processing spreadsheet file');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Validate with confirmed mapping
  const handleValidate = async () => {
    if (!file) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('voucherType', voucherType);

    try {
      const response = await fetch('/api/v1/accounting/import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Validation failed');

      setValidationResult(resData.data);
      setStep(3);
    } catch (err: any) {
      alert(err.message || 'Error validating spreadsheet rows');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Push to Tally Sync Queue
  const handleQueueToTally = async () => {
    if (!validationResult?.validRows?.length) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/accounting/import/queue-tally', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          clientId: activeClientId,
          vouchers: validationResult.validRows,
          voucherType,
          companyName: selectedProfile?.legalName || selectedProfile?.tradeName || 'Company Name'
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to queue into Tally');

      alert(`Successfully queued ${validationResult.validRows.length} vouchers to local Tally connector!`);
    } catch (err: any) {
      alert(err.message || 'Failed to push to Tally');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Download Tally XML
  const handleDownloadXml = async () => {
    if (!validationResult?.validRows?.length) return;

    try {
      const response = await fetch('/api/v1/accounting/import/download-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          vouchers: validationResult.validRows,
          voucherType,
          companyName: selectedProfile?.legalName || selectedProfile?.tradeName || 'Company Name'
        })
      });

      if (!response.ok) throw new Error('Failed to generate XML');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tally-${voucherType.toLowerCase()}-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Error downloading XML');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Accounting Automation</span>
            <span>/</span>
            <span className="text-[var(--color-text-heading)] font-medium">Universal Excel / CSV Import</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-heading)]">
            Universal Sales & Purchase Import
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Auto-map any custom client spreadsheet format, validate taxes, and push directly to Tally Prime.
          </p>
        </div>

        {/* Client & Type Selector */}
        <div className="flex items-center gap-2">
          <select
            value={activeClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs py-2 pl-3 pr-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-medium"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.clientId}>
                {p.legalName || p.tradeName} ({p.gstin})
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-xl p-1 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs">
            <button
              onClick={() => setVoucherType('SALES')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                voucherType === 'SALES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sales Register
            </button>
            <button
              onClick={() => setVoucherType('PURCHASE')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                voucherType === 'PURCHASE' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Purchase Register
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        {[
          { num: 1, title: 'Upload Spreadsheet', desc: 'Select .xlsx, .xls or .csv file' },
          { num: 2, title: 'Visual Column Mapping', desc: 'Auto-detected & customizable' },
          { num: 3, title: 'Audit & Push to Tally', desc: 'Tax audit & 1-click sync' }
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-2xl border transition-all ${
              step === s.num
                ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                : step > s.num
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-[var(--color-border)] bg-[var(--color-bg-card)] opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  step > s.num
                    ? 'bg-emerald-600 text-white'
                    : step === s.num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                }`}
              >
                {step > s.num ? 'âœ“' : s.num}
              </span>
              <span className="font-bold text-[var(--color-text-heading)]">{s.title}</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 ml-7">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* STEP 1: Upload View */}
      {step === 1 && (
        <div
          className="p-10 rounded-2xl border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-center space-y-4"
          style={{ background: 'var(--color-bg-card)' }}
        >
          <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-heading)]">
              Drop your client sales or purchase spreadsheet here
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Supports any custom Excel (.xlsx, .xls) or CSV layout. Header columns are auto-detected.
            </p>
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Browse Spreadsheet File
            </Button>
          </label>
        </div>
      )}

      {/* STEP 2: Visual Column Mapper */}
      {step === 2 && (
        <div
          className="p-6 rounded-2xl border space-y-6"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-[var(--color-text-heading)]">
                  Visual Column Mapper ({file?.name})
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Confirm the mapped columns below. Our AI auto-mapped matching fields based on synonyms.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStep(1); setFile(null); }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Choose Another File
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STANDARD_FIELDS.map((f) => (
              <div
                key={f.key}
                className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text-heading)]">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </span>
                  {mapping[f.key] ? (
                    <span className="text-[10px] text-emerald-600 font-medium">Mapped</span>
                  ) : f.required ? (
                    <span className="text-[10px] text-rose-500 font-medium">Required</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Optional</span>
                  )}
                </div>

                <select
                  value={mapping[f.key] || ''}
                  onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="">-- Not Mapped --</option>
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      Column: {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {Object.keys(mapping).filter(k => mapping[k]).length} of {STANDARD_FIELDS.length} fields mapped
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleValidate}
              isLoading={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Audit & Validation
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Audit, Validation & Push to Tally */}
      {step === 3 && validationResult && (
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              className="p-4 rounded-2xl border"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-xs text-[var(--color-text-secondary)]">Total Processed</div>
              <div className="text-xl font-bold font-mono mt-1 text-[var(--color-text-heading)]">
                {validationResult.totalProcessed}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Rows in sheet</div>
            </div>

            <div className="p-4 rounded-2xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Valid Vouchers</div>
              <div className="text-xl font-bold font-mono mt-1 text-emerald-700 dark:text-emerald-300">
                {validationResult.validCount}
              </div>
              <div className="text-[11px] text-emerald-600/80 mt-1">Ready for Tally</div>
            </div>

            <div className="p-4 rounded-2xl border bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
              <div className="text-xs text-rose-700 dark:text-rose-300 font-medium">Validation Issues</div>
              <div className="text-xl font-bold font-mono mt-1 text-rose-700 dark:text-rose-300">
                {validationResult.invalidCount}
              </div>
              <div className="text-[11px] text-rose-600/80 mt-1">Missing details / math mismatch</div>
            </div>

            <div
              className="p-4 rounded-2xl border"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-xs text-[var(--color-text-secondary)]">Total Amount (₹)</div>
              <div className="text-xl font-bold font-mono mt-1 text-[var(--color-text-heading)]">
                ₹{Number(validationResult.summary?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tax: ₹{Number(validationResult.summary?.totalTax || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Adjust Mappings
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadXml}
                leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Download Tally XML
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={handleQueueToTally}
                isLoading={isLoading}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Push to Tally Connector Queue ({validationResult.validCount})
              </Button>
            </div>
          </div>

          {/* Validated Rows Table */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold text-xs text-[var(--color-text-heading)]">
              Validated Vouchers Preview ({voucherType})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="p-2.5 font-semibold">Row</th>
                    <th className="p-2.5 font-semibold">Date</th>
                    <th className="p-2.5 font-semibold">Voucher #</th>
                    <th className="p-2.5 font-semibold">Party / GSTIN</th>
                    <th className="p-2.5 font-semibold text-right">Taxable (₹)</th>
                    <th className="p-2.5 font-semibold text-right">Tax (₹)</th>
                    <th className="p-2.5 font-semibold text-right">Total (₹)</th>
                    <th className="p-2.5 font-semibold text-center">Status</th>
                    <th className="p-2.5 font-semibold text-center">Master</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.validRows.slice(0, 50).map((v: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                    >
                      <td className="p-2.5 font-mono text-slate-400">#{v.rowNumber}</td>
                      <td className="p-2.5 font-mono">{v.date}</td>
                      <td className="p-2.5 font-mono font-medium">{v.voucherNumber}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{v.partyName}</div>
                        {v.gstin && <div className="font-mono text-[10px] text-slate-400">{v.gstin}</div>}
                      </td>
                      <td className="p-2.5 text-right font-mono">₹{v.taxableValue.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600">
                        ₹{(v.cgst + v.sgst + v.igst).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold">₹{v.totalAmount.toFixed(2)}</td>
                      <td className="p-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => {
                            setMissingMasterName(v.partyName);
                            setMissingMasterOpen(true);
                          }}
                          className="text-[10px] text-indigo-600 hover:underline"
                        >
                          + Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* In-screen Master Creation Modal */}
      <CreateMissingMasterModal
        isOpen={missingMasterOpen}
        onClose={() => setMissingMasterOpen(false)}
        clientId={activeClientId}
        initialName={missingMasterName}
        defaultGroup={voucherType === 'SALES' ? 'Sundry Debtors' : 'Sundry Creditors'}
        onSuccess={() => alert('Ledger created and queued to Tally!')}
      />
    </div>
  );
}

