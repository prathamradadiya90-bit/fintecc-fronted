'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  User,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useGetLeaveRequestsQuery,
  useUpdateLeaveRequestMutation,
} from '@/lib/store/api/leaveRequestsApi';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import type { LeaveRequest, LeaveStatus } from '@/lib/types/attendance-management.types';

export function LeaveRequestsTab() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const isFirmAdmin = user?.role === 'FIRM_OWNER' || user?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeaveStatus>('ALL');
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  // Reject state
  const [rejectingItem, setRejectingItem] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: response, isLoading, refetch } = useGetLeaveRequestsQuery();
  const [updateLeaveRequest, { isLoading: isUpdating }] = useUpdateLeaveRequestMutation();

  const requests = response?.data || [];

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (req.user?.name && req.user.name.toLowerCase().includes(term)) ||
        (req.user?.email && req.user.email.toLowerCase().includes(term)) ||
        (req.reason && req.reason.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    return { pending, approved, rejected, total: requests.length };
  }, [requests]);

  const handleApprove = async (req: LeaveRequest) => {
    try {
      await updateLeaveRequest({
        id: req.id,
        data: {
          status: 'APPROVED',
          approvedByUserId: user?.id,
        },
      }).unwrap();
      showToast('Leave request approved successfully', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to approve leave request', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    try {
      await updateLeaveRequest({
        id: rejectingItem.id,
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'Operational workload constraints',
        },
      }).unwrap();
      showToast('Leave request rejected', 'info');
      setRejectingItem(null);
      setRejectionReason('');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to reject leave request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Total Applications</span>
            <div className="text-xl font-bold text-[#1E2A38] dark:text-slate-100 mt-0.5">
              {stats.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Pending Review</span>
            <div className="text-xl font-bold text-[#9E6B42] mt-0.5">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9E6B42]/10 text-[#9E6B42] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Approved</span>
            <div className="text-xl font-bold text-[#3D7A64] mt-0.5">{stats.approved}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Declined</span>
            <div className="text-xl font-bold text-[#9E4A4A] mt-0.5">{stats.rejected}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9E4A4A]/10 text-[#9E4A4A] flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42]">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search staff or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="flex items-center space-x-1.5 bg-[#F7F9FB] dark:bg-[#0C131F] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  statusFilter === s
                    ? 'bg-white dark:bg-[#131C2E] text-[#1E2A38] dark:text-slate-100 shadow-xs'
                    : 'text-[#5A6E85] dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={() => setIsApplyOpen(true)}
          className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-14">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1E2A38] dark:text-slate-200">
              No leave applications found
            </p>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-1">
              {statusFilter !== 'ALL'
                ? `No requests matching status filter "${statusFilter}"`
                : 'Staff leave applications will appear here for review and tracking.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#4A6FA5]/10 text-[#4A6FA5] font-semibold flex items-center justify-center text-xs">
                          {req.user?.name ? req.user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1E2A38] dark:text-slate-200">
                            {req.user?.name || 'Staff Member'}
                          </div>
                          <div className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                            {req.user?.email || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-[#1E2A38] dark:text-slate-300">
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#1E2A38] dark:text-slate-200">
                        {req.startDate} to {req.endDate}
                      </div>
                      <div className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                        Submitted {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate text-[#1E2A38] dark:text-slate-300" title={req.reason}>
                        {req.reason}
                      </p>
                      {req.rejectionReason && (
                        <p className="text-[11px] text-[#9E4A4A] truncate mt-0.5" title={req.rejectionReason}>
                          Reason: {req.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {req.status === 'APPROVED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
                          Approved
                        </span>
                      )}
                      {req.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#9E6B42]/10 text-[#9E6B42] border border-[#9E6B42]/20">
                          Pending Review
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20">
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFirmAdmin && req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req)}
                            disabled={isUpdating}
                            className="h-7 px-2.5 bg-[#3D7A64] hover:bg-[#346955] text-white text-[11px]"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectingItem(req)}
                            disabled={isUpdating}
                            className="h-7 px-2.5 text-[#9E4A4A] border-[#9E4A4A]/30 hover:bg-[#9E4A4A]/10 text-[11px]"
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                          {req.approvedBy?.name ? `Reviewed by ${req.approvedBy.name}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-[#9E4A4A]">
              <AlertCircle className="w-6 h-6" />
              <h4 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
                Decline Leave Request
              </h4>
            </div>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400">
              Provide feedback or operational reasoning for declining this leave application.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Audit deadline conflict, critical filing dates"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#9E4A4A]/30"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingItem(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                className="bg-[#9E4A4A] hover:bg-[#8A3F3F] text-white"
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <ApplyLeaveModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />
    </div>
  );
}
