'use client';

import React, { useState } from 'react';
import { ConversionType, ConversionTypeSelector } from '@/components/pdf-to-xml/ConversionTypeSelector';
import { FileUploader } from '@/components/pdf-to-xml/FileUploader';
import { TransactionsPreview } from '@/components/pdf-to-xml/TransactionsPreview';
import { useUploadBankStatementMutation } from '@/lib/store/api/bankStatementsApi';
import { BankStatementResponse } from '@/lib/types/bankStatement.types';

export default function PdfToXmlPage() {
  const [selectedType, setSelectedType] = useState<ConversionType>('bank');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BankStatementResponse | null>(null);
  
  const [uploadBankStatement, { isLoading: isUploading }] = useUploadBankStatementMutation();
  const [isDownloadingXml, setIsDownloadingXml] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);

  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    setParsedData(null); // reset

    try {
      const formData = new FormData();
      formData.append('statement', file);

      // RTK Query upload
      const response = await uploadBankStatement(formData).unwrap();
      setParsedData(response);
    } catch (error: any) {
      console.error('Failed to parse statement', error);
      alert(error?.data?.message || 'Failed to process the PDF statement.');
    }
  };

  const handleDownload = async (format: 'xml' | 'csv') => {
    if (!currentFile) return;
    
    if (format === 'xml') setIsDownloadingXml(true);
    if (format === 'csv') setIsDownloadingCsv(true);

    try {
      const formData = new FormData();
      formData.append('statement', currentFile);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/bank-statements/convert?format=${format}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()}`);
      }

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
      console.error(`Download ${format} failed`, error);
      alert(`Failed to download ${format.toUpperCase()}`);
    } finally {
      if (format === 'xml') setIsDownloadingXml(false);
      if (format === 'csv') setIsDownloadingCsv(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#091124]">PDF to XML Converter</h1>
        <p className="text-slate-500 mt-0.5 text-[13px]">
          Convert financial PDFs into structured, machine-readable XML in seconds.
        </p>
      </div>

      <ConversionTypeSelector 
        selectedType={selectedType} 
        onSelect={setSelectedType} 
      />

      <FileUploader 
        onFileSelect={handleFileSelect} 
        isLoading={isUploading}
      />

      {parsedData?.data?.transactions && (
        <TransactionsPreview 
          transactions={parsedData.data.transactions}
          onDownloadXml={() => handleDownload('xml')}
          onDownloadCsv={() => handleDownload('csv')}
          isDownloadingXml={isDownloadingXml}
          isDownloadingCsv={isDownloadingCsv}
        />
      )}
    </div>
  );
}
