'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { SlideOver } from '@/components/ui/SlideOver';
import { Button } from '@/components/ui/Button';
import { useCreateTicketMutation } from '@/lib/store/api/helpdeskApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useToast } from '@/components/ui/Toast';
import type { RootState } from '@/lib/store/store';
import type { TicketPriority } from '@/lib/types/helpdesk.types';

const ticketSchema = z.object({
  clientId: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITIES: { value: TicketPriority; label: string; badgeClass: string }[] = [
  { value: 'LOW', label: 'Low', badgeClass: 'text-slate-600 bg-slate-500/10 border-slate-500/20' },
  { value: 'MEDIUM', label: 'Medium', badgeClass: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  { value: 'HIGH', label: 'High', badgeClass: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  { value: 'URGENT', label: 'Urgent', badgeClass: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
];

export function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isClient = user?.role === 'CLIENT';
  const { showToast } = useToast();

  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery(
    { limit: 100 },
    { skip: isClient || !isOpen }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'MEDIUM',
      clientId: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: TicketFormData) => {
    try {
      if (!isClient && !data.clientId) {
        showToast('Please select a client for this ticket', 'error');
        return;
      }

      await createTicket({
        clientId: isClient ? undefined : data.clientId,
        subject: data.subject.trim(),
        description: data.description.trim(),
        priority: data.priority,
      }).unwrap();

      showToast('Support ticket opened successfully!', 'success');
      handleClose();
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      showToast(err?.data?.message || 'Failed to create ticket', 'error');
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Support Ticket"
      width="40vw"
      footer={
        <div className="w-full flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Submit Ticket
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
        {/* Client Selection (Staff only) */}
        {!isClient && (
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Client Account <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('clientId')}
              disabled={isLoadingClients}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">Select a client...</option>
              {(clientsData?.data || []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.companyName ? `(${client.companyName})` : ''}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-xs text-rose-500 mt-1">{errors.clientId.message}</p>
            )}
          </div>
        )}

        {/* Subject */}
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Subject / Query Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Discrepancy in GSTR-2B Input Tax Credit"
            {...register('subject')}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {errors.subject && (
            <p className="text-xs text-rose-500 mt-1">{errors.subject.message}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Priority Level <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRIORITIES.map((p) => (
              <label
                key={p.value}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all border-dashed"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <input
                  type="radio"
                  value={p.value}
                  {...register('priority')}
                  className="text-[#00C2B3] focus:ring-[#00C2B3]"
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="Provide all relevant details, invoice dates, return periods, or error notices to expedite resolution..."
            {...register('description')}
            className="w-full p-3.5 rounded-xl border text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
          )}
        </div>
      </form>
    </SlideOver>
  );
}
