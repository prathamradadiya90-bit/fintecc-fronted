'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { createTaskSchema, type CreateTaskFormData } from '../validation/tasks.validation';
import { COMPLIANCE_TYPES } from '@/lib/types/task.types';
import type { User } from '@/lib/types/auth.types';
import type { Client } from '@/lib/types/client.types';
import { Repeat } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskFormData) => Promise<void>;
  staffList?: User[];
  clientsList?: Client[];
  isLoadingStaff?: boolean;
  isLoadingClients?: boolean;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staffList = [],
  clientsList = [],
  isLoadingClients = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      clientId: '',
      assigneeId: '',
      title: '',
      complianceType: COMPLIANCE_TYPES[0],
      dueDate: '',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      description: '',
      isRecurring: false,
      recurrencePattern: 'MONTHLY',
    },
  });

  const isRecurring = watch('isRecurring');

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onFormSubmit = async (data: CreateTaskFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      // Clean up empty strings to null or formatted ISO
      const payload: CreateTaskFormData = {
        ...data,
        assigneeId: data.assigneeId ? data.assigneeId : null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        description: data.description ? data.description : null,
        recurrencePattern: data.isRecurring ? data.recurrencePattern : null,
      };

      await onSubmit(payload);
      handleClose();
    } catch (err: any) {
      setServerError(err?.data?.message || err?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = clientsList.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.pan ? `PAN: ${c.pan}` : c.gstin ? `GST: ${c.gstin}` : undefined,
    badge: c.type || undefined,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
      maxWidth="lg"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-task-form"
            isLoading={isSubmitting}
            className="bg-[#00C2B3] hover:bg-[#00A89B] text-white"
          >
            Create Task
          </Button>
        </div>
      }
    >
      <form id="create-task-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
            {serverError}
          </div>
        )}

        {/* Client Selection (Searchable) */}
        <div>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Client *"
                placeholder="Search and select client..."
                options={clientOptions}
                value={field.value}
                onChange={field.onChange}
                isLoading={isLoadingClients}
                error={errors.clientId?.message}
              />
            )}
          />
        </div>

        {/* Task Title */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Task Title *
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="e.g. File GSTR-3B for March 2026"
            className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: errors.title ? '#ef4444' : 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Work / Compliance Type & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Work / Compliance Type
            </label>
            <select
              {...register('complianceType')}
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              {COMPLIANCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Assignee
            </label>
            <select
              {...register('assigneeId')}
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">Unassigned</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Description / Notes
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Add any specific instructions, ledger references, or notes..."
            className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Recurring Switch */}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-teal-600" />
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Recurring Task
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Automatically generate this task on a schedule
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register('isRecurring')}
              className="w-4 h-4 rounded border-slate-300 text-[#00C2B3] focus:ring-[#00C2B3] cursor-pointer"
            />
          </div>

          {isRecurring && (
            <div className="mt-3 pl-6">
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Recurrence Frequency
              </label>
              <select
                {...register('recurrencePattern')}
                className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
                style={{
                  background: 'var(--color-bg-input)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly (e.g. GST returns, TDS payments)</option>
                <option value="YEARLY">Yearly (e.g. Annual ITR, Audit)</option>
              </select>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
