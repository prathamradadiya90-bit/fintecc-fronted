'use client';

import React, { useState } from 'react';
import { 
  Boxes, 
  BookOpen, 
  Plus, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';

interface BulkLedgerRow {
  id: string;
  name: string;
  parent: string;
  openingBalance: number;
  gstin: string;
}

interface BulkStockRow {
  id: string;
  name: string;
  parent: string;
  uom: string;
  quantity: number;
  rate: number;
  hsnCode: string;
}

export default function BulkMastersPage() {
  const { data: profilesData } = useGetProfilesQuery();
  const profiles = profilesData?.data || [];
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [tab, setTab] = useState<'ledgers' | 'items'>('ledgers');
  const [isLoading, setIsLoading] = useState(false);

  const activeClientId = selectedClientId || profiles[0]?.clientId || '';
  const selectedProfile = profiles.find(p => p.clientId === activeClientId);

  // Bulk Ledgers State
  const [ledgers, setLedgers] = useState<BulkLedgerRow[]>([
    { id: '1', name: '', parent: 'Sundry Debtors', openingBalance: 0, gstin: '' },
    { id: '2', name: '', parent: 'Sundry Creditors', openingBalance: 0, gstin: '' }
  ]);

  // Bulk Stock Items State
  const [items, setItems] = useState<BulkStockRow[]>([
    { id: '1', name: '', parent: 'Primary', uom: 'NOS', quantity: 0, rate: 0, hsnCode: '' }
  ]);

  const addLedgerRow = () => {
    setLedgers([...ledgers, { id: String(Date.now()), name: '', parent: 'Sundry Debtors', openingBalance: 0, gstin: '' }]);
  };

  const removeLedgerRow = (idx: number) => {
    if (ledgers.length <= 1) return;
    setLedgers(ledgers.filter((_, i) => i !== idx));
  };

  const updateLedger = (idx: number, field: keyof BulkLedgerRow, val: any) => {
    const updated = [...ledgers];
    updated[idx] = { ...updated[idx], [field]: val };
    setLedgers(updated);
  };

  const addItemRow = () => {
    setItems([...items, { id: String(Date.now()), name: '', parent: 'Primary', uom: 'NOS', quantity: 0, rate: 0, hsnCode: '' }]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof BulkStockRow, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  };

  const handlePushBulkMasters = async () => {
    setIsLoading(true);
    try {
      const isLedger = tab === 'ledgers';
      const validItems = isLedger
        ? ledgers.filter(l => l.name.trim().length > 0)
        : items.filter(it => it.name.trim().length > 0);

      if (validItems.length === 0) {
        alert('Please enter at least one valid master name.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/v1/tally/sync/bulk-masters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          masterType: isLedger ? 'LEDGER' : 'STOCK_ITEM',
          items: validItems,
          companyName: selectedProfile?.legalName || selectedProfile?.tradeName || 'Company Name'
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to queue masters');

      alert(`Successfully queued ${validItems.length} ${isLedger ? 'ledgers' : 'stock items'} to Tally Prime sync queue!`);
    } catch (err: any) {
      alert(err.message || 'Error pushing bulk masters');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Tally Integration</span>
            <span>/</span>
            <span className="text-[var(--color-text-heading)] font-medium">Bulk Masters Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-heading)]">
            Bulk Master Creation (Tally Bridge)
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Rapidly create multiple Ledgers and Stock Items in Tally Prime without manual keying.
          </p>
        </div>

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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)]">
        <button
          onClick={() => setTab('ledgers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            tab === 'ledgers'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Bulk Ledgers
        </button>

        <button
          onClick={() => setTab('items')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            tab === 'items'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" /> Bulk Stock Items
        </button>
      </div>

      {/* Table Editor */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-[var(--color-text-heading)]">
            {tab === 'ledgers' ? 'Ledgers Creation Grid' : 'Stock Items Creation Grid'}
          </h3>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={tab === 'ledgers' ? addLedgerRow : addItemRow}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Row
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={handlePushBulkMasters}
              isLoading={isLoading}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Push to Tally Connector
            </Button>
          </div>
        </div>

        {tab === 'ledgers' ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th className="p-2.5 font-semibold">Ledger Name</th>
                  <th className="p-2.5 font-semibold">Parent Group</th>
                  <th className="p-2.5 font-semibold">GSTIN (Optional)</th>
                  <th className="p-2.5 font-semibold text-right">Opening Balance (₹)</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {ledgers.map((row, idx) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="e.g. Acme Tech Pvt Ltd"
                        value={row.name}
                        onChange={(e) => updateLedger(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-medium"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={row.parent}
                        onChange={(e) => updateLedger(idx, 'parent', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]"
                      >
                        <option value="Sundry Debtors">Sundry Debtors</option>
                        <option value="Sundry Creditors">Sundry Creditors</option>
                        <option value="Bank Accounts">Bank Accounts</option>
                        <option value="Sales Accounts">Sales Accounts</option>
                        <option value="Purchase Accounts">Purchase Accounts</option>
                        <option value="Direct Expenses">Direct Expenses</option>
                        <option value="Indirect Expenses">Indirect Expenses</option>
                        <option value="Duties & Taxes">Duties & Taxes</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="27AAAAA0000A1Z5"
                        maxLength={15}
                        value={row.gstin}
                        onChange={(e) => updateLedger(idx, 'gstin', e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-mono uppercase"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.openingBalance || ''}
                        onChange={(e) => updateLedger(idx, 'openingBalance', parseFloat(e.target.value) || 0)}
                        className="w-full text-right px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-mono"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeLedgerRow(idx)}
                        className="text-slate-400 hover:text-rose-500"
                        disabled={ledgers.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th className="p-2.5 font-semibold">Stock Item Name</th>
                  <th className="p-2.5 font-semibold">Stock Group</th>
                  <th className="p-2.5 font-semibold">Unit (UOM)</th>
                  <th className="p-2.5 font-semibold">HSN/SAC</th>
                  <th className="p-2.5 font-semibold text-right">Opening Qty</th>
                  <th className="p-2.5 font-semibold text-right">Rate (₹)</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="e.g. Cotton Shirt - Size M"
                        value={row.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-medium"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Primary"
                        value={row.parent}
                        onChange={(e) => updateItem(idx, 'parent', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={row.uom}
                        onChange={(e) => updateItem(idx, 'uom', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]"
                      >
                        <option value="NOS">NOS (Numbers)</option>
                        <option value="PCS">PCS (Pieces)</option>
                        <option value="KGS">KGS (Kilograms)</option>
                        <option value="BOX">BOX (Boxes)</option>
                        <option value="MTR">MTR (Meters)</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="e.g. 6205"
                        value={row.hsnCode}
                        onChange={(e) => updateItem(idx, 'hsnCode', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.quantity || ''}
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full text-right px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.rate || ''}
                        onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full text-right px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] font-mono"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-400 hover:text-rose-500"
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

