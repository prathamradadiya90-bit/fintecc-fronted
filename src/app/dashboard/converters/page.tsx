'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConversionType, ConversionTypeSelector } from '@/components/pdf-to-xml/ConversionTypeSelector';
import { FileUploader } from '@/components/pdf-to-xml/FileUploader';
import { TransactionsPreview } from '@/components/pdf-to-xml/TransactionsPreview';
import { InvoicePreview } from '@/components/invoice-converter/InvoicePreview';
import { Button } from '@/components/ui/Button';
import {
  useUploadBankStatementMutation,
  useDownloadBankStatementConvertMutation,
  useUploadStatementIntakeMutation,
} from '@/lib/store/api/bankStatementsApi';
import {
  useUploadInvoiceMutation,
  useDownloadInvoiceConvertMutation,
  useBulkOcrMutation,
  useDownloadBulkOcrCsvMutation,
} from '@/lib/store/api/invoicesApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { PasswordProtectedModal } from '@/components/pdf-to-xml/PasswordProtectedModal';
import {
  useConvertExcelToJsonMutation,
  useConvertJsonToExcelMutation,
  useScanReceiptMutation,
} from '@/lib/store/api/convertersApi';
import { useToast } from '@/components/ui/Toast';
import { BankStatementResponse, BankTransaction } from '@/lib/types/bankStatement.types';
import { ExtractedInvoice } from '@/lib/types/invoice.types';
import type { ExcelToJsonResponse, ReceiptOcrResponse } from '@/lib/types/converter.types';
import {
  FileSpreadsheet,
  FileCode2,
  Copy,
  Download,
  Check,
  UploadCloud,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lock,
  Building2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

function ConvertersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const typeParam = searchParams.get('type') as ConversionType | null;

  const [selectedType, setSelectedType] = useState<ConversionType>(
    typeParam || 'invoice'
  );

  useEffect(() => {
    if (searchParams.has('type')) {
      router.replace('/dashboard/converters', { scroll: false });
    }
  }, [searchParams, router]);

  // Bank statement state
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [bankData, setBankData] = useState<BankStatementResponse | null>(null);
  const [bankMode, setBankMode] = useState<'direct' | 'async'>('direct');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [asyncUploadStatus, setAsyncUploadStatus] = useState<{
    statementId: string;
    status: string;
    message: string;
  } | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordProtectedFileName, setPasswordProtectedFileName] = useState('');

  const [isDownloadingBankXml, setIsDownloadingBankXml] = useState(false);
  const [isDownloadingBankCsv, setIsDownloadingBankCsv] = useState(false);
  const [isDownloadingBankExcel, setIsDownloadingBankExcel] = useState(false);
  const [isDownloadingBankGstJson, setIsDownloadingBankGstJson] = useState(false);

  // Invoice state
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceData, setInvoiceData] = useState<ExtractedInvoice | null>(null);
  const [isDownloadingInvoiceXml, setIsDownloadingInvoiceXml] = useState(false);
  const [isDownloadingInvoiceCsv, setIsDownloadingInvoiceCsv] = useState(false);

  // Bulk OCR state
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkOcrResult, setBulkOcrResult] = useState<any | null>(null);
  const [isDownloadingBulkCsv, setIsDownloadingBulkCsv] = useState(false);

  // Excel ↔ JSON state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelResult, setExcelResult] = useState<ExcelToJsonResponse['data'] | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('[\n  {\n    "InvoiceNo": "INV-001",\n    "Client": "Acme Corp",\n    "Amount": 15000\n  }\n]');
  const [isCopiedJson, setIsCopiedJson] = useState(false);

  // Receipt OCR state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptResult, setReceiptResult] = useState<ReceiptOcrResponse['data'] | null>(null);

  // RTK Mutations & Queries
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();
  const clients = clientsData?.data || [];

  const [uploadBankStatement, { isLoading: isBankUploading }] = useUploadBankStatementMutation();
  const [downloadBankStatementConvert, { reset: resetDownloadBankStatement }] = useDownloadBankStatementConvertMutation();
  const [uploadStatementIntake, { isLoading: isIntakeUploading }] = useUploadStatementIntakeMutation();

  const [uploadInvoice, { isLoading: isInvoiceUploading }] = useUploadInvoiceMutation();
  const [downloadInvoiceConvert, { reset: resetDownloadInvoice }] = useDownloadInvoiceConvertMutation();
  const [bulkOcr, { isLoading: isBulkOcrUploading }] = useBulkOcrMutation();
  const [downloadBulkOcrCsv, { reset: resetDownloadBulkOcrCsv }] = useDownloadBulkOcrCsvMutation();

  const [convertExcelToJson, { isLoading: isExcelConverting }] = useConvertExcelToJsonMutation();
  const [convertJsonToExcel, { isLoading: isJsonConverting, reset: resetJsonToExcel }] = useConvertJsonToExcelMutation();
  const [scanReceipt, { isLoading: isReceiptScanning }] = useScanReceiptMutation();

  // Reset state on tab switch
  const handleTypeSelect = (type: ConversionType) => {
    setSelectedType(type);
  };

  // Safe transactions extraction from backend array or nested object
  const bankTransactions: BankTransaction[] = Array.isArray(bankData?.data)
    ? (bankData.data as BankTransaction[])
    : (bankData?.data?.transactions || []);

  // ────────────────────────── Bank Statement handlers ──────────────────────────
  const handleBankFileSelect = async (file: File) => {
    setBankFile(file);
    setBankData(null);
    setAsyncUploadStatus(null);

    // 1. Async Upload Flow (save to database for CA review)
    if (bankMode === 'async') {
      if (!selectedClientId) {
        showToast('Please select a client entity before uploading for vault review.', 'error');
        return;
      }
      try {
        const formData = new FormData();
        formData.append('statement', file);
        formData.append('clientId', selectedClientId);

        const response = await uploadStatementIntake(formData).unwrap();
        setAsyncUploadStatus(response.data);
        showToast(response.message || 'Statement accepted for processing in background!', 'success');
      } catch (error: any) {
        console.error('Failed to upload bank statement intake:', error);
        const errMsg = error?.data?.message || '';
        if (
          error?.status === 400 &&
          (errMsg.toLowerCase().includes('password') || errMsg === 'PDF_PASSWORD_PROTECTED')
        ) {
          setPasswordProtectedFileName(file.name);
          setIsPasswordModalOpen(true);
        }
        showToast(errMsg || 'Failed to process statement intake.', 'error');
      }
      return;
    }

    // 2. Direct Stateless Conversion Flow (on-the-fly parsing)
    try {
      const formData = new FormData();
      formData.append('statement', file);

      const response = await uploadBankStatement(formData).unwrap();
      setBankData(response);
      showToast('Statement parsed successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to parse bank statement:', error);
      const errMsg = error?.data?.message || '';
      if (
        error?.status === 400 &&
        (errMsg.toLowerCase().includes('password') || errMsg === 'PDF_PASSWORD_PROTECTED')
      ) {
        setPasswordProtectedFileName(file.name);
        setIsPasswordModalOpen(true);
      }
      showToast(errMsg || 'Failed to process the PDF statement.', 'error');
    }
  };

  const handleBankDownload = async (
    format: 'xml' | 'csv' | 'excel' | 'gst-json',
    companyName?: string,
    bankLedger?: string,
    fp?: string
  ) => {
    if (!bankFile) return;
    if (format === 'xml') setIsDownloadingBankXml(true);
    else if (format === 'csv') setIsDownloadingBankCsv(true);
    else if (format === 'excel') setIsDownloadingBankExcel(true);
    else if (format === 'gst-json') setIsDownloadingBankGstJson(true);

    try {
      const formData = new FormData();
      formData.append('statement', bankFile);

      const blob = await downloadBankStatementConvert({
        formData,
        format,
        companyName,
        bankLedger,
        fp,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let filename = 'bank_statement';
      if (format === 'xml') filename = `${companyName ? companyName.replace(/\s+/g, '_') : 'tally'}_vouchers.xml`;
      else if (format === 'csv') filename = 'bank_statement.csv';
      else if (format === 'excel') filename = 'bank_statement.xlsx';
      else filename = `statement_gstr1_${fp || 'period'}.json`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      resetDownloadBankStatement();
      showToast(`Downloaded ${format.toUpperCase()} successfully!`, 'success');
    } catch (error: any) {
      console.error(`Bank ${format} download failed:`, error);
      showToast(error?.data?.message || `Failed to download ${format.toUpperCase()}`, 'error');
    } finally {
      if (format === 'xml') setIsDownloadingBankXml(false);
      else if (format === 'csv') setIsDownloadingBankCsv(false);
      else if (format === 'excel') setIsDownloadingBankExcel(false);
      else if (format === 'gst-json') setIsDownloadingBankGstJson(false);
    }
  };

  // ────────────────────────── Invoice handlers ──────────────────────────────────
  const handleInvoiceFileSelect = async (file: File) => {
    setInvoiceFile(file);
    setInvoiceData(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoice', file);
      const response = await uploadInvoice(formData).unwrap();
      setInvoiceData(response.data);
      showToast('Invoice parsed successfully with AI!', 'success');
    } catch (error: any) {
      console.error('Failed to parse invoice:', error);
      showToast(error?.data?.message || 'Failed to process the invoice PDF.', 'error');
    }
  };

  const handleInvoiceDownload = async (format: 'xml' | 'csv') => {
    if (!invoiceFile) return;
    if (format === 'xml') setIsDownloadingInvoiceXml(true);
    else setIsDownloadingInvoiceCsv(true);

    try {
      const formData = new FormData();
      formData.append('file', invoiceFile);
      formData.append('invoice', invoiceFile);

      const blob = await downloadInvoiceConvert({ formData, format }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        format === 'xml'
          ? `invoice_${invoiceData?.invoiceNumber || 'extracted'}_tally.xml`
          : `invoice_${invoiceData?.invoiceNumber || 'extracted'}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      resetDownloadInvoice();
      showToast(`Downloaded ${format.toUpperCase()} successfully!`, 'success');
    } catch (error: any) {
      console.error(`Invoice ${format} download failed:`, error);
      showToast(error?.data?.message || `Failed to download ${format.toUpperCase()}`, 'error');
    } finally {
      if (format === 'xml') setIsDownloadingInvoiceXml(false);
      else setIsDownloadingInvoiceCsv(false);
    }
  };

  // ────────────────────────── Bulk Invoice OCR handlers ─────────────────────────
  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkFiles(Array.from(e.target.files));
      setBulkOcrResult(null);
    }
  };

  const handleRunBulkOcr = async () => {
    if (bulkFiles.length === 0) return;
    try {
      const formData = new FormData();
      bulkFiles.forEach((file) => formData.append('files', file));
      const res = await bulkOcr(formData).unwrap();
      setBulkOcrResult(res?.data || res);
      showToast(`Processed ${bulkFiles.length} invoices successfully`, 'success');
    } catch (err: any) {
      console.error('Bulk OCR error:', err);
      showToast(err?.data?.message || 'Failed to process bulk invoices', 'error');
    }
  };

  const handleDownloadBulkCsv = async () => {
    if (bulkFiles.length === 0) return;
    try {
      setIsDownloadingBulkCsv(true);
      const formData = new FormData();
      bulkFiles.forEach((file) => formData.append('files', file));

      const blob = await downloadBulkOcrCsv(formData).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk_invoices_report.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      resetDownloadBulkOcrCsv();
      showToast('Consolidated CSV downloaded successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to download CSV', 'error');
    } finally {
      setIsDownloadingBulkCsv(false);
    }
  };

  // ────────────────────────── Excel ↔ JSON handlers ────────────────────────────
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await convertExcelToJson({ file: formData, allSheets: true }).unwrap();
      setExcelResult(res.data);
      showToast('Excel converted to JSON successfully!', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to convert Excel', 'error');
    }
  };

  const handleJsonToExcelDownload = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        showToast('JSON must be a non-empty array of objects', 'error');
        return;
      }
      const blob = await convertJsonToExcel({ data: parsed, filename: 'fintecc_export.xlsx' }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fintecc_export.xlsx';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      resetJsonToExcel();
      showToast('Excel spreadsheet downloaded', 'success');
    } catch (err: any) {
      showToast('Invalid JSON format. Please check syntax.', 'error');
    }
  };

  // ────────────────────────── Receipt OCR handlers ──────────────────────────────
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await scanReceipt(formData).unwrap();
      setReceiptResult(res.data);
      showToast('Receipt scanned with AI successfully!', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to scan receipt image', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
          Financial Converters &amp; OCR Hub
        </h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Convert financial PDFs, invoices, spreadsheets, and receipt photos into clean Tally XML, JSON, or CSV.
        </p>
      </div>

      <ConversionTypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />

      {/* 1. Bank Statement Flow */}
      {selectedType === 'bank' && (
        <div className="space-y-4">
          {/* Dual-Mode Selector: Direct vs Async */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  {bankMode === 'direct' ? 'Direct On-the-fly Conversion' : 'Async Upload & CA Review'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {bankMode === 'direct'
                    ? 'Extracts transactions immediately without saving to client database.'
                    : 'Saves statement to client vault and queues for full 3-Tier AI Mapping.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBankMode('direct');
                  setAsyncUploadStatus(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  bankMode === 'direct'
                    ? 'bg-[#00C2B3] text-white shadow-sm'
                    : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-slate-500/10'
                }`}
              >
                Direct Convert
              </button>
              <button
                type="button"
                onClick={() => {
                  setBankMode('async');
                  setBankData(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  bankMode === 'async'
                    ? 'bg-[#00C2B3] text-white shadow-sm'
                    : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-slate-500/10'
                }`}
              >
                Save to Vault (CA Review)
              </button>
            </div>
          </div>

          {/* Client Entity Selector for Async Mode */}
          {bankMode === 'async' && (
            <div
              className="p-4 rounded-2xl border space-y-2 animate-fadeIn"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00C2B3]" />
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Select Client Entity <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={isLoadingClients}
                className="w-full text-xs px-3 py-2.5 rounded-xl border bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
              >
                <option value="">-- Choose a Client to link this statement --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                Required for saving to database. The statement will be assigned to this client.
              </p>
            </div>
          )}

          {/* File Uploader */}
          <FileUploader
            onFileSelect={handleBankFileSelect}
            isLoading={isBankUploading || isIntakeUploading}
          />

          {/* Async Upload Success Status (202 Accepted) */}
          {asyncUploadStatus && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 202 Accepted for Processing!
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {asyncUploadStatus.status}
                </span>
              </div>
              <p className="text-[12px] text-emerald-600 dark:text-emerald-400">
                {asyncUploadStatus.message || 'Statement uploaded successfully and is parsing in the background.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/dashboard/bank-statements/${asyncUploadStatus.statementId}/review`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00C2B3] text-white text-xs font-semibold hover:bg-[#00a89b] transition-colors"
                >
                  Open CA Review Grid <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/bank-statements"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium hover:bg-slate-500/10 transition-colors"
                >
                  View All Statements
                </Link>
              </div>
            </div>
          )}

          {/* Direct Mode Transactions Preview Table */}
          {bankTransactions.length > 0 && (
            <TransactionsPreview
              transactions={bankTransactions}
              onDownloadXml={(comp, ledger) => handleBankDownload('xml', comp, ledger)}
              onDownloadCsv={() => handleBankDownload('csv')}
              onDownloadExcel={() => handleBankDownload('excel')}
              onDownloadGstJson={(fp) => handleBankDownload('gst-json', undefined, undefined, fp)}
              isDownloadingXml={isDownloadingBankXml}
              isDownloadingCsv={isDownloadingBankCsv}
              isDownloadingExcel={isDownloadingBankExcel}
              isDownloadingGstJson={isDownloadingBankGstJson}
            />
          )}
        </div>
      )}

      {/* 2. Single Invoice Flow */}
      {selectedType === 'invoice' && (
        <>
          <FileUploader onFileSelect={handleInvoiceFileSelect} isLoading={isInvoiceUploading} />
          {invoiceData && (
            <InvoicePreview
              invoice={invoiceData}
              onDownloadXml={() => handleInvoiceDownload('xml')}
              onDownloadCsv={() => handleInvoiceDownload('csv')}
              isDownloadingXml={isDownloadingInvoiceXml}
              isDownloadingCsv={isDownloadingInvoiceCsv}
            />
          )}
        </>
      )}

      {/* 3. Bulk Invoice OCR Flow */}
      {selectedType === 'bulk-ocr' && (
        <div
          className="rounded-2xl p-6 shadow-sm space-y-6"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Bulk Invoice PDF Batch Processing
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Upload up to 50 PDF invoices at once. AI will parse each invoice and create a consolidated statement.
            </p>
          </div>

          <div
            className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <input
              type="file"
              multiple
              accept="application/pdf"
              id="bulk-pdf-input"
              onChange={handleBulkFilesSelect}
              className="hidden"
            />
            <label htmlFor="bulk-pdf-input" className="cursor-pointer space-y-2 flex flex-col items-center">
              <div className="p-3 rounded-full bg-[#00C2B3]/10 text-[#00C2B3]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {bulkFiles.length > 0
                  ? `${bulkFiles.length} PDF files selected`
                  : 'Click to select multiple invoice PDFs'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Hold Ctrl / Cmd or Shift to select multiple files
              </p>
            </label>
          </div>

          {bulkFiles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Selected: {bulkFiles.map((f) => f.name).slice(0, 3).join(', ')}
                {bulkFiles.length > 3 ? ` + ${bulkFiles.length - 3} more` : ''}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownloadBulkCsv}
                  isLoading={isDownloadingBulkCsv}
                  variant="outline"
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Download Combined CSV
                </Button>
                <Button
                  onClick={handleRunBulkOcr}
                  isLoading={isBulkOcrUploading}
                  leftIcon={<Receipt className="w-4 h-4" />}
                >
                  Process All Invoices
                </Button>
              </div>
            </div>
          )}

          {bulkOcrResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Batch Complete!
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Processed successfully. You can now download the consolidated CSV report above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Excel ↔ JSON Flow */}
      {selectedType === 'excel-json' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Excel to JSON */}
          <div
            className="rounded-2xl p-6 shadow-sm space-y-4"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <FileSpreadsheet className="w-4 h-4 text-[#00C2B3]" /> Excel / CSV to JSON
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Convert any spreadsheet into structured JSON with multi-sheet support.
              </p>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              id="excel-upload"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <label
              htmlFor="excel-upload"
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer flex flex-col items-center gap-2 hover:border-[#00C2B3] transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <UploadCloud className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {excelFile ? excelFile.name : 'Upload .xlsx or .csv file'}
              </span>
            </label>

            {excelResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    JSON Output ({excelResult.rowCount || excelResult.totalRows || 0} rows)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(excelResult.data, null, 2));
                      setIsCopiedJson(true);
                      showToast('JSON copied to clipboard!', 'success');
                      setTimeout(() => setIsCopiedJson(false), 2000);
                    }}
                    className="text-xs flex items-center gap-1 text-[#00C2B3] hover:underline"
                  >
                    {isCopiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy JSON
                  </button>
                </div>
                <pre
                  className="p-3 rounded-xl text-[11px] font-mono max-h-48 overflow-y-auto"
                  style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)' }}
                >
                  {JSON.stringify(excelResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* JSON to Excel */}
          <div
            className="rounded-2xl p-6 shadow-sm space-y-4"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <FileCode2 className="w-4 h-4 text-[#00C2B3]" /> JSON to Excel (.xlsx)
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Paste JSON array of objects to generate and download an Excel spreadsheet.
              </p>
            </div>

            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-3 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />

            <Button
              onClick={handleJsonToExcelDownload}
              isLoading={isJsonConverting}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Download Excel File
            </Button>
          </div>
        </div>
      )}

      {/* 5. Receipt Photo OCR Flow */}
      {selectedType === 'receipt' && (
        <div
          className="rounded-2xl p-6 shadow-sm space-y-6"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Receipt Photo AI Scanner
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Upload any phone picture or scanned receipt image (JPEG, PNG, WEBP). Gemini AI will extract amounts and vendor info.
            </p>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            id="receipt-photo-upload"
            onChange={handleReceiptUpload}
            className="hidden"
          />
          <label
            htmlFor="receipt-photo-upload"
            className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer flex flex-col items-center gap-2 hover:border-[#00C2B3] transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <UploadCloud className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {receiptFile ? receiptFile.name : 'Upload Receipt Photo (JPEG / PNG)'}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              High-resolution photo or mobile snapshot
            </span>
          </label>

          {isReceiptScanning && (
            <div className="p-6 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[#00C2B3] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Gemini AI is analyzing receipt layout and extracting values...
              </p>
            </div>
          )}

          {receiptResult && (
            <div
              className="p-5 rounded-xl border space-y-4"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {receiptResult.extractedData?.merchantName || 'Extracted Receipt'}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Date: {receiptResult.extractedData?.date || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    Total
                  </span>
                  <p className="text-base font-bold text-[#00C2B3]">
                    ₹{Number(receiptResult.extractedData?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {receiptResult.extractedData?.items && receiptResult.extractedData.items.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Extracted Items
                  </span>
                  <div className="space-y-1">
                    {receiptResult.extractedData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{item.description}</span>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          ₹{Number(item.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Password Protected PDF Modal */}
      <PasswordProtectedModal
        isOpen={isPasswordModalOpen}
        fileName={passwordProtectedFileName}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}

export default function ConvertersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>}>
      <ConvertersPageContent />
    </Suspense>
  );
}
