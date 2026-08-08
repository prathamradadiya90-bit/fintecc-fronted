"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, Power, PowerOff, Shield } from 'lucide-react';
import { useGetStaffQuery, useUpdateStaffMutation } from '@/lib/store/api/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { StaffFormModal } from '@/components/staff/StaffFormModal';
import { DeleteStaffModal } from '@/components/staff/DeleteStaffModal';
import { useToast } from '@/components/ui/Toast';
import type { RootState } from '@/lib/store/store';
import type { User } from '@/lib/types/auth.types';

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PARTNER: { bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', text: 'text-blue-700', label: 'Partner' },
  EMPLOYEE: { bg: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800', text: 'text-teal-700', label: 'Employee' },
  AUDITOR: { bg: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800', text: 'text-purple-700', label: 'Auditor' },
  ACCOUNTANT: { bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', text: 'text-amber-700', label: 'Accountant' },
  TAX_CONSULTANT: { bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800', text: 'text-rose-700', label: 'Tax Consultant' },
};

function StaffPageContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Guard: Only FIRM_OWNER role allowed
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'FIRM_OWNER') {
      showToast('Access Denied: Only Firm Owners can manage staff.', 'error');
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, router, showToast]);

  const { data: response, isLoading, isError, refetch } = useGetStaffQuery(undefined, {
    skip: !isAuthenticated || !user || user.role !== 'FIRM_OWNER',
  });

  const [updateStaff, { isLoading: isStatusChanging }] = useUpdateStaffMutation();

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!isAuthenticated || !user || user.role !== 'FIRM_OWNER') {
    return null;
  }

  const staffMembers = response?.data || [];
  const filteredStaff = staffMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (member: User) => {
    setSelectedStaff(member);
    setIsFormModalOpen(true);
  };

  const handleDelete = (member: User) => {
    setSelectedStaff(member);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (member: User) => {
    try {
      const nextActiveState = !member.isActive;
      await updateStaff({
        id: member.id,
        isActive: nextActiveState,
      }).unwrap();
      showToast(
        `Staff member ${nextActiveState ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Failed to update access status';
      showToast(errorMsg, 'error');
    }
  };

  const handleAddNew = () => {
    setSelectedStaff(null);
    setIsFormModalOpen(true);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#091124] text-white flex items-center justify-center font-semibold text-xs shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{member.name}</p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (member) => {
        const style = ROLE_STYLES[member.role] || {
          bg: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          label: member.role || 'Staff',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} inline-block`}>
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (member) => {
        const active = member.isActive !== false;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <span className={`text-[12px] font-medium ${active ? 'text-emerald-700 dark:text-emerald-400' : ''}`} style={active ? {} : { color: 'var(--color-text-secondary)' }}>
              {active ? 'Active' : 'Deactivated'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date Invited',
      render: (member) => {
        if (!member.createdAt) return '-';
        const date = new Date(member.createdAt);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member) => (
        <div className="flex items-center gap-2">
          <button 
            className="transition-colors p-1"
            style={{ color: 'var(--color-text-muted)' }}
            title="Edit Staff Member"
            onClick={(e) => { e.stopPropagation(); handleEdit(member); }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(member); }}
            disabled={isStatusChanging}
            title={member.isActive !== false ? "Deactivate Access" : "Activate Access"}
            className={`transition-colors p-1 disabled:opacity-50 ${
              member.isActive !== false 
                ? "text-slate-400 hover:text-amber-500" 
                : "text-slate-400 hover:text-emerald-500"
            }`}
          >
            {member.isActive !== false ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>

          <button 
            className="text-red-400 hover:text-red-500 transition-colors p-1"
            title="Delete Staff"
            onClick={(e) => { e.stopPropagation(); handleDelete(member); }}
          >
            <Trash2 className="w-4 h-4" />
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
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Manage Staff</h2>
          <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Showing {filteredStaff.length} staff members</p>
        </div>
        <Button 
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Invite Staff
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
            placeholder="Search by name or email..."
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
          <div className="w-8 h-8 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin animate-duration-500" />
          <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>Loading staff members...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6 text-center font-medium dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
          Failed to load staff list. Please verify server status and try again.
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
            data={filteredStaff} 
            columns={columns} 
            keyExtractor={(member) => member.id} 
            emptyMessage={searchTerm ? 'No staff matching your search.' : 'No staff members added yet. Invite someone to collaborate.'}
          />
        </div>
      )}

      {/* Modals */}
      <StaffFormModal 
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          refetch();
        }}
        staff={selectedStaff}
      />

      <DeleteStaffModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          refetch();
        }}
        staff={selectedStaff}
      />
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>Loading Staff Management...</div>}>
      <StaffPageContent />
    </Suspense>
  );
}
