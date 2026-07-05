import React from 'react';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { Table, Column } from '../ui/Table';
import type { Client } from '@/lib/types/client.types';
import { Eye } from 'lucide-react';
import Link from 'next/link';

export function RecentClientsTable() {
  const { data, isLoading } = useGetClientsQuery();
  
  // Get the most recent 5 clients (assuming the API returns them sorted, or we just take the first 5)
  const recentClients = data?.data?.slice(0, 5) || [];

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client',
      render: (client) => (
        <div>
          <p className="font-semibold text-slate-800">{client.name}</p>
          <p className="text-[11px] text-slate-500">{client.pan}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      render: (client) => (
        <span className="text-slate-600">
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
      render: (client) => (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-medium">
          Active
        </span>
      ),
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Recent Clients</h3>
        <Link 
          href="/dashboard/my-clients" 
          className="text-[12px] font-medium text-[#00C2B3] hover:text-[#00a89b] flex items-center gap-1"
        >
          View All <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100">
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
