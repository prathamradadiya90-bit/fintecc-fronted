'use client';

import React, { useState, useMemo } from 'react';
import { 
  Key, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  XCircle,
  Lock
} from 'lucide-react';
import { useGetDscsQuery } from '@/lib/store/api/dscApi';
import { DscTable } from '@/components/dsc/DscTable';
import { AddDscModal } from '@/components/dsc/AddDscModal';
import { UpdateDscLocationModal } from '@/components/dsc/UpdateDscLocationModal';
import type { DscToken } from '@/lib/types/dsc.types';

export default function DscTrackerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenToEdit, setTokenToEdit] = useState<DscToken | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationToken, setLocationToken] = useState<DscToken | null>(null);

  const { data: dscResponse, isLoading, refetch, isFetching } = useGetDscsQuery({ limit: 1000 });
  const tokens = useMemo(() => dscResponse?.data || [], [dscResponse]);

  const metrics = useMemo(() => {
    const total = tokens.length;
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;

    const now = new Date().getTime();

    tokens.forEach((t) => {
      const expiry = new Date(t.expiryDate).getTime();
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || t.status === 'EXPIRED') {
        expired++;
      } else if (diffDays <= 30 || t.status === 'EXPIRING_SOON') {
        expiringSoon++;
      } else if (t.status === 'ACTIVE') {
        active++;
      }
    });

    return { total, active, expiringSoon, expired };
  }, [tokens]);

  const handleOpenAddModal = () => {
    setTokenToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditToken = (token: DscToken) => {
    setTokenToEdit(token);
    setIsModalOpen(true);
  };

  const handleUpdateLocation = (token: DscToken) => {
    setLocationToken(token);
    setIsLocationModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              DSC Token Tracker &amp; Vault
            </h1>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Securely track client digital signature tokens, PINs, physical locations, and upcoming expirations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 border rounded-xl shadow-xs transition"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Register New DSC
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-slate-500/10 text-slate-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Tokens</p>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{metrics.total}</h3>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Active &amp; Valid</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.active}</h3>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Expiring in 30 Days</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">{metrics.expiringSoon}</h3>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Expired / Critical</p>
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">{metrics.expired}</h3>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DscTable
        tokens={tokens}
        isLoading={isLoading}
        onEdit={handleEditToken}
        onUpdateLocation={handleUpdateLocation}
      />

      {/* Add / Edit Modal */}
      <AddDscModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTokenToEdit(null);
        }}
        editingToken={tokenToEdit}
      />

      {/* Update Physical Location Modal */}
      <UpdateDscLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setLocationToken(null);
        }}
        token={locationToken}
      />
    </div>
  );
}
