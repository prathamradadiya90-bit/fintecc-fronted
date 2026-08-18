"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Edit2,
  Phone,
  Trash2,
  Check,
  X as XIcon,
  Mail,
  Loader2,
} from 'lucide-react';
import { useGetClientByIdQuery, useInviteClientMutation } from '@/lib/store/api/clientsApi';
import { useToast } from '@/components/ui/Toast';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { DeleteClientModal } from '@/components/clients/DeleteClientModal';
import { ClientOverviewTab } from '@/components/clients/ClientOverviewTab';
import { ClientDocumentsTab } from '@/components/clients/ClientDocumentsTab';
import { ChatTab } from '@/components/clients/ChatTab';

type Tab = 'overview' | 'documents' | 'chat';

function ClientIdBadge({ id }: { id: string }) {
  return (
    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
      Client ID C-{id.substring(0, 6).toUpperCase()}
    </span>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: response, isLoading, isError, refetch } = useGetClientByIdQuery(clientId);
  const [inviteClient, { isLoading: isInviting }] = useInviteClientMutation();
  const client = response?.data ?? null;

  const handleInviteClient = async () => {
    if (!client) return;
    if (!client.email) {
      showToast('Client does not have an email address. Please edit and add an email.', 'error');
      return;
    }
    try {
      await inviteClient(client.id).unwrap();
      showToast('Invitation sent successfully! Login credentials have been emailed to the client.');
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to send invitation';
      showToast(msg, 'error');
    }
  };

  // ─── Loading / Error States ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading client...</p>
        </div>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>Client not found or failed to load.</p>
        <Link href="/dashboard/my-clients" className="text-[#00C2B3] font-semibold text-sm hover:underline">
          ← Back to My Clients
        </Link>
      </div>
    );
  }

  const hasGst = !!client.gstin && client.gstin.length > 5;
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',   label: 'Overview'   },
    { key: 'documents',  label: 'Documents'  },
    { key: 'chat',       label: 'Chat'       },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <Link href="/dashboard/my-clients" className="hover:text-[#00C2B3] transition-colors font-medium">
          My Clients
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{client.name}</span>
      </nav>

      {/* ─── Profile Header Card ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl shadow-sm p-5 sm:p-6"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#091124] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow">
            {client.name.charAt(0).toUpperCase()}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--color-text-heading)' }}>{client.name}</h1>
            </div>
            <ClientIdBadge id={client.id} />

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Type</span>
                <span
                  className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block"
                  style={{
                    background: 'var(--color-bg-skeleton)',
                    color: 'var(--color-text-on-card)',
                  }}
                >
                  {client.type}
                </span>
              </div>
              {client.pan && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>PAN</span>
                  <span className="text-sm font-semibold mt-1 font-mono" style={{ color: 'var(--color-text-on-card)' }}>{client.pan}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Mobile</span>
                  <span className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text-on-card)' }}>{client.phone}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>GST Registered</span>
                <span className={`mt-1 w-fit px-2 py-0.5 rounded-full text-xs font-bold inline-block ${
                  hasGst ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {hasGst ? (
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" /> YES</span>
                  ) : (
                    <span className="flex items-center gap-1"><XIcon className="w-3 h-3" /> NO</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Added On</span>
                <span className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text-on-card)' }}>
                  {new Date(client.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  title="Call client"
                  className="p-2 rounded-xl transition-all text-[#00C2B3]"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                title="Delete client"
                onClick={() => setIsDeleteOpen(true)}
                className="p-2 rounded-xl text-red-400 hover:text-red-500 transition-all"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleInviteClient}
              disabled={isInviting}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm"
              title="Send Portal Invite to Client"
            >
              {isInviting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span>{isInviting ? 'Inviting...' : 'Invite to Portal'}</span>
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Client
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl shadow-sm"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Tab Bar */}
        <div className="px-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <nav className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  relative px-4 py-4 text-sm font-semibold transition-colors duration-150
                  ${activeTab === tab.key
                    ? 'text-[#00C2B3]'
                    : ''
                  }
                `}
                style={activeTab !== tab.key ? { color: 'var(--color-text-secondary)' } : {}}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C2B3] rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <ClientOverviewTab client={client} />}
          {activeTab === 'documents' && <ClientDocumentsTab clientId={client.id} />}
          {activeTab === 'chat' && <ChatTab clientId={client.id} />}
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      <ClientFormModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); refetch(); }}
        client={client}
      />

      <DeleteClientModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        client={client}
        onDeleted={() => router.push('/dashboard/my-clients')}
      />
    </div>
  );
}
