'use client';

import React, { useState } from 'react';
import { Building2, Link as LinkIcon, ShieldCheck, Plus, Key } from 'lucide-react';
import { useGetLinkedGstinsQuery, useLinkGstinMutation } from '@/lib/store/api/gstApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { WhiteBooksAuthModal } from './WhiteBooksAuthModal';
import type { LinkedGstin } from '@/lib/types/gst.types';

interface GstinLinkingSectionProps {
  clientId: string;
  clientName?: string;
}

export function GstinLinkingSection({ clientId, clientName }: GstinLinkingSectionProps) {
  const { showToast } = useToast();
  const { data: response, isLoading, refetch } = useGetLinkedGstinsQuery(clientId, {
    skip: !clientId,
  });

  const [linkGstin, { isLoading: isLinking }] = useLinkGstinMutation();
  const [newGstin, setNewGstin] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [authModalGstin, setAuthModalGstin] = useState<string | null>(null);

  const linkedGstins: LinkedGstin[] = response?.data || [];

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGstin.trim() || newGstin.trim().length !== 15) {
      showToast('Please enter a valid 15-character GSTIN', 'error');
      return;
    }

    try {
      await linkGstin({
        clientId,
        gstin: newGstin.trim().toUpperCase(),
      }).unwrap();
      showToast('GSTIN successfully linked to client', 'success');
      setNewGstin('');
      setShowAddForm(false);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to link GSTIN', 'error');
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Linked GSTIN Registrations
            </h3>
            <p className="text-xs text-slate-500">
              {clientName ? `GST Identifications for ${clientName}` : 'State tax registrations'}
            </p>
          </div>
        </div>

        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Link GSTIN
          </Button>
        )}
      </div>

      {showAddForm && (
        <form
          onSubmit={handleLinkSubmit}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-2 items-end"
        >
          <div className="flex-1 w-full">
            <Input
              label="Enter 15-character GSTIN"
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={newGstin}
              onChange={(e) => setNewGstin(e.target.value.toUpperCase())}
              required
              maxLength={15}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLinking}>
              Connect
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading linked GSTINs...</div>
        ) : linkedGstins.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No GSTINs linked yet. Link a GSTIN to enable automated filings.
          </div>
        ) : (
          linkedGstins.map((item, idx) => (
            <div
              key={item.id || item.gstin || idx}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.gstin}
                  </span>
                  {item.stateCode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      State: {item.stateCode}
                    </span>
                  )}
                </div>
                {item.legalName && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.legalName}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAuthModalGstin(item.gstin)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Key className="w-3.5 h-3.5 text-[#00C2B3]" />
                  GSP Connect
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* WhiteBooks GSP Modal */}
      {authModalGstin && (
        <WhiteBooksAuthModal
          isOpen={!!authModalGstin}
          onClose={() => setAuthModalGstin(null)}
          defaultGstin={authModalGstin}
        />
      )}
    </div>
  );
}
