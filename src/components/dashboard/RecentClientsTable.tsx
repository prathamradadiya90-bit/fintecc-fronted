import React from 'react';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { Table, Column } from '../ui/Table';
import type { Client } from '@/lib/types/client.types';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function RecentClientsTable() {
  const { data, isLoading } = useGetClientsQuery();
  
  // Get the most recent 5 clients
  const recentClients = data?.data?.slice(0, 5) || [];

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client Entity',
      render: (client) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md text-[#4A6FA5] dark:text-[#A8C5DA] flex items-center justify-center font-bold text-xs shrink-0 bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/40 dark:border-[#A8C5DA]/40"
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-xs truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {client.name}
            </p>
            <p
              className="text-[11px] font-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {client.pan || client.email || 'PAN: Pending'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Onboarded',
      render: (client) => (
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {new Date(client.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span 
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
          style={{
            background: 'var(--color-status-success-bg, rgba(61, 122, 100, 0.08))',
            color: 'var(--color-status-success-text, #3D7A64)',
            borderColor: 'var(--color-status-success-border, rgba(61, 122, 100, 0.2))',
          }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ background: 'var(--color-status-success-text, #3D7A64)' }}
          />
          Active
        </span>
      ),
    }
  ];

  return (
    <div
      className="rounded-xl p-5 shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Recent Clients
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/40 dark:border-[#A8C5DA]/40"
            >
              {recentClients.length} Entities
            </span>
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Active portfolios with synced audit & statutory status
          </p>
        </div>
        <Link 
          href="/dashboard/my-clients" 
          className="text-xs font-semibold text-[#4A6FA5] dark:text-[#A8C5DA] hover:text-[#3D5D8A] dark:hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
        >
          View All Clients <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-12 rounded-lg w-full"
              style={{ background: 'var(--color-bg-card-hover)' }}
            />
          ))}
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-lg"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <Table 
            data={recentClients}
            columns={columns}
            keyExtractor={(client) => client.id}
            emptyMessage="No clients added yet."
          />
        </div>
      )}
    </div>
  );
}
