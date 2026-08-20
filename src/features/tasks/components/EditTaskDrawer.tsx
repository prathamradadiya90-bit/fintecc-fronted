'use client';

import React, { useState, useEffect } from 'react';
import { SlideOver } from '@/components/ui/SlideOver';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from './PriorityBadge';
import { StatusCell } from './StatusCell';
import { COMPLIANCE_TYPES, type Task, type TaskStatus, type TaskPriority } from '@/lib/types/task.types';
import type { User } from '@/lib/types/auth.types';
import { Calendar, User as UserIcon, Building2, Repeat, Trash2, CheckCircle2, MessageSquare, Send } from 'lucide-react';

interface EditTaskDrawerProps {
  isOpen: boolean;
  task: Task | null;
  userRole?: string;
  currentUser?: User | null;
  staffList?: User[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

export const EditTaskDrawer: React.FC<EditTaskDrawerProps> = ({
  isOpen,
  task,
  userRole,
  currentUser,
  staffList = [],
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complianceType, setComplianceType] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('NOT_STARTED');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<string>('MONTHLY');

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ userId?: string; userName?: string; text: string; timestamp: string }>>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setComplianceType(task.complianceType || COMPLIANCE_TYPES[0]);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setPriority(task.priority || 'MEDIUM');
      setStatus(task.status || 'NOT_STARTED');
      setIsRecurring(!!task.isRecurring);
      setRecurrencePattern(task.recurrencePattern || 'MONTHLY');
      setComments(task.comments || []);
    }
  }, [task]);

  if (!task) return null;

  const isFirmOwnerOrPartner = userRole === 'FIRM_OWNER' || userRole === 'PARTNER';
  const isJuniorStaff = userRole === 'EMPLOYEE' || userRole === 'ACCOUNTANT';

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdate(task.id, {
        title,
        description: description || null,
        complianceType,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        status,
        isRecurring,
        recurrencePattern: isRecurring ? (recurrencePattern as any) : null,
        comments,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      userId: currentUser?.id,
      userName: currentUser?.name || 'Staff Member',
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    setCommentText('');
    // Auto-persist comment
    onUpdate(task.id, { comments: updated });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        setIsDeleting(true);
        await onDelete?.(task.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete task:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      width="40vw"
      footer={
        <div className="flex items-center justify-between w-full">
          {isFirmOwnerOrPartner && onDelete ? (
            <Button
              variant="outline"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Task
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="bg-[#00C2B3] hover:bg-[#00A89B] text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 pb-6">
        {/* Client Info Card */}
        <div
          className="p-3.5 rounded-2xl border flex items-center justify-between"
          style={{
            background: 'var(--color-bg-subtle)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-[#00C2B3] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {task.client?.name || 'Client Name'}
              </p>
              <p className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                {task.client?.pan ? `PAN: ${task.client.pan}` : ''}{' '}
                {task.client?.gstin ? `• GSTIN: ${task.client.gstin}` : ''}
              </p>
            </div>
          </div>
          <PriorityBadge priority={priority} />
        </div>

        {/* Task Title */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Work / Compliance Type */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Work / Compliance Type
          </label>
          <select
            value={complianceType}
            onChange={(e) => setComplianceType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {COMPLIANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              {!isJuniorStaff && <option value="DONE">Done</option>}
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
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

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
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

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Description / Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Activity & Comments */}
        <div className="pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#00C2B3]" />
            <h4 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Activity & Internal Notes
            </h4>
          </div>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
            {comments.length === 0 ? (
              <p className="text-[11px] text-[var(--color-text-muted)] italic">
                No notes or comments yet.
              </p>
            ) : (
              comments.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl text-xs border"
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[11px] text-[#00C2B3]">
                      {c.userName || 'Staff'}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {new Date(c.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-primary)' }}>
                    {c.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add comment input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write an internal note..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <Button
              type="button"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="px-3 py-1.5 bg-[#00C2B3] text-white hover:bg-[#00A89B]"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </SlideOver>
  );
};
