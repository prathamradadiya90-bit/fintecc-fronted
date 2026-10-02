'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  User,
  Eye,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useGetApprovalsQuery,
  useUpdateApprovalMutation,
} from '@/lib/store/api/approvalsApi';
import type {
  UnifiedApproval,
  ApprovalReferenceType,
  ApprovalStatus,
} from '@/lib/types/approval.types';

export default function ApprovalsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | ApprovalReferenceType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | ApprovalStatus>('PENDING');

  // Modals
  const [rejectingItem, setRejectingItem] = useState<UnifiedApproval | null>(null);
  const [rejectComments, setRejectComments] = useState('');
  const [viewingItem, setViewingItem] = useState<UnifiedApproval | null>(null);

  const { data: response, isLoading, refetch } = useGetApprovalsQuery();
  const [updateApproval, { isLoading: isUpdating }] = useUpdateApprovalMutation();

  const approvals = response?.data || [];

  const filteredApprovals = useMemo(() => {
    return approvals.filter((app) => {
      const matchesType = selectedType === 'ALL' || app.referenceType === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (app.requestedBy?.name && app.requestedBy.name.toLowerCase().includes(term)) ||
        (app.requestedBy?.email && app.requestedBy.email.toLowerCase().includes(term)) ||
        (app.comments && app.comments.toLowerCase().includes(term)) ||
        app.referenceType.toLowerCase().includes(term);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [approvals, selectedType, selectedStatus, searchTerm]);

  const stats = useMemo(() => {
    const pending = approvals.filter((a) => a.status === 'PENDING').length;
    const approved = approvals.filter((a) => a.status === 'APPROVED').length;
    const rejected = approvals.filter((a) => a.status === 'REJECTED').length;
    return { pending, approved, rejected, total: approvals.length };
  }, [approvals]);

  const handleApprove = async (item: UnifiedApproval) => {
    try {
      await updateApproval({
        id: item.id,
        data: {
          status: 'APPROVED',
          approverUserId: user?.id,
          comments: item.comments ? `${item.comments} [Approved by ${user?.name || 'Manager'}]` : 'Approved',
        },
      }).unwrap();
      showToast(`${item.referenceType} request approved successfully`, 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to approve request', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    try {
      await updateApproval({
        id: rejectingItem.id,
        data: {
          status: 'REJECTED',
          approverUserId: user?.id,
          comments: rejectComments || 'Declined during review',
        },
      }).unwrap();
      showToast(`${rejectingItem.referenceType} request declined`, 'info');
      setRejectingItem(null);
      setRejectComments('');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to decline request', 'error');
    }
  };

  const getTypeBadge = (type: ApprovalReferenceType) => {
    switch (type) {
      case 'LEAVE':
        return {
          icon: <Calendar className="w-3.5 h-3.5 mr-1" />,
          label: 'Leave Request',
          style: 'bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/20',
        };
      case 'TASK':
        return {
          icon: <Briefcase className="w-3.5 h-3.5 mr-1" />,
          label: 'Task Completion',
          style: 'bg-[#3D7A64]/10 text-[#3D7A64] border-[#3D7A64]/20',
        };
      case 'INVOICE':
        return {
          icon: <FileText className="w-3.5 h-3.5 mr-1" />,
          label: 'Invoice Waiver',
          style: 'bg-[#9E6B42]/10 text-[#9E6B42] border-[#9E6B42]/20',
        };
      case 'EXPENSE':
        return {
          icon: <DollarSign className="w-3.5 h-3.5 mr-1" />,
          label: 'Staff Expense',
          style: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        };
      default:
        return {
          icon: <CheckSquare className="w-3.5 h-3.5 mr-1" />,
          label: type,
          style: 'bg-slate-100 text-slate-700',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E2A38] dark:text-slate-100">
              Unified Approvals Hub
            </h1>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400">
              Centralized decision inbox for staff leaves, task signoffs, invoices, and firm expense claims
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Total Requests</span>
            <div className="text-xl font-bold text-[#1E2A38] dark:text-slate-100 mt-0.5">
              {stats.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42]">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search staff, reference, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Reference Type Pills */}
          <div className="flex items-center space-x-1 bg-[#F7F9FB] dark:bg-[#0C131F] p-1 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
            {(['ALL', 'LEAVE', 'TASK', 'INVOICE', 'EXPENSE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition ${
                  selectedType === t
                    ? 'bg-white dark:bg-[#131C2E] text-[#1E2A38] dark:text-slate-100 shadow-xs'
                    : 'text-[#5A6E85] dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {t === 'ALL' ? 'All Modules' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1 bg-[#F7F9FB] dark:bg-[#0C131F] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                selectedStatus === st
                  ? 'bg-white dark:bg-[#131C2E] text-[#1E2A38] dark:text-slate-100 shadow-xs'
                  : 'text-[#5A6E85] dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1E2A38] dark:text-slate-200">
              No items awaiting approval
            </p>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {selectedStatus === 'PENDING'
                ? 'Your decision queue is clear! Any submitted requests will appear here.'
                : 'No approvals match your current filter parameters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Workflow Category</th>
                  <th className="py-3 px-4">Reference Key</th>
                  <th className="py-3 px-4">Notes / Details</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredApprovals.map((item) => {
                  const badge = getTypeBadge(item.referenceType);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#4A6FA5]/10 text-[#4A6FA5] font-semibold flex items-center justify-center text-xs">
                            {item.requestedBy?.name ? (
                              item.requestedBy.name.charAt(0).toUpperCase()
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1E2A38] dark:text-slate-200">
                              {item.requestedBy?.name || 'Staff Member'}
                            </div>
                            <div className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                              {item.requestedBy?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${badge.style}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-[#5A6E85] dark:text-slate-400">
                          {item.referenceId ? `${item.referenceId.slice(0, 8)}...` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p
                          className="truncate text-[#1E2A38] dark:text-slate-300"
                          title={item.comments || ''}
                        >
                          {item.comments || 'No comment attached'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[#5A6E85] dark:text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'APPROVED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
                            Approved
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#9E6B42]/10 text-[#9E6B42] border border-[#9E6B42]/20">
                            Pending Review
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20">
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'PENDING' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(item)}
                              disabled={isUpdating}
                              className="h-7 px-2.5 bg-[#3D7A64] hover:bg-[#346955] text-white text-[11px]"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectingItem(item)}
                              disabled={isUpdating}
                              className="h-7 px-2.5 text-[#9E4A4A] border-[#9E4A4A]/30 hover:bg-[#9E4A4A]/10 text-[11px]"
                            >
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingItem(item)}
                            className="h-7 px-2 text-[#5A6E85] hover:text-[#4A6FA5] text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Details</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decline Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-[#9E4A4A]">
              <AlertCircle className="w-6 h-6" />
              <h4 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
                Decline Request ({rejectingItem.referenceType})
              </h4>
            </div>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400">
              Provide instructions or justification for declining this submission.
            </p>
            <textarea
              rows={3}
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              placeholder="e.g. Budget ceiling exceeded, missing supporting receipt"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#9E4A4A]/30"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingItem(null);
                  setRejectComments('');
                }}
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

      {/* Details View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl p-6 space-y-4">
            <h4 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
              Approval Request Summary
            </h4>
            <div className="space-y-2.5 text-xs text-[#5A6E85] dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Category</span>
                <span className="font-semibold text-[#1E2A38] dark:text-slate-200">{viewingItem.referenceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Reference ID</span>
                <span className="font-mono text-[#1E2A38] dark:text-slate-200">{viewingItem.referenceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Requested By</span>
                <span className="text-[#1E2A38] dark:text-slate-200">{viewingItem.requestedBy?.name || 'Staff Member'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Status</span>
                <span className="font-semibold">{viewingItem.status}</span>
              </div>
              <div className="py-1">
                <span className="block mb-1 font-semibold text-[#1E2A38] dark:text-slate-200">Review Comments:</span>
                <div className="p-2.5 rounded-lg bg-[#F7F9FB] dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-300">
                  {viewingItem.comments || 'No comments recorded.'}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewingItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
