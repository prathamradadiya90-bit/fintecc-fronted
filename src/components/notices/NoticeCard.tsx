'use client';

import React from 'react';
import { 
  FileText, 
  Calendar, 
  IndianRupee, 
  ExternalLink, 
  Building2, 
  AlertCircle,
  Clock,
  GripVertical
} from 'lucide-react';
import type { Notice } from '@/lib/types/notice.types';

interface NoticeCardProps {
  notice: Notice;
  onStatusChange: (id: string, type: 'GST' | 'ITR', newStatus: string) => void;
  isUpdating?: boolean;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onStatusChange,
  isUpdating = false,
}) => {
  const isGst = notice.type === 'GST';
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: notice.id, type: notice.type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const getDaysRemaining = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysRemaining(notice.dueDate);
  const amount = Number(notice.amountDemanded || 0);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative ${
        isUpdating ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      {/* Top row: Type badge & Drag handle */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              isGst
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {notice.type} Notice
          </span>
          {notice.sectionCode && (
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              Sec {notice.sectionCode}
            </span>
          )}
          {notice.noticeType && (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {notice.noticeType}
            </span>
          )}
        </div>

        <div className="text-slate-300 group-hover:text-slate-500 transition">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Notice Number */}
      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1" title={notice.noticeNumber}>
        {notice.noticeNumber || 'Notice #' + notice.id.slice(0, 8)}
      </h4>

      {/* Client Info */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-medium truncate">{notice.client?.name || 'Unknown Client'}</span>
      </div>

      {/* Demand Amount */}
      {amount > 0 && (
        <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-2 mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-rose-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Demand
          </span>
          <span className="text-xs font-bold text-rose-800 font-mono">
            ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* Due Date & PDF Link */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        {notice.dueDate ? (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className={daysLeft !== null && daysLeft <= 5 ? 'font-semibold text-rose-600' : ''}>
              {new Date(notice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              {daysLeft !== null && (
                <span className="text-[10px] ml-1 opacity-80">
                  ({daysLeft < 0 ? 'Overdue' : `${daysLeft}d`})
                </span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No due date</span>
        )}

        {notice.documentUrl ? (
          <a
            href={notice.documentUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-0.5 rounded transition"
          >
            <FileText className="w-3 h-3" />
            PDF <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : null}
      </div>

      {/* Quick Move Dropdown */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] uppercase font-semibold text-slate-400">Move to</span>
        <select
          value={notice.status?.toUpperCase() || 'OPEN'}
          onChange={(e) => onStatusChange(notice.id, notice.type, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] py-1 px-2 bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="OPEN">Received / Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CLOSED">Closed / Resolved</option>
        </select>
      </div>
    </div>
  );
};
