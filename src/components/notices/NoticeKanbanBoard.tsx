'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { Notice } from '@/lib/types/notice.types';
import { NoticeCard } from './NoticeCard';
import { useUpdateNoticeStatusMutation } from '@/lib/store/api/noticesApi';
import { useToast } from '@/components/ui/Toast';

interface NoticeKanbanBoardProps {
  notices: Notice[];
  isLoading: boolean;
}

interface ColumnConfig {
  id: string;
  title: string;
  statusTarget: string;
  matchStatuses: string[];
  icon: React.ElementType;
  badgeClass: string;
  columnClass: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'received',
    title: 'Received / Open',
    statusTarget: 'OPEN',
    matchStatuses: ['OPEN', 'RECEIVED', 'NEW'],
    icon: Inbox,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    columnClass: 'border-amber-200/60 bg-slate-50/70',
  },
  {
    id: 'in_progress',
    title: 'In Progress / Drafting',
    statusTarget: 'IN_PROGRESS',
    matchStatuses: ['IN_PROGRESS', 'PENDING_REPLY', 'DRAFTING', 'UNDER_REVIEW', 'SCRUTINY'],
    icon: Clock,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    columnClass: 'border-blue-200/60 bg-slate-50/70',
  },
  {
    id: 'closed',
    title: 'Closed / Resolved',
    statusTarget: 'CLOSED',
    matchStatuses: ['CLOSED', 'RESOLVED', 'RESPONDED', 'APPEALED'],
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    columnClass: 'border-emerald-200/60 bg-slate-50/70',
  },
];

export const NoticeKanbanBoard: React.FC<NoticeKanbanBoardProps> = ({
  notices,
  isLoading,
}) => {
  const [updateNoticeStatus] = useUpdateNoticeStatusMutation();
  const { showToast } = useToast();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, type: 'GST' | 'ITR', newStatus: string) => {
    try {
      setUpdatingId(id);
      await updateNoticeStatus({ id, type, status: newStatus }).unwrap();
      showToast(`Notice status moved to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update notice status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { id, type } = JSON.parse(dataStr);
      if (id && type) {
        handleStatusChange(id, type, targetStatus);
      }
    } catch (err) {
      console.error('Failed to parse dropped notice data', err);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((col) => (
          <div key={col} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 h-96 animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-28 bg-white rounded-xl border border-slate-200" />
              <div className="h-28 bg-white rounded-xl border border-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {COLUMNS.map((column) => {
        const Icon = column.icon;
        const columnNotices = notices.filter((notice) => {
          const statusUpper = (notice.status || 'OPEN').toUpperCase();
          return column.matchStatuses.includes(statusUpper);
        });

        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.statusTarget)}
            className={`rounded-2xl border p-4 transition-all duration-200 min-h-[520px] flex flex-col ${
              column.columnClass
            } ${isOver ? 'ring-2 ring-primary-500 bg-primary-50/20 border-primary-300' : ''}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-600" />
                <h3 className="font-bold text-sm text-slate-800">{column.title}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${column.badgeClass}`}>
                {columnNotices.length}
              </span>
            </div>

            {/* Notice Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {columnNotices.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <p className="text-xs font-medium">No notices in this stage</p>
                  <p className="text-[11px] text-slate-400 mt-1">Drag notices here to update status</p>
                </div>
              ) : (
                columnNotices.map((notice) => (
                  <NoticeCard
                    key={`${notice.type}-${notice.id}`}
                    notice={notice}
                    onStatusChange={handleStatusChange}
                    isUpdating={updatingId === notice.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
