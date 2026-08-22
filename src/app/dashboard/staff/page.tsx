"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Search,
  Plus,
  Filter,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useGetStaffQuery, useUpdateStaffMutation } from '@/lib/store/api/authApi';
import {
  useGetAttendanceQuery,
  useDeleteAttendanceMutation,
} from '@/lib/store/api/attendanceApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { StaffFormModal } from '@/components/staff/StaffFormModal';
import { DeleteStaffModal } from '@/components/staff/DeleteStaffModal';
import { MarkAttendanceModal } from '@/features/staff/components/MarkAttendanceModal';
import { useToast } from '@/components/ui/Toast';
import type { RootState } from '@/lib/store/store';
import type { User } from '@/lib/types/auth.types';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types/attendance.types';

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PARTNER: { bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', text: 'text-blue-700', label: 'Partner' },
  EMPLOYEE: { bg: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800', text: 'text-teal-700', label: 'Employee' },
  AUDITOR: { bg: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800', text: 'text-purple-700', label: 'Auditor' },
  ACCOUNTANT: { bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', text: 'text-amber-700', label: 'Accountant' },
  TAX_CONSULTANT: { bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800', text: 'text-rose-700', label: 'Tax Consultant' },
};

const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
  PRESENT: { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600', label: 'Present' },
  ABSENT: { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400', text: 'text-rose-600', label: 'Absent' },
  LEAVE: { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400', text: 'text-amber-600', label: 'On Leave' },
  HALFDAY: { bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-600', label: 'Half Day' },
};

function StaffPageContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'roster' | 'attendance'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Modals state
  const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
  const [isDeleteStaffModalOpen, setIsDeleteStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);

  // Guard: Only FIRM_OWNER role allowed
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'FIRM_OWNER') {
      showToast('Access Denied: Only Firm Owners can manage staff.', 'error');
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, router, showToast]);

  // Queries
  const { data: staffResponse, isLoading: isStaffLoading, isError: isStaffError, refetch: refetchStaff } = useGetStaffQuery(undefined, {
    skip: !isAuthenticated || !user || user.role !== 'FIRM_OWNER',
  });

  const { data: attendanceResponse, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useGetAttendanceQuery(
    selectedDate ? { date: selectedDate } : undefined,
    { skip: !isAuthenticated || !user || user.role !== 'FIRM_OWNER' }
  );

  const [updateStaff, { isLoading: isStatusChanging }] = useUpdateStaffMutation();
  const [deleteAttendance] = useDeleteAttendanceMutation();

  if (!isAuthenticated || !user || user.role !== 'FIRM_OWNER') {
    return null;
  }

  const staffMembers = staffResponse?.data || [];
  const filteredStaff = staffMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attendanceRecords = attendanceResponse?.data || [];
  const filteredAttendance = attendanceRecords.filter((rec) => {
    const matchSearch =
      !searchTerm.trim() ||
      (rec.user?.name && rec.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rec.user?.email && rec.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchSearch;
  });

  // Attendance metrics
  const attendanceStats = useMemo(() => {
    const present = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const absent = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    const leave = attendanceRecords.filter((r) => r.status === 'LEAVE' || r.status === 'HALFDAY').length;
    return { present, absent, leave, total: attendanceRecords.length };
  }, [attendanceRecords]);

  // Staff Handlers
  const handleEditStaff = (member: User) => {
    setSelectedStaff(member);
    setIsStaffFormModalOpen(true);
  };

  const handleDeleteStaff = (member: User) => {
    setSelectedStaff(member);
    setIsDeleteStaffModalOpen(true);
  };

  const handleToggleStatus = async (member: User) => {
    try {
      const nextActiveState = !member.isActive;
      await updateStaff({
        id: member.id,
        isActive: nextActiveState,
      }).unwrap();
      showToast(`Staff member ${nextActiveState ? 'activated' : 'deactivated'}`, 'success');
      refetchStaff();
    } catch (err) {
      showToast('Failed to update staff status', 'error');
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      await deleteAttendance(id).unwrap();
      showToast('Attendance record removed', 'success');
    } catch (err) {
      showToast('Failed to delete attendance record', 'error');
    }
  };

  // Staff Columns
  const staffColumns: Column<User>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      render: (member) => {
        const initials = member.name.substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>{member.name}</p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{member.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (member) => {
        const style = ROLE_STYLES[member.role] || ROLE_STYLES.EMPLOYEE;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${style.bg}`}>
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (member) => (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {member.phone || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
          member.isActive !== false
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
        }`}>
          {member.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member) => (
        <div className="flex items-center gap-2">
          <button 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Edit Staff"
            onClick={() => handleEditStaff(member)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => handleToggleStatus(member)}
            disabled={isStatusChanging}
            title={member.isActive !== false ? "Deactivate" : "Activate"}
            className={`p-1 transition-colors ${
              member.isActive !== false ? "text-slate-400 hover:text-amber-500" : "text-slate-400 hover:text-emerald-500"
            }`}
          >
            {member.isActive !== false ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
          </button>

          <button 
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
            title="Delete Staff"
            onClick={() => handleDeleteStaff(member)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Attendance Columns
  const attendanceColumns: Column<AttendanceRecord>[] = [
    {
      key: 'staff',
      header: 'Staff Member',
      render: (rec) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
            {rec.user?.name || 'Staff'}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {rec.user?.email || ''}
          </span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (rec) => (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {rec.date ? new Date(rec.date).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (rec) => {
        const style = ATTENDANCE_STATUS_STYLES[rec.status] || ATTENDANCE_STATUS_STYLES.PRESENT;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg}`}>
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'timing',
      header: 'Check-In / Out',
      render: (rec) => {
        const inTime = rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        const outTime = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        return (
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {inTime} - {outTime}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rec) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAttendance(rec);
              setIsAttendanceModalOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Edit Attendance"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteAttendance(rec.id)}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
            title="Delete Record"
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
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
            Staff & Attendance Hub
          </h1>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Manage firm partners, employees, auditors, and track daily attendance timesheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'roster' ? (
            <Button
              onClick={() => {
                setSelectedStaff(null);
                setIsStaffFormModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Invite Staff
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSelectedAttendance(null);
                setIsAttendanceModalOpen(true);
              }}
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Log Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'border-[#00C2B3] text-[#00C2B3]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Members Roster ({staffMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'border-[#00C2B3] text-[#00C2B3]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Attendance & Timesheets</span>
        </button>
      </div>

      {/* TAB 1: Staff Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3.5 rounded-2xl shadow-sm"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex-1 sm:max-w-md">
              <Input
                placeholder="Search staff by name or email..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table
            data={filteredStaff}
            columns={staffColumns}
            keyExtractor={(member) => member.id}
            isLoading={isStaffLoading}
            emptyMessage={searchTerm ? 'No staff matching your search.' : 'No staff members added yet. Invite someone to collaborate.'}
          />
        </div>
      )}

      {/* TAB 2: Attendance Tracker */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-2xl p-4 shadow-sm flex items-center justify-between"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Present
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{attendanceStats.present}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div
              className="rounded-2xl p-4 shadow-sm flex items-center justify-between"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Absent
                </p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{attendanceStats.absent}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            <div
              className="rounded-2xl p-4 shadow-sm flex items-center justify-between"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Leave / Half Day
                </p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{attendanceStats.leave}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Date Filter Bar */}
          <div
            className="rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search staff name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <Table
            data={filteredAttendance}
            columns={attendanceColumns}
            keyExtractor={(rec) => rec.id}
            isLoading={isAttendanceLoading}
            emptyMessage="No attendance logs found for this filter. Click 'Log Attendance' to record entries."
          />
        </div>
      )}

      {/* Modals */}
      <StaffFormModal 
        isOpen={isStaffFormModalOpen}
        onClose={() => {
          setIsStaffFormModalOpen(false);
          refetchStaff();
        }}
        staff={selectedStaff}
      />

      <DeleteStaffModal
        isOpen={isDeleteStaffModalOpen}
        onClose={() => {
          setIsDeleteStaffModalOpen(false);
          refetchStaff();
        }}
        staff={selectedStaff}
      />

      <MarkAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedAttendance(null);
          refetchAttendance();
        }}
        attendanceToEdit={selectedAttendance}
      />
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>Loading Staff Hub...</div>}>
      <StaffPageContent />
    </Suspense>
  );
}
