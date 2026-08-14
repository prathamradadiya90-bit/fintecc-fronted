'use client';

import React from 'react';
import { Receipt } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';

export default function GstInvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            GST Invoices & ITC Matching
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Upload sales & purchase invoices to compute tax liabilities and perform 2B/2A ITC reconciliation.
          </p>
        </div>
      </div>

      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <Table
          data={[]}
          columns={[
            { key: 'invoiceNumber', header: 'Invoice #' },
            { key: 'gstin', header: 'GSTIN' },
            { key: 'type', header: 'Type' },
            { key: 'taxableValue', header: 'Taxable Amount' },
            { key: 'totalAmount', header: 'Total Value' },
            { key: 'status', header: 'Status' },
          ]}
          keyExtractor={(item) => (item as any).id}
          emptyMessage="No invoices uploaded yet. Select a client to import sales and purchase invoices for ITC computation."
        />
      </div>
    </div>
  );
}
