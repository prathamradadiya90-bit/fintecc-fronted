'use client';

import React, { useState } from 'react';
import { X, Calendar, UserCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { useCreateLeaveRequestMutation } from '@/lib/store/api/leaveRequestsApi';
import type { LeaveType } from '@/lib/types/attendance-management.types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const isFirmAdmin = user?.role === 'FIRM_OWNER' || user?.role === 'ADMIN';

  const { data: staffResponse } = useGetStaffQuery(undefined, { skip: !isFirmAdmin });
  const staffList = staffResponse?.data || [];

  const [createLeaveRequest, { isLoading: isSubmitting }] = useCreateLeaveRequestMutation();

  const [formData, setFormData] = useState({
    userId: user?.id || '',
    leaveType: 'CASUAL' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      showToast('Please provide a reason for the leave application', 'error');
      return;
    }

    try {
      await createLeaveRequest({
        userId: formData.userId || user?.id,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      }).unwrap();
      showToast('Leave request submitted successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to submit leave request', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
                Submit Leave Application
              </h3>
              <p className="text-xs text-[#5A6E85] dark:text-slate-400">
                Request planned absence or sick time-off with manager approval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Staff Member (if firm admin logging on behalf) */}
          {isFirmAdmin && staffList.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Staff Member
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30"
              >
                <option value={user?.id}>Self ({user?.name || user?.email})</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
              Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CASUAL', 'SICK', 'EARNED'] as LeaveType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveType: type })}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    formData.leaveType === type
                      ? 'bg-[#4A6FA5] text-white border-[#4A6FA5]'
                      : 'bg-white dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {type === 'CASUAL' ? 'Casual Leave' : type === 'SICK' ? 'Sick Leave' : 'Earned Leave'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
              Reason / Note <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Provide context for manager review (e.g. medical appointment, urgent personal matter)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
