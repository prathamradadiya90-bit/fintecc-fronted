import React from 'react';
import { Check, Clock, FileCheck2, Send, CheckCircle2 } from 'lucide-react';
import type { ReturnStatus } from '@/lib/types/gst.types';

interface FilingProgressStepperProps {
  status: ReturnStatus | string;
  isComputed?: boolean;
}

export const FilingProgressStepper: React.FC<FilingProgressStepperProps> = ({
  status,
  isComputed = false,
}) => {
  const steps = [
    { id: 'DRAFT', label: 'Draft Created', icon: Clock },
    { id: 'COMPUTED', label: 'Tax Computed', icon: FileCheck2 },
    { id: 'CLIENT_APPROVED', label: 'Client Approved', icon: Send },
    { id: 'FILED', label: 'Return Filed', icon: CheckCircle2 },
  ];

  const getStepState = (stepId: string) => {
    if (status === 'FILED') return 'completed';
    
    if (stepId === 'DRAFT') return 'completed';

    if (stepId === 'COMPUTED') {
      if (isComputed || ['READY_FOR_REVIEW', 'CLIENT_APPROVED', 'FILED'].includes(status)) {
        return 'completed';
      }
      return 'current';
    }

    if (stepId === 'CLIENT_APPROVED') {
      if (['CLIENT_APPROVED', 'FILED'].includes(status)) return 'completed';
      if (status === 'READY_FOR_REVIEW') return 'current';
      return 'pending';
    }

    if (stepId === 'FILED') {
      if (status === 'FILED') return 'completed';
      if (status === 'CLIENT_APPROVED') return 'current';
      return 'pending';
    }

    return 'pending';
  };

  return (
    <div
      className="p-4 rounded-2xl border shadow-sm"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const state = getStepState(step.id);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <div
                  className={`flex-1 h-1 transition-colors mx-2 ${
                    state === 'completed'
                      ? 'bg-[#00C2B3]'
                      : state === 'current'
                      ? 'bg-teal-200 dark:bg-teal-900'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Step circle & label */}
              <div className="flex flex-col items-center shrink-0 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    state === 'completed'
                      ? 'bg-[#00C2B3] text-white shadow-md'
                      : state === 'current'
                      ? 'border-2 border-[#00C2B3] text-[#00C2B3] bg-teal-50 dark:bg-teal-950/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>

                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    state === 'completed'
                      ? 'text-[var(--color-text-primary)]'
                      : state === 'current'
                      ? 'text-[#00C2B3]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
