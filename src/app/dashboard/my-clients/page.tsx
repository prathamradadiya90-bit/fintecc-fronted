"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Plus, Filter, Eye, Check, X as XIcon, Trash2, Edit2, Mail, Loader2, Download, UserCheck } from 'lucide-react';
import { useGetClientsQuery, useSearchClientsQuery, useInviteClientMutation, useExportClientsMutation, useOnboardClientMutation } from '@/lib/store/api/clientsApi';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { DeleteClientModal } from '@/components/clients/DeleteClientModal';
import { ClientViewModal } from '@/components/clients/ClientViewModal';
import { Pagination } from '@/components/ui/Pagination';
import type { Client } from '@/lib/types/client.types';

function MyClientsPageContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inviteClient, { isLoading: isInviting }] = useInviteClientMutation();
  const [onboardClient, { isLoading: isOnboarding }] = useOnboardClientMutation();
  const [exportClients, { isLoading: isExporting }] = useExportClientsMutation();
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(() => searchParams.get('action') === 'new');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      // Remove the query parameter so it doesn't re-open on refresh
      router.replace('/dashboard/my-clients', { scroll: false });
    }
  }, [searchParams, router]);


  // Debounce search input and reset page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Main list query (skipped when searching)
  const { data: response, isLoading: isListLoading, isError: isListError, refetch } = useGetClientsQuery({ 
    page: currentPage,
    limit: 10,
  }, { skip: !!debouncedSearchTerm });
  
  // Search query (skipped when no search term)
  const { data: searchResponse, isLoading: isSearchLoading, isError: isSearchError } = useSearchClientsQuery(
    debouncedSearchTerm,
    { skip: !debouncedSearchTerm }
  );
  
  const isLoading = isListLoading || isSearchLoading;
  const isError = isListError || isSearchError;
  const clients = (debouncedSearchTerm ? searchResponse?.data : response?.data) as Client[] || [];
  const meta = debouncedSearchTerm ? undefined : response?.meta;

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  const handleExport = async () => {
    try {
      await exportClients({
        search: debouncedSearchTerm || undefined,
      }).unwrap();
      showToast('Clients exported successfully!', 'success');
    } catch (err: unknown) {
      let msg = 'Failed to export clients';
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const errorData = (err as { data: unknown }).data;
        if (typeof errorData === 'string') {
          msg = errorData;
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          msg = String((errorData as { message: unknown }).message);
        }
      }
      showToast(msg, 'error');
    }
  };

  const handleInvite = async (client: Client) => {
    if (!client.email) {
      showToast('Client does not have an email address. Please edit and add an email.', 'error');
      return;
    }
    setInvitingId(client.id);
    try {
      await inviteClient(client.id).unwrap();
      showToast(`Invitation sent to ${client.name} (${client.email})!`);
    } catch (err: unknown) {
      let msg = 'Failed to send invitation';
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const errorData = (err as { data: unknown }).data;
        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          msg = String((errorData as { message: unknown }).message);
        }
      }
      showToast(msg, 'error');
    } finally {
      setInvitingId(null);
    }
  };


  const handleOnboard = async (client: Client) => {
    setOnboardingId(client.id);
    try {
      await onboardClient(client.id).unwrap();
      showToast(`Client ${client.name} onboarded successfully! Status updated to Active and KYC initiated.`, 'success');
    } catch (err: unknown) {
      let msg = 'Failed to onboard client';
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const errorData = (err as { data: unknown }).data;
        if (typeof errorData === 'string') {
          msg = errorData;
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          msg = String((errorData as { message: unknown }).message);
        }
      }
      showToast(msg, 'error');
    } finally {
      setOnboardingId(null);
    }
  };

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client',
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#091124] text-white flex items-center justify-center font-semibold text-xs">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{client.name}</p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>C-{client.id.substring(0, 3).toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (client) => (
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-block text-center min-w-[80px]"
          style={{
            background: 'var(--color-bg-skeleton)',
            color: 'var(--color-text-on-card)',
          }}
        >
          {client.type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status & KYC',
      render: (client) => {
        const isLead = client.status === 'LEAD';
        const isInactive = client.status === 'Inactive';
        const isActive = client.status === 'Active';
        const isBlocked = client.status === 'Blocked';

        let statusBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        if (isActive) statusBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
        else if (isLead) statusBadgeClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
        else if (isInactive) statusBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        else if (isBlocked) statusBadgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800';

        const kyc = (client.kycStatus || 'NOT_STARTED').toUpperCase();
        let kycBadgeClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
        if (kyc === 'VERIFIED') kycBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
        else if (kyc === 'PENDING') kycBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        else if (kyc === 'REJECTED') kycBadgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800';

        return (
          <div className="flex flex-col gap-1 items-start">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadgeClass}`}>
              {client.status || 'Active'}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${kycBadgeClass}`}>
              KYC: {kyc}
            </span>
          </div>
        );
      },
    },
    {
      key: 'pan',
      header: 'PAN',
      render: (client) => client.pan || '-',
    },
    {
      key: 'phone',
      header: 'Mobile',
      render: (client) => client.phone || '-',
    },
    {
      key: 'gstin',
      header: 'GST',
      render: (client) => {
        const hasGst = !!client.gstin && client.gstin.length > 5;
        return (
          <div className="flex flex-col items-center justify-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasGst ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'}`}>
              {hasGst ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold mt-1 ${hasGst ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {hasGst ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Added On',
      render: (client) => {
        if (!client.createdAt) return '-';
        const date = new Date(client.createdAt);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <div className="flex items-center gap-2">
          {(client.status === 'Inactive' || client.status === 'LEAD') && (
            <button 
              className="transition-colors p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
              title="Onboard Client & Initiate KYC"
              disabled={isOnboarding && onboardingId === client.id}
              onClick={(e) => { e.stopPropagation(); handleOnboard(client); }}
            >
              {isOnboarding && onboardingId === client.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </button>
          )}
          <button 
            className="transition-colors p-1 text-[#00C2B3] hover:text-[#00a89b]"
            title="Invite to Portal"
            disabled={isInviting && invitingId === client.id}
            onClick={(e) => { e.stopPropagation(); handleInvite(client); }}
          >
            {isInviting && invitingId === client.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00C2B3]" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </button>
          <button 
            className="transition-colors p-1 text-[#00C2B3] hover:text-[#00a89b]"
            title="View Details"
            onClick={(e) => { e.stopPropagation(); handleView(client); }}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="transition-colors p-1"
            style={{ color: 'var(--color-text-muted)' }}
            title="Edit Client"
            onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            className="text-red-400 hover:text-red-500 transition-colors p-1"
            title="Delete Client"
            onClick={(e) => { e.stopPropagation(); handleDelete(client); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>My Clients</h2>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Showing {clients.length} clients</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            leftIcon={isExporting ? <Loader2 className="w-4 h-4 animate-spin text-[#00C2B3]" /> : <Download className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button 
            onClick={handleAddNew}
            leftIcon={<Plus className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Add Client
          </Button>
        </div>
      </div>


      {/* Search and Filters */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3.5 rounded-2xl shadow-sm"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex-1 sm:max-w-md">
          <Input
            placeholder="Search by name, PAN, GST..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} className="w-full sm:w-auto">
          Filter
        </Button>
      </div>

      {/* Main Table Area */}
      {isLoading ? (
        <div
          className="rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="w-8 h-8 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>Loading clients...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6 text-center dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
          Failed to load clients. Please check your connection and try again.
        </div>
      ) : (
        <div
          className="rounded-2xl shadow-sm flex flex-col"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Table 
            data={clients} 
            columns={columns} 
            keyExtractor={(client) => client.id} 
            emptyMessage={searchTerm ? 'No clients found matching your search.' : 'You have no clients yet. Add one to get started.'}
            onRowClick={(client) => router.push(`/dashboard/my-clients/${client.id}`)}
          />
          {meta && meta.totalPages > 1 && (
            <Pagination 
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <ClientFormModal 
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          refetch(); // Explicitly refetch after closing modal to ensure data is fresh
        }}
        client={selectedClient}
      />

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          refetch(); // Explicitly refetch after closing modal to ensure data is fresh
        }}
        client={selectedClient}
      />

      <ClientViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}

export default function MyClientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>}>
      <MyClientsPageContent />
    </Suspense>
  );
}
