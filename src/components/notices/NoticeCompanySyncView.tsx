import React from 'react';
import { Building2, AlertCircle, Clock, CheckCircle2, ShieldCheck, IndianRupee } from 'lucide-react';

interface NoticeCompanySyncViewProps {
  notices: any[];
}

export const NoticeCompanySyncView: React.FC<NoticeCompanySyncViewProps> = ({ notices }) => {
  // Group notices by client
  const clientMap = new Map<string, {
    clientName: string;
    panGstin: string;
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    totalDemand: number;
    latestDate: string;
  }>();

  for (const n of notices) {
    const key = n.client?.id || n.clientId || n.client?.name || 'Unknown Client';
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        clientName: n.client?.name || 'Unknown Client',
        panGstin: n.client?.pan || n.gstin || 'N/A',
        total: 0,
        open: 0,
        inProgress: 0,
        closed: 0,
        totalDemand: 0,
        latestDate: n.issueDate || n.createdAt || ''
      });
    }

    const c = clientMap.get(key)!;
    c.total++;
    const st = (n.status || 'OPEN').toUpperCase();
    if (['OPEN', 'RECEIVED', 'NEW'].includes(st)) c.open++;
    else if (['IN_PROGRESS', 'PENDING_REPLY', 'DRAFTING', 'UNDER_REVIEW'].includes(st)) c.inProgress++;
    else c.closed++;

    if (n.amountDemanded) c.totalDemand += Number(n.amountDemanded) || 0;
  }

  const clients = Array.from(clientMap.values()).sort((a, b) => b.open - a.open);

  return (
    <div
      className="p-5 rounded-2xl border space-y-4"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text-heading)]">
            Company-Wise Notice Audit & Sync Matrix
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Consolidated statutory notice exposure per client entity.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)]">
          {clients.length} Entities
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="p-3 font-semibold">Client Entity / ID</th>
              <th className="p-3 font-semibold text-center">Total Notices</th>
              <th className="p-3 font-semibold text-center">Action Required</th>
              <th className="p-3 font-semibold text-center">In Progress</th>
              <th className="p-3 font-semibold text-center">Resolved</th>
              <th className="p-3 font-semibold text-right">Disputed Demand (₹)</th>
              <th className="p-3 font-semibold text-center">Sync Health</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
              >
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{c.clientName}</div>
                  <div className="font-mono text-[10px] text-slate-400">{c.panGstin}</div>
                </td>

                <td className="p-3 text-center font-mono font-bold">{c.total}</td>

                <td className="p-3 text-center">
                  {c.open > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <AlertCircle className="w-3 h-3" /> {c.open}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">0</span>
                  )}
                </td>

                <td className="p-3 text-center">
                  {c.inProgress > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Clock className="w-3 h-3" /> {c.inProgress}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">0</span>
                  )}
                </td>

                <td className="p-3 text-center">
                  {c.closed > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {c.closed}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">0</span>
                  )}
                </td>

                <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                  ₹{c.totalDemand.toLocaleString('en-IN')}
                </td>

                <td className="p-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> Synced
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

