'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useGetComplianceCalendarQuery } from '@/lib/store/api/gstApi';
import type { ComplianceCalendarEvent } from '@/lib/types/gst.types';

export function GstComplianceCalendar() {
  const { data: response, isLoading } = useGetComplianceCalendarQuery();
  const [filter, setFilter] = useState<string>('ALL');

  // Fallback realistic statutory GST dates if backend returns empty
  const defaultEvents: ComplianceCalendarEvent[] = [
    {
      id: 'gstr1-monthly',
      title: 'GSTR-1 Monthly Return',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 11).toISOString(),
      category: 'GSTR-1',
      description: 'Outward supplies statement for regular taxpayers with turnover > ₹5 Crore',
    },
    {
      id: 'iff-qrmp',
      title: 'IFF (Invoice Furnishing Facility)',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 13).toISOString(),
      category: 'IFF',
      description: 'B2B invoice upload for taxpayers registered under QRMP scheme',
    },
    {
      id: 'gstr3b-monthly',
      title: 'GSTR-3B Monthly Summary & Tax Payment',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
      category: 'GSTR-3B',
      description: 'Self-assessed summary return and net tax liability settlement',
    },
    {
      id: 'pmt06-challan',
      title: 'PMT-06 Monthly Tax Deposit (QRMP)',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString(),
      category: 'PMT-06',
      description: 'Payment of tax by taxpayers opting for QRMP scheme for M1 and M2',
    },
  ];

  const events: ComplianceCalendarEvent[] =
    response?.data && response.data.length > 0 ? response.data : defaultEvents;

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    return ev.category === filter;
  });

  const getUrgency = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        badgeCls: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
      };
    }
    if (diffDays <= 5) {
      return {
        label: `Due in ${diffDays} days`,
        badgeCls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200',
        icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
      };
    }
    return {
      label: `Due in ${diffDays} days`,
      badgeCls: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />,
    };
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              GST Statutory Compliance Calendar
            </h3>
            <p className="text-xs text-slate-500">Upcoming return filing and tax deposit cutoffs</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'GSTR-1', 'GSTR-3B', 'PMT-06'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === cat
                  ? 'bg-[#00C2B3] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredEvents.map((ev) => {
          const urgency = getUrgency(ev.dueDate);
          return (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00C2B3]">
                    {ev.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${urgency.badgeCls}`}
                  >
                    {urgency.icon}
                    {urgency.label}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {ev.title}
                </h4>
                {ev.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Cutoff:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {new Date(ev.dueDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </span>
                <span className="text-slate-400 flex items-center gap-0.5 text-[11px]">
                  Statutory <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
