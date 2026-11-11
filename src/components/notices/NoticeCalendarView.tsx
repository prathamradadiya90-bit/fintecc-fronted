import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileText,
  IndianRupee,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NoticeCalendarViewProps {
  notices: any[];
}

export const NoticeCalendarView: React.FC<NoticeCalendarViewProps> = ({ notices }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map notices to dates (by dueDate or issuedDate)
  const noticesByDate = new Map<string, any[]>();
  for (const n of notices) {
    const due = n.dueDate || n.replyDeadline;
    if (due) {
      const dateKey = new Date(due).toISOString().split('T')[0];
      if (!noticesByDate.has(dateKey)) noticesByDate.set(dateKey, []);
      noticesByDate.get(dateKey)!.push({ ...n, dateType: 'DUE' });
    }

    const issued = n.issueDate || n.issuedDate;
    if (issued) {
      const dateKey = new Date(issued).toISOString().split('T')[0];
      if (!noticesByDate.has(dateKey)) noticesByDate.set(dateKey, []);
      noticesByDate.get(dateKey)!.push({ ...n, dateType: 'ISSUED' });
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div
        className="p-4 rounded-2xl border flex items-center justify-between"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-[var(--color-text-heading)]">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Due Date
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Issued
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Closed
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-[var(--color-text-secondary)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] rounded-xl bg-[var(--color-bg-subtle)] opacity-30" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayNotices = noticesByDate.get(dayString) || [];
            const isToday = new Date().toISOString().split('T')[0] === dayString;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[90px] p-2 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isToday
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-[var(--color-border)] hover:border-slate-400'
                }`}
                style={{ background: 'var(--color-bg-card)' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono font-bold text-xs ${
                      isToday ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-[var(--color-text-heading)]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayNotices.length > 0 && (
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      {dayNotices.length} event{dayNotices.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Notice Badges */}
                <div className="space-y-1 mt-1">
                  {dayNotices.slice(0, 2).map((n, nIdx) => {
                    const isDue = n.dateType === 'DUE';
                    const isClosed = ['CLOSED', 'RESOLVED'].includes((n.status || '').toUpperCase());

                    return (
                      <button
                        key={nIdx}
                        onClick={() => setSelectedNotice(n)}
                        className={`w-full text-left p-1 rounded text-[10px] truncate block font-medium transition-colors ${
                          isClosed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                            : isDue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                        }`}
                        title={`${n.client?.name || 'Client'}: ${n.noticeNumber || n.sectionCode}`}
                      >
                        {isDue ? 'ðŸ”´ Due: ' : 'ðŸ”µ '}
                        {n.sectionCode || n.noticeNumber || 'Notice'}
                      </button>
                    );
                  })}
                  {dayNotices.length > 2 && (
                    <span className="text-[9px] text-slate-400 font-medium pl-1">
                      +{dayNotices.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Notice Detail Modal / Drawer */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-[var(--color-text-heading)]">
                  Notice Details ({selectedNotice.noticeNumber || 'N/A'})
                </h3>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="text-slate-400 hover:text-slate-600">âœ•</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[var(--color-text-secondary)]">Client Name:</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedNotice.client?.name || 'Client N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">Notice Type & Section:</span>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {selectedNotice.type || 'GST'} - {selectedNotice.sectionCode || selectedNotice.noticeType || 'General'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[var(--color-text-secondary)]">Issue Date:</span>
                  <div className="font-mono mt-0.5">{selectedNotice.issueDate || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">Reply Deadline:</span>
                  <div className="font-mono font-bold text-rose-600 mt-0.5">{selectedNotice.dueDate || 'N/A'}</div>
                </div>
              </div>

              {selectedNotice.amountDemanded && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <span className="font-semibold">Disputed Demand:</span>{' '}
                  <strong className="font-mono text-sm">â‚¹{Number(selectedNotice.amountDemanded).toLocaleString('en-IN')}</strong>
                </div>
              )}

              {selectedNotice.description && (
                <div>
                  <span className="text-[var(--color-text-secondary)]">Department Observations:</span>
                  <p className="mt-1 p-3 rounded-xl bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] leading-relaxed">
                    {selectedNotice.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-[var(--color-border)]">
              <Button variant="primary" size="sm" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

