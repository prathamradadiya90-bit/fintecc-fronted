'use client';

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Hourglass,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetShiftsQuery,
  useDeleteShiftMutation,
} from '@/lib/store/api/staffShiftsApi';
import { ShiftModal } from './ShiftModal';
import type { StaffShift } from '@/lib/types/attendance-management.types';

export function ShiftsTab() {
  const { showToast } = useToast();
  const { data: response, isLoading, refetch } = useGetShiftsQuery();
  const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<StaffShift | null>(null);

  const shifts = response?.data || [];

  const handleEdit = (shift: StaffShift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the shift "${name}"?`)) return;
    try {
      await deleteShift(id).unwrap();
      showToast('Office shift deleted', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete shift', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42]">
        <div>
          <h3 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#4A6FA5]" />
            <span>Firm Shift Configurations</span>
          </h3>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-0.5">
            Configure office operational hours, punctuality grace periods, and half-day working rules
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shift</span>
        </Button>
      </div>

      {/* Grid of shifts */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-14 bg-white dark:bg-[#131C2E] rounded-xl border border-dashed border-slate-200 dark:border-[#1E2B42]">
          <div className="w-12 h-12 rounded-full bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-200">
            No Office Shifts Defined Yet
          </h4>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Create shift structures (e.g. Standard 9:30 AM - 6:30 PM) to enable accurate attendance tracking and punctuality audits.
          </p>
          <Button
            onClick={handleCreate}
            className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs"
          >
            Create First Shift
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] shadow-sm hover:border-[#4A6FA5]/40 transition p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center font-semibold text-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-100">
                        {shift.name}
                      </h4>
                      <span className="text-xs text-[#5A6E85] dark:text-slate-400">
                        {shift.startTime} – {shift.endTime}
                      </span>
                    </div>
                  </div>
                  {shift.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
                      Default Shift
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 rounded-lg bg-[#F7F9FB] dark:bg-[#0C131F]">
                    <span className="text-[11px] text-[#5A6E85] dark:text-slate-400 block">
                      Grace Buffer
                    </span>
                    <span className="text-xs font-semibold text-[#1E2A38] dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                      <Hourglass className="w-3 h-3 text-[#4A6FA5]" />
                      <span>{shift.gracePeriodMinutes || 0} mins</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F7F9FB] dark:bg-[#0C131F]">
                    <span className="text-[11px] text-[#5A6E85] dark:text-slate-400 block">
                      Half-Day Min
                    </span>
                    <span className="text-xs font-semibold text-[#1E2A38] dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#4A6FA5]" />
                      <span>{Math.round((shift.halfDayThresholdMinutes || 240) / 60)} hrs</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(shift)}
                  className="h-8 px-2 text-[#5A6E85] hover:text-[#4A6FA5]"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(shift.id, shift.name)}
                  className="h-8 px-2 text-[#9E4A4A] hover:bg-[#9E4A4A]/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedShift(null);
        }}
        shiftToEdit={selectedShift}
      />
    </div>
  );
}
