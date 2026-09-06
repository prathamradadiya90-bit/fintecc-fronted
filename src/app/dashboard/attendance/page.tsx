'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  useGetAttendanceQuery,
  useDeleteAttendanceMutation,
} from '@/lib/store/api/attendanceApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { MarkAttendanceModal } from '@/features/staff/components/MarkAttendanceModal';
import { useToast } from '@/components/ui/Toast';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types/attendance.types';

const ATTENDANCE_STATUS_STYLES: Record<
  AttendanceStatus,
  { bg: string; text: string; label: string }
> = {
  PRESENT: {
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-600',
    label: 'Present',
  },
  ABSENT: {
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
    text: 'text-rose-600',
    label: 'Absent',
  },
  LEAVE: {
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600',
    label: 'On Leave',
  },
  HALFDAY: {
    bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-600',
    label: 'Half Day',
  },
};

export default function AttendancePage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);

  const {
    data: attendanceResponse,
    isLoading,
    refetch,
  } = useGetAttendanceQuery(selectedDate ? { date: selectedDate } : undefined);

  const [deleteAttendance] = useDeleteAttendanceMutation();

  const attendanceRecords = attendanceResponse?.data || [];

  const filteredAttendance = attendanceRecords.filter((rec) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (rec.user?.name && rec.user.name.toLowerCase().includes(term)) ||
      (rec.user?.email && rec.user.email.toLowerCase().includes(term))
    );
  });

  const stats = useMemo(() => {
    const present = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const absent = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    const leave = attendanceRecords.filter(
      (r) => r.status === 'LEAVE' || r.status === 'HALFDAY'
    ).length;
    return { present, absent, leave, total: attendanceRecords.length };
  }, [attendanceRecords]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this attendance log?')) return;
    try {
      await deleteAttendance(id).unwrap();
      showToast('Attendance record removed', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete attendance record', 'error');
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'staff',
      header: 'Staff Member',
      render: (rec) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            {rec.user?.name || 'Staff Member'}
          </span>
          <span className="text-[10px] text-slate-500">{rec.user?.email || ''}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (rec) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {rec.date ? new Date(rec.date).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (rec) => {
        const style =
          ATTENDANCE_STATUS_STYLES[rec.status] || ATTENDANCE_STATUS_STYLES.PRESENT;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg}`}
          >
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'timing',
      header: 'Check-In / Check-Out',
      render: (rec) => {
        const inTime = rec.checkIn
          ? new Date(rec.checkIn).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—';
        const outTime = rec.checkOut
          ? new Date(rec.checkOut).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—';
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400">
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
              setIsModalOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-[#00C2B3] transition-colors"
            title="Edit Entry"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(rec.id)}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
            title="Delete Entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3] border border-teal-100 dark:border-teal-900">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Staff Attendance & Timesheets
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track daily attendance, clock-in timings, and leaves across your practice
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setSelectedAttendance(null);
            setIsModalOpen(true);
          }}
          leftIcon={<UserCheck className="w-4 h-4" />}
        >
          Log Attendance
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Present Today
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.present}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Absent
            </p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {stats.absent}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              On Leave / Half Day
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats.leave}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search staff name or email..."
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
            <Button variant="outline" size="sm" onClick={() => setSelectedDate('')}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredAttendance}
        columns={columns}
        keyExtractor={(rec) => rec.id}
        isLoading={isLoading}
        emptyMessage="No attendance records found. Click 'Log Attendance' to add an entry."
      />

      {/* Modal */}
      <MarkAttendanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAttendance(null);
          refetch();
        }}
        attendanceToEdit={selectedAttendance}
      />
    </div>
  );
}
