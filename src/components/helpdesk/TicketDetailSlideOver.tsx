'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Send,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Paperclip,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';
import { SlideOver } from '@/components/ui/SlideOver';
import { Button } from '@/components/ui/Button';
import {
  useGetTicketByIdQuery,
  useGetTicketRepliesQuery,
  useAddTicketReplyMutation,
  useUpdateTicketMutation,
} from '@/lib/store/api/helpdeskApi';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { useToast } from '@/components/ui/Toast';
import type { RootState } from '@/lib/store/store';
import type { Ticket, TicketPriority, TicketStatus } from '@/lib/types/helpdesk.types';

interface TicketDetailSlideOverProps {
  ticketId: string | null;
  onClose: () => void;
}

const STATUS_BADGES: Record<TicketStatus, { bg: string; text: string; border: string; label: string }> = {
  OPEN: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', label: 'Open' },
  IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', label: 'In Progress' },
  RESOLVED: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', label: 'Resolved' },
  CLOSED: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', label: 'Closed' },
};

const PRIORITY_BADGES: Record<TicketPriority, { bg: string; text: string; border: string; label: string }> = {
  LOW: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', label: 'Low' },
  MEDIUM: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', label: 'Medium' },
  HIGH: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', label: 'High' },
  URGENT: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', label: 'Urgent' },
};

export function TicketDetailSlideOver({ ticketId, onClose }: TicketDetailSlideOverProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isClient = user?.role === 'CLIENT';
  const { showToast } = useToast();

  const [replyText, setReplyText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const { data: ticketResponse, isLoading: isLoadingTicket } = useGetTicketByIdQuery(ticketId!, {
    skip: !ticketId,
  });
  const { data: repliesResponse, isLoading: isLoadingReplies } = useGetTicketRepliesQuery(ticketId!, {
    skip: !ticketId,
  });

  const { data: staffResponse } = useGetStaffQuery(undefined, {
    skip: isClient || !ticketId,
  });

  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [addReply, { isLoading: isAddingReply }] = useAddTicketReplyMutation();

  const ticket = ticketResponse?.data;
  const replies = repliesResponse?.data || [];
  const staffList = staffResponse?.data || [];

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId || isClient) return;
    try {
      await updateTicket({ id: ticketId, data: { status: newStatus } }).unwrap();
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticketId || isClient) return;
    try {
      await updateTicket({ id: ticketId, data: { priority: newPriority } }).unwrap();
      showToast(`Priority changed to ${newPriority}`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update priority', 'error');
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!ticketId || isClient) return;
    try {
      await updateTicket({
        id: ticketId,
        data: { assignedToId: newAssigneeId === '' ? null : newAssigneeId },
      }).unwrap();
      showToast(newAssigneeId === '' ? 'Ticket unassigned' : 'Ticket assignee updated', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update assignee', 'error');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticketId) return;

    try {
      await addReply({
        ticketId,
        data: {
          message: replyText.trim(),
          attachmentUrl: attachmentUrl.trim() || undefined,
        },
      }).unwrap();

      setReplyText('');
      setAttachmentUrl('');
      showToast('Reply sent successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to send reply', 'error');
    }
  };

  if (!ticketId) return null;

  return (
    <SlideOver
      isOpen={Boolean(ticketId)}
      onClose={onClose}
      title={ticket ? `Ticket #${ticket.id.slice(0, 8)}` : 'Loading Ticket...'}
      width="40vw"
    >
      {isLoadingTicket && !ticket ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00C2B3] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">Loading conversation history...</p>
        </div>
      ) : ticket ? (
        <div className="space-y-6 pb-6">
          {/* Header Metadata Banner */}
          <div
            className="p-4 rounded-2xl border space-y-3 shadow-sm"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {ticket.subject}
              </span>
              <div className="flex items-center gap-2">
                {/* Priority */}
                {isClient ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${PRIORITY_BADGES[ticket.priority]?.bg} ${PRIORITY_BADGES[ticket.priority]?.text} ${PRIORITY_BADGES[ticket.priority]?.border}`}
                  >
                    {PRIORITY_BADGES[ticket.priority]?.label || ticket.priority}
                  </span>
                ) : (
                  <select
                    value={ticket.priority}
                    disabled={isUpdating}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                )}

                {/* Status */}
                {isClient ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${STATUS_BADGES[ticket.status]?.bg} ${STATUS_BADGES[ticket.status]?.text} ${STATUS_BADGES[ticket.status]?.border}`}
                  >
                    {STATUS_BADGES[ticket.status]?.label || ticket.status}
                  </span>
                ) : (
                  <select
                    value={ticket.status}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                )}
              </div>
            </div>

            {/* Description */}
            <div
              className="p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap border"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {ticket.description}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Client</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {ticket.client?.name || 'Account Client'}
                </span>
                {ticket.client?.companyName && (
                  <span className="text-slate-400 block text-[11px]">
                    {ticket.client.companyName}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Assigned To</span>
                {isClient ? (
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {ticket.assignedTo?.name || 'Unassigned'}
                  </span>
                ) : (
                  <select
                    value={ticket.assignedToId || ''}
                    disabled={isUpdating}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Opened: {new Date(ticket.createdAt).toLocaleString('en-IN')}</span>
              {ticket.resolvedAt && (
                <span className="text-emerald-500 font-medium">
                  Resolved: {new Date(ticket.resolvedAt).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Conversation History */}
          <div className="space-y-3">
            <h4
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-[#00C2B3]" />
              Conversation Thread ({replies.length})
            </h4>

            {isLoadingReplies ? (
              <p className="text-xs text-slate-400">Loading replies...</p>
            ) : replies.length === 0 ? (
              <div
                className="p-6 text-center rounded-2xl border border-dashed"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="text-xs text-slate-400">No replies yet. Post the first update below.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {replies.map((reply) => {
                  const isStaffReply = reply.senderType === 'STAFF';
                  return (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                        isStaffReply
                          ? 'border-[#00C2B3]/30 bg-[#00C2B3]/5 ml-4'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isStaffReply
                                ? 'bg-[#00C2B3]/20 text-[#00C2B3]'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {isStaffReply ? 'Staff Support' : 'Client'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(reply.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p
                        className="text-xs leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {reply.message}
                      </p>

                      {reply.attachmentUrl && (
                        <div className="pt-1">
                          <a
                            href={reply.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#00C2B3] hover:underline"
                          >
                            <Paperclip className="w-3 h-3" /> View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="space-y-3 pt-2">
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Send Message / Add Response
              </label>
              <textarea
                rows={3}
                placeholder="Type your response or update message..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="url"
                placeholder="Optional attachment URL (e.g. cloud document / receipt)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <Button
                type="submit"
                isLoading={isAddingReply}
                disabled={!replyText.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto text-xs py-2"
              >
                Send Reply
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </SlideOver>
  );
}
