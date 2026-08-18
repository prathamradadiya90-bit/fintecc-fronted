"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Plus, Filter, Eye, MoreHorizontal, Check, X as XIcon, Trash2, Edit2, Mail, Loader2 } from 'lucide-react';
import { useGetClientsQuery, useSearchClientsQuery, useInviteClientMutation } from '@/lib/store/api/clientsApi';
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
  const [inviteClient, { isLoading: isInviting }] = useInviteClientMutation();
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsFormModalOpen(true);
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

  const handleInvite = async (client: Client) => {
    if (!client.email) {
      showToast('Client does not have an email address. Please edit and add an email.', 'error');
      return;
    }
    setInvitingId(client.id);
    try {
      await inviteClient(client.id).unwrap();
      showToast(`Invitation sent to ${client.name} (${client.email})!`);
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to send invitation';
      showToast(msg, 'error');
    } finally {
      setInvitingId(null);
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
          <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Showing {clients.length} clients</p>
        </div>
        <Button 
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Add Client
        </Button>
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
