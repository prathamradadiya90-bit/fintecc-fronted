'use client';

import React, { useState, useMemo } from 'react';
import { StandardizedSaleItem } from '@/lib/types/ecommerce.types';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SalesTableProps {
  sales: StandardizedSaleItem[];
}

export function SalesTable({ sales }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SALE' | 'RETURN'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const isReturn = (item.taxableValue < 0) || item.transactionType === 'RETURN';
      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'SALE' && !isReturn) ||
        (typeFilter === 'RETURN' && isReturn);

      return matchesSearch && matchesType;
    });
  }, [sales, searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Table Header & Controls */}
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-[var(--color-border)]">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
            Standardized Vouchers ({sales.length.toLocaleString('en-IN')})
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Individual sales transactions mapped to Tally Master schema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center border rounded-xl p-0.5 text-xs bg-[var(--color-bg-elevated)] border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => { setTypeFilter('ALL'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-[#00C2B3] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => { setTypeFilter('SALE'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                typeFilter === 'SALE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Sales
            </button>
            <button
              type="button"
              onClick={() => { setTypeFilter('RETURN'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                typeFilter === 'RETURN'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Returns
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order, SKU, state..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr
              className="border-b"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <th className="py-2.5 px-3.5 font-semibold">Order ID</th>
              <th className="py-2.5 px-3.5 font-semibold">Date</th>
              <th className="py-2.5 px-3.5 font-semibold">SKU / Item</th>
              <th className="py-2.5 px-3.5 font-semibold text-center">Qty</th>
              <th className="py-2.5 px-3.5 font-semibold text-right">Taxable Value</th>
              <th className="py-2.5 px-3.5 font-semibold text-center">GST Rate</th>
              <th className="py-2.5 px-3.5 font-semibold text-right">IGST</th>
              <th className="py-2.5 px-3.5 font-semibold text-right">CGST+SGST</th>
              <th className="py-2.5 px-3.5 font-semibold">Place of Supply</th>
              <th className="py-2.5 px-3.5 font-semibold text-center">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-xs text-[var(--color-text-secondary)]">
                  No transactions match your current search or filter.
                </td>
              </tr>
            ) : (
              paginatedSales.map((item, index) => {
                const isReturn = (item.taxableValue < 0) || item.transactionType === 'RETURN';
                const totalCgstSgst = (Number(item.cgst) || 0) + (Number(item.sgst) || 0);

                return (
                  <tr
                    key={item.orderId ? `${item.orderId}-${index}` : index}
                    className="hover:bg-[var(--color-bg-card-hover)] transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {item.orderId || item.invoiceNumber || `REC-${index + 1}`}
                    </td>
                    <td className="py-2.5 px-3.5 text-[var(--color-text-secondary)]">
                      {item.orderDate || '—'}
                    </td>
                    <td className="py-2.5 px-3.5 max-w-[160px] truncate" title={item.sku || ''}>
                      {item.sku || 'Default SKU'}
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-medium">
                      {item.quantity || 1}
                    </td>
                    <td
                      className={`py-2.5 px-3.5 text-right font-medium ${
                        isReturn ? 'text-rose-500' : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      ₹{Math.abs(item.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-[var(--color-text-secondary)]">
                        {item.gstRate ? `${item.gstRate}%` : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-[var(--color-text-secondary)]">
                      {item.igst ? `₹${Number(item.igst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-[var(--color-text-secondary)]">
                      {totalCgstSgst > 0 ? `₹${totalCgstSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="truncate block max-w-[130px]" title={item.state || item.pos || ''}>
                        {item.state || item.pos || 'Default State'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isReturn
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                            : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                        }`}
                      >
                        {isReturn ? 'Return' : 'Sales'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 border-t flex items-center justify-between text-xs border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)]">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredSales.length)} of{' '}
            {filteredSales.length} records
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded-lg border text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed border-[var(--color-border)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1 rounded-lg border text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed border-[var(--color-border)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
