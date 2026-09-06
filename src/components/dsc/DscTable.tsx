'use client';

import React, { useState } from 'react';
import { 
  Key, 
  MapPin, 
  Calendar, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck,
  Building2,
  Search,
  Filter
} from 'lucide-react';
import type { DscToken } from '@/lib/types/dsc.types';
import { useDeleteDscMutation } from '@/lib/store/api/dscApi';
import { useToast } from '@/components/ui/Toast';

interface DscTableProps {
  tokens: DscToken[];
  isLoading: boolean;
  onEdit: (token: DscToken) => void;
}

export const DscTable: React.FC<DscTableProps> = ({ tokens, isLoading, onEdit }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [deleteDsc, { isLoading: isDeleting }] = useDeleteDscMutation();
  const { showToast } = useToast();

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPassword = (id: string, pwd?: string) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopiedId(id);
    showToast('Password copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, ownerName: string) => {
    if (!confirm(`Are you sure you want to delete the DSC token for ${ownerName}?`)) return;
    try {
      await deleteDsc(id).unwrap();
      showToast('DSC token deleted successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete DSC token', 'error');
    }
  };

  const getDaysRemaining = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      token.provider.toLowerCase().includes(search.toLowerCase()) ||
      token.storageLocation.toLowerCase().includes(search.toLowerCase()) ||
      (token.client?.name && token.client.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || token.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by owner, client, provider, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Owner & Client</th>
              <th className="py-3.5 px-4">Provider</th>
              <th className="py-3.5 px-4">Storage Location</th>
              <th className="py-3.5 px-4">PIN / Password</th>
              <th className="py-3.5 px-4">Expiry Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading DSC tokens...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <Key className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-700">No DSC tokens found</p>
                  <p className="text-xs text-slate-400 mt-1">Add a new DSC token or adjust your filters.</p>
                </td>
              </tr>
            ) : (
              filteredTokens.map((token) => {
                const daysRemaining = getDaysRemaining(token.expiryDate);
                const isPasswordVisible = !!visiblePasswords[token.id];
                const isCopied = copiedId === token.id;

                let expiryBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let expiryText = `${daysRemaining} days left`;
                if (daysRemaining < 0) {
                  expiryBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  expiryText = `Expired ${Math.abs(daysRemaining)} days ago`;
                } else if (daysRemaining <= 7) {
                  expiryBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  expiryText = `${daysRemaining}d left (Critical)`;
                } else if (daysRemaining <= 30) {
                  expiryBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  expiryText = `${daysRemaining}d left (Expiring)`;
                }

                return (
                  <tr key={token.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{token.ownerName}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{token.client?.name || 'Unassigned Client'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {token.provider}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{token.storageLocation || 'Not specified'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {token.password ? (
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-800 border border-slate-200">
                            {isPasswordVisible ? token.password : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePassword(token.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition"
                            title={isPasswordVisible ? 'Hide password' : 'Show password'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyPassword(token.id, token.password)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition"
                            title="Copy password"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No PIN recorded</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(token.expiryDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${expiryBadgeClass}`}>
                          {expiryText}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {token.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      {token.status === 'EXPIRING_SOON' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Expiring Soon
                        </span>
                      )}
                      {token.status === 'EXPIRED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Expired
                        </span>
                      )}
                      {token.status === 'REVOKED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300">
                          Revoked
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(token)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit DSC"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(token.id, token.ownerName)}
                          disabled={isDeleting}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete DSC"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
