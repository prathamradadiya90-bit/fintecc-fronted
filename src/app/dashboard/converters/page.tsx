'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversionType, ConversionTypeSelector } from '@/components/pdf-to-xml/ConversionTypeSelector';
import { FileUploader } from '@/components/pdf-to-xml/FileUploader';
import { TransactionsPreview } from '@/components/pdf-to-xml/TransactionsPreview';
import { InvoicePreview } from '@/components/invoice-converter/InvoicePreview';
import { useUploadBankStatementMutation } from '@/lib/store/api/bankStatementsApi';
import { useUploadInvoiceMutation } from '@/lib/store/api/invoicesApi';
import { BankStatementResponse } from '@/lib/types/bankStatement.types';
import { ExtractedInvoice } from '@/lib/types/invoice.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function ConvertersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type') as ConversionType | null;

  const [selectedType, setSelectedType] = useState<ConversionType>(
    typeParam === 'bank' || typeParam === 'invoice' ? typeParam : 'invoice'
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

  const [uploadBankStatement, { isLoading: isBankUploading }] = useUploadBankStatementMutation();
  const [uploadInvoice, { isLoading: isInvoiceUploading }] = useUploadInvoiceMutation();

  // Reset all result state when the user switches conversion type
  const handleTypeSelect = (type: ConversionType) => {
    setSelectedType(type);
    setBankData(null);
    setInvoiceData(null);
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
      alert(error?.data?.message || 'Failed to process the PDF statement.');
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
      alert(`Failed to download ${format.toUpperCase()}`);
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
      alert(error?.data?.message || 'Failed to process the invoice PDF.');
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
      alert(`Failed to download ${format.toUpperCase()}`);
    } finally {
      if (format === 'xml') setIsDownloadingInvoiceXml(false);
      else setIsDownloadingInvoiceCsv(false);
    }
  };

  const isInvoiceMode = selectedType === 'invoice';
  const isBankMode = selectedType === 'bank';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>PDF Converter</h1>
        <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          Convert financial PDFs into structured, machine-readable XML or CSV in seconds.
        </p>
      </div>

      <ConversionTypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />

      {/* Bank Statement Flow */}
      {isBankMode && (
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

      {/* Invoice Flow */}
      {isInvoiceMode && (
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
