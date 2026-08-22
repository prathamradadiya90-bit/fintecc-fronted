'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversionType, ConversionTypeSelector } from '@/components/pdf-to-xml/ConversionTypeSelector';
import { FileUploader } from '@/components/pdf-to-xml/FileUploader';
import { TransactionsPreview } from '@/components/pdf-to-xml/TransactionsPreview';
import { InvoicePreview } from '@/components/invoice-converter/InvoicePreview';
import { Button } from '@/components/ui/Button';
import { useUploadBankStatementMutation } from '@/lib/store/api/bankStatementsApi';
import { useUploadInvoiceMutation, useBulkOcrMutation } from '@/lib/store/api/invoicesApi';
import {
  useConvertExcelToJsonMutation,
  useConvertJsonToExcelMutation,
  useScanReceiptMutation,
} from '@/lib/store/api/convertersApi';
import { useToast } from '@/components/ui/Toast';
import { BankStatementResponse } from '@/lib/types/bankStatement.types';
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
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
  const [isDownloadingBankXml, setIsDownloadingBankXml] = useState(false);
  const [isDownloadingBankCsv, setIsDownloadingBankCsv] = useState(false);

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

  // RTK Mutations
  const [uploadBankStatement, { isLoading: isBankUploading }] = useUploadBankStatementMutation();
  const [uploadInvoice, { isLoading: isInvoiceUploading }] = useUploadInvoiceMutation();
  const [bulkOcr, { isLoading: isBulkOcrUploading }] = useBulkOcrMutation();
  const [convertExcelToJson, { isLoading: isExcelConverting }] = useConvertExcelToJsonMutation();
  const [convertJsonToExcel, { isLoading: isJsonConverting }] = useConvertJsonToExcelMutation();
  const [scanReceipt, { isLoading: isReceiptScanning }] = useScanReceiptMutation();

  // Reset state on tab switch
  const handleTypeSelect = (type: ConversionType) => {
    setSelectedType(type);
  };

  // ────────────────────────── Bank Statement handlers ──────────────────────────
  const handleBankFileSelect = async (file: File) => {
    setBankFile(file);
    setBankData(null);
    try {
      const formData = new FormData();
      formData.append('statement', file);
      const response = await uploadBankStatement(formData).unwrap();
      setBankData(response);
    } catch (error: any) {
      console.error('Failed to parse bank statement:', error);
      showToast(error?.data?.message || 'Failed to process the PDF statement.', 'error');
    }
  };

  const handleBankDownload = async (format: 'xml' | 'csv') => {
    if (!bankFile) return;
    if (format === 'xml') setIsDownloadingBankXml(true);
    else setIsDownloadingBankCsv(true);

    try {
      const formData = new FormData();
      formData.append('statement', bankFile);
      const response = await fetch(
        `${API_BASE}/bank-statements/convert?format=${format}`,
        { method: 'POST', body: formData, credentials: 'include' }
      );
      if (!response.ok) throw new Error(`Failed to download ${format.toUpperCase()}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'xml' ? 'tally_vouchers.xml' : 'bank_statement.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Bank ${format} download failed:`, error);
      showToast(`Failed to download ${format.toUpperCase()}`, 'error');
    } finally {
      if (format === 'xml') setIsDownloadingBankXml(false);
      else setIsDownloadingBankCsv(false);
    }
  };

  // ────────────────────────── Invoice handlers ──────────────────────────────────
  const handleInvoiceFileSelect = async (file: File) => {
    setInvoiceFile(file);
    setInvoiceData(null);
    try {
      const formData = new FormData();
      formData.append('invoice', file);
      const response = await uploadInvoice(formData).unwrap();
      setInvoiceData(response.data);
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
      formData.append('invoice', invoiceFile);
      const response = await fetch(
        `${API_BASE}/invoices/convert?format=${format}`,
        { method: 'POST', body: formData, credentials: 'include' }
      );
      if (!response.ok) throw new Error(`Failed to download ${format.toUpperCase()}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        format === 'xml'
          ? `invoice_${invoiceData?.invoiceNumber || 'extracted'}_tally.xml`
          : `invoice_${invoiceData?.invoiceNumber || 'extracted'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Invoice ${format} download failed:`, error);
      showToast(`Failed to download ${format.toUpperCase()}`, 'error');
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
      const response = await fetch(`${API_BASE}/invoices/bulk-ocr?format=csv`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to download bulk CSV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk_invoices_report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Consolidated CSV downloaded', 'success');
    } catch (err) {
      showToast('Failed to download CSV', 'error');
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
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
          Financial Converters & OCR Hub
        </h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Convert financial PDFs, invoices, spreadsheets, and receipt photos into clean Tally XML, JSON, or CSV.
        </p>
      </div>

      <ConversionTypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />

      {/* 1. Bank Statement Flow */}
      {selectedType === 'bank' && (
        <>
          <FileUploader onFileSelect={handleBankFileSelect} isLoading={isBankUploading} />
          {bankData?.data?.transactions && (
            <TransactionsPreview
              transactions={bankData.data.transactions}
              onDownloadXml={() => handleBankDownload('xml')}
              onDownloadCsv={() => handleBankDownload('csv')}
              isDownloadingXml={isDownloadingBankXml}
              isDownloadingCsv={isDownloadingBankCsv}
            />
          )}
        </>
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
