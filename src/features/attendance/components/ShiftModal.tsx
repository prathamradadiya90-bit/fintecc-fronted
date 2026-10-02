'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateShiftMutation,
  useUpdateShiftMutation,
} from '@/lib/store/api/staffShiftsApi';
import type { StaffShift } from '@/lib/types/attendance-management.types';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit?: StaffShift | null;
}

export function ShiftModal({ isOpen, onClose, shiftToEdit }: ShiftModalProps) {
  const { showToast } = useToast();
  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();

  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:30',
    endTime: '18:30',
    gracePeriodMinutes: 15,
    halfDayThresholdMinutes: 240,
    isDefault: false,
  });

  useEffect(() => {
    if (shiftToEdit) {
      setFormData({
        name: shiftToEdit.name || '',
        startTime: shiftToEdit.startTime || '09:30',
        endTime: shiftToEdit.endTime || '18:30',
        gracePeriodMinutes: shiftToEdit.gracePeriodMinutes ?? 15,
        halfDayThresholdMinutes: shiftToEdit.halfDayThresholdMinutes ?? 240,
        isDefault: !!shiftToEdit.isDefault,
      });
    } else {
      setFormData({
        name: '',
        startTime: '09:30',
        endTime: '18:30',
        gracePeriodMinutes: 15,
        halfDayThresholdMinutes: 240,
        isDefault: false,
      });
    }
  }, [shiftToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Shift name is required', 'error');
      return;
    }

    try {
      if (shiftToEdit) {
        await updateShift({
          id: shiftToEdit.id,
          data: formData,
        }).unwrap();
        showToast('Office shift updated successfully', 'success');
      } else {
        await createShift(formData).unwrap();
        showToast('Office shift created successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save office shift', 'error');
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
                {shiftToEdit ? 'Edit Office Shift' : 'Configure New Shift'}
              </h3>
              <p className="text-xs text-[#5A6E85] dark:text-slate-400">
                Define timing bounds, grace cutoffs, and default assignments
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
              Shift Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Regular Day Shift, Morning Tax Peak"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Start Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                End Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Grace Period (Minutes)
              </label>
              <Input
                type="number"
                min="0"
                max="120"
                value={formData.gracePeriodMinutes}
                onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
              />
              <span className="text-[11px] text-[#5A6E85] dark:text-slate-400 mt-1 block">
                Late mark after this delay
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                Half-Day Threshold (Mins)
              </label>
              <Input
                type="number"
                min="60"
                max="480"
                step="15"
                value={formData.halfDayThresholdMinutes}
                onChange={(e) => setFormData({ ...formData, halfDayThresholdMinutes: Number(e.target.value) })}
              />
              <span className="text-[11px] text-[#5A6E85] dark:text-slate-400 mt-1 block">
                Min working time ({Math.round(formData.halfDayThresholdMinutes / 60)} hrs)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-[#4A6FA5] focus:ring-[#4A6FA5] border-slate-300 dark:border-slate-700"
              />
              <div className="flex-1">
                <span className="text-xs font-semibold text-[#1E2A38] dark:text-slate-200 block">
                  Set as Default Firm Shift
                </span>
                <span className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                  Automatically applied to all new staff members and auto-punch logs
                </span>
              </div>
            </label>
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
              {isSubmitting ? 'Saving...' : shiftToEdit ? 'Save Changes' : 'Create Shift'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
