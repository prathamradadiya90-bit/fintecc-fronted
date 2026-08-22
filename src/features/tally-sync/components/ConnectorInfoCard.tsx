'use client';

import React, { useState } from 'react';
import { Terminal, Laptop, CheckCircle2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ConnectorInfoCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const commandText = 'cd tally-connector && npm install && node index.js';

  const handleCopy = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="p-5 rounded-2xl border transition-all"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20 text-[#00C2B3] flex items-center justify-center shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
              Desktop Tally Connector Status
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Bridging cloud queue with your local Tally Prime (HTTP port <span className="font-mono text-[11px] text-[#00C2B3]">9000</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Queue Polling Active
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            rightIcon={isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {isExpanded ? 'Hide Setup' : 'Setup Guide'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3 text-xs animate-fadeIn">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            To enable real-time direct syncing without downloading XML files manually:
          </p>

          <ol className="list-decimal list-inside space-y-1.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>
            <li>Open <span className="font-semibold text-[#00C2B3]">Tally Prime</span> on your computer and open your client company.</li>
            <li>Ensure Tally's HTTP Server is running on port <span className="font-mono">9000</span> (Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">F12 &gt; Advanced Configuration</kbd>).</li>
            <li>Run the lightweight connector script on your desktop:</li>
          </ol>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px]">
            <div className="flex items-center gap-2 overflow-x-auto">
              <Terminal className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{commandText}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 hover:text-teal-400 transition-colors ml-2 shrink-0"
              title="Copy Command"
            >
              {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
