'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  User,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { useGetTasksQuery } from '@/lib/store/api/tasksApi';
import {
  useGetAllocationsQuery,
  useCreateAllocationMutation,
  useDeleteAllocationMutation,
} from '@/lib/store/api/resourceAllocationsApi';
import type { ResourceAllocation } from '@/lib/types/resource-allocation.types';

export function ResourceAllocationTab() {
  const { showToast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    taskId: '',
    allocatedDate: todayStr,
    allocatedHours: 2,
  });

  const { data: allocationsRes, isLoading, refetch } = useGetAllocationsQuery();
  const { data: staffRes } = useGetStaffQuery();
  const { data: tasksRes } = useGetTasksQuery({ limit: 100 });

  const [createAllocation, { isLoading: isCreating }] = useCreateAllocationMutation();
  const [deleteAllocation] = useDeleteAllocationMutation();

  const allocations = allocationsRes?.data || [];
  const staffList = staffRes?.data || [];
  const taskList = tasksRes?.data || [];

  // Filter allocations for selected date
  const dateAllocations = useMemo(() => {
    return allocations.filter((a) => a.allocatedDate?.startsWith(selectedDate));
  }, [allocations, selectedDate]);

  // Aggregate workload by user for the date
  const staffWorkload = useMemo(() => {
    const map: Record<string, { totalHours: number; count: number; name: string; email: string }> = {};
    staffList.forEach((s) => {
      map[s.id] = { totalHours: 0, count: 0, name: s.name, email: s.email };
    });

    dateAllocations.forEach((alloc) => {
      const uId = alloc.userId;
      if (!map[uId]) {
        map[uId] = {
          totalHours: 0,
          count: 0,
          name: alloc.user?.name || 'Staff',
          email: alloc.user?.email || '—',
        };
      }
      map[uId].totalHours += Number(alloc.allocatedHours) || 0;
      map[uId].count += 1;
    });

    return map;
  }, [staffList, dateAllocations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) {
      showToast('Please select a staff member', 'error');
      return;
    }
    if (!formData.taskId) {
      showToast('Please select a task to allocate', 'error');
      return;
    }
    if (formData.allocatedHours <= 0) {
      showToast('Allocated hours must be greater than 0', 'error');
      return;
    }

    try {
      await createAllocation({
        userId: formData.userId,
        taskId: formData.taskId,
        allocatedDate: formData.allocatedDate,
        allocatedHours: Number(formData.allocatedHours),
      }).unwrap();
      showToast('Resource hours allocated successfully', 'success');
      setIsModalOpen(false);
      setFormData({
        userId: '',
        taskId: '',
        allocatedDate: selectedDate,
        allocatedHours: 2,
      });
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to allocate resource', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAllocation(id).unwrap();
      showToast('Resource allocation removed', 'info');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete allocation', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-100">
              Staff Capacity & Daily Workload
            </h3>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400">
              Manage daily hours distribution and prevent team burnout
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#5A6E85] dark:text-slate-400 font-medium">Date:</span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs py-1 h-8 w-36"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center space-x-1.5 text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Allocate Hours</span>
          </Button>
        </div>
      </div>

      {/* Staff Capacity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(staffWorkload).map(([uId, info]) => {
          const capPercent = Math.min(100, Math.round((info.totalHours / 8) * 100));
          const isOverloaded = info.totalHours > 8;
          const isOptimal = info.totalHours >= 6 && info.totalHours <= 8;

          return (
            <div
              key={uId}
              className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4A6FA5]/10 text-[#4A6FA5] font-semibold text-xs flex items-center justify-center">
                    {info.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1E2A38] dark:text-slate-200">
                      {info.name}
                    </h4>
                    <span className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                      {info.count} {info.count === 1 ? 'task allocated' : 'tasks allocated'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    isOverloaded
                      ? 'bg-[#9E4A4A]/10 text-[#9E4A4A] border-[#9E4A4A]/20'
                      : isOptimal
                      ? 'bg-[#3D7A64]/10 text-[#3D7A64] border-[#3D7A64]/20'
                      : 'bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/20'
                  }`}
                >
                  {info.totalHours}h / 8h
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isOverloaded
                        ? 'bg-[#9E4A4A]'
                        : isOptimal
                        ? 'bg-[#3D7A64]'
                        : 'bg-[#4A6FA5]'
                    }`}
                    style={{ width: `${capPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#5A6E85] dark:text-slate-400">
                  <span>{capPercent}% capacity</span>
                  <span>{isOverloaded ? 'Overloaded' : isOptimal ? 'Optimal load' : 'Available'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Allocations Table */}
      <div className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-[#1E2A38] dark:text-slate-200">
            Work Allocations for {selectedDate}
          </h4>
          <span className="text-[11px] text-[#5A6E85] dark:text-slate-400">
            {dateAllocations.length} records
          </span>
        </div>

        {dateAllocations.length === 0 ? (
          <div className="py-12 text-center">
            <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-medium text-[#1E2A38] dark:text-slate-200">
              No allocations scheduled for this date
            </p>
            <p className="text-[11px] text-[#5A6E85] dark:text-slate-400 mt-1">
              Click &quot;Allocate Hours&quot; above to assign tasks and planned hours to your team.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Assigned Task</th>
                  <th className="py-3 px-4">Allocated Hours</th>
                  <th className="py-3 px-4">Task Due Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {dateAllocations.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1E2A38] dark:text-slate-200">
                        {a.user?.name || 'Staff Member'}
                      </div>
                      <div className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                        {a.user?.email || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#1E2A38] dark:text-slate-200">
                        {a.task?.title || 'Work Task'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#4A6FA5]">
                        {a.allocatedHours} hrs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#5A6E85] dark:text-slate-400">
                        {a.task?.dueDate ? new Date(a.task.dueDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1 text-slate-400 hover:text-[#9E4A4A] transition"
                        title="Remove allocation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-100">
                Allocate Resource Time
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1">
                  Staff Member <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30"
                  required
                >
                  <option value="">Select staff member...</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1">
                  Task <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.taskId}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30"
                  required
                >
                  <option value="">Select task...</option>
                  {taskList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.allocatedDate}
                    onChange={(e) => setFormData({ ...formData, allocatedDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1">
                    Hours (e.g. 2.5)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="16"
                    value={formData.allocatedHours}
                    onChange={(e) => setFormData({ ...formData, allocatedHours: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreating}
                  className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
                >
                  {isCreating ? 'Saving...' : 'Confirm Allocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
