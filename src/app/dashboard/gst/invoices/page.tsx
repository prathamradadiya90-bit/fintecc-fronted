'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Receipt, Search, Plus, Download, FileSpreadsheet, ArrowRight, Building2 } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetGstInvoicesQuery, useGetProfilesQuery } from '@/lib/store/api/gstApi';
import { ExportSalesButton } from '@/features/gst/components/ExportSalesButton';
import type { GstInvoice } from '@/lib/types/gst.types';

function GstInvoicesMainContent() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get('clientId') || '';

  const { data: profilesData } = useGetProfilesQuery();
  const profiles = profilesData?.data || [];

  const [selectedClientId, setSelectedClientId] = useState<string>(urlClientId);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const activeClientId = selectedClientId || urlClientId || profiles[0]?.clientId || '';

  const { data: invoicesData, isLoading } = useGetGstInvoicesQuery(
    activeClientId,
    { skip: !activeClientId }
  );

  const invoices = invoicesData?.data || [];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesType = typeFilter === 'ALL' || inv.invoiceType === typeFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.gstin.toLowerCase().includes(q) ||
      (inv.sellerGSTIN && inv.sellerGSTIN.toLowerCase().includes(q)) ||
      (inv.buyerGSTIN && inv.buyerGSTIN.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const columns: Column<GstInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice # & Date',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs" style={{ color: 'var(--color-text-heading)' }}>
            {item.invoiceNumber}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString('en-IN') : 'Date N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'gstin',
      header: 'GSTIN',
      render: (item) => (
        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {item.gstin}
        </span>
      ),
    },
    {
      key: 'invoiceType',
      header: 'Invoice Type',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          {item.invoiceType}
        </span>
      ),
    },
    {
      key: 'taxableValue',
      header: 'Taxable Value',
      render: (item) => (
        <span className="font-medium text-xs" style={{ color: 'var(--color-text-primary)' }}>
          ₹{Number(item.taxableValue || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'tax',
      header: 'CGST + SGST / IGST',
      render: (item) => {
        const cgst = Number(item.cgst || 0);
        const sgst = Number(item.sgst || 0);
        const igst = Number(item.igst || 0);
        return (
          <div className="flex flex-col text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {igst > 0 ? (
              <span>IGST: ₹{igst.toLocaleString('en-IN')}</span>
            ) : (
              <span>CGST+SGST: ₹{(cgst + sgst).toLocaleString('en-IN')}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      render: (item) => (
        <span className="font-bold text-xs" style={{ color: 'var(--color-text-heading)' }}>
          ₹{Number(item.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
              <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              GST Invoices & Sales Register
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {filteredInvoices.length} {filteredInvoices.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Outward and inward invoice registers used for GSTR-1 preparation and GSTR-2B ITC matching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {profiles.length > 0 && (
            <select
              value={activeClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Client GSTINs</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.clientId}>
                  {p.gstin} ({p.legalName || p.tradeName})
                </option>
              ))}
            </select>
          )}

          <ExportSalesButton year={new Date().getFullYear()} className="text-xs h-8 px-2.5" />

          <Link
            href="/dashboard/accounting/import"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors h-8"
          >
            Import Tally / Excel <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search Invoice #, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="text-xs h-8"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Type:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Invoices</option>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="CREDIT_NOTE">Credit Note</option>
              <option value="DEBIT_NOTE">Debit Note</option>
            </select>
          </div>
        </div>

        {activeClientId ? (
          <Table
            data={filteredInvoices}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No GST invoices recorded for this client. Import invoices from Excel or Tally XML to compute tax liabilities."
          />
        ) : (
          <div className="p-8 text-center rounded-xl bg-[var(--color-bg-subtle)] space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="text-xs font-bold text-[var(--color-text-heading)]">No GST Client Selected</h4>
            <p className="text-xs text-[var(--color-text-secondary)]">Please select an entity above or add a GST profile to view invoices.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GstInvoicesPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
        Loading Invoices Register...
      </div>
    }>
      <GstInvoicesMainContent />
    </Suspense>
  );
}
