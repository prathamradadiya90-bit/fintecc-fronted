'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ZapOff, Crown, ArrowRight, ShieldAlert } from 'lucide-react';

export interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'ACCESS_DENIED' | 'LIMIT_EXCEEDED' | 'PLAN_LIMIT';
}

export function UsageLimitModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'LIMIT_EXCEEDED',
}: UsageLimitModalProps) {
  const router = useRouter();

  const isAccessDenied = type === 'ACCESS_DENIED';
  const defaultTitle = isAccessDenied
    ? 'Active Subscription Required'
    : 'Usage Limit Reached';

  const handleUpgrade = () => {
    onClose();
    router.push('/dashboard/subscription');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || defaultTitle}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Dismiss
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={handleUpgrade}
            leftIcon={<Crown className="w-4 h-4 text-amber-300" />}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Upgrade Plan
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div
          className="p-4 rounded-xl flex items-start gap-3.5"
          style={{
            background: isAccessDenied
              ? 'rgba(239, 68, 68, 0.08)'
              : 'rgba(245, 158, 11, 0.08)',
            border: isAccessDenied
              ? '1px solid rgba(239, 68, 68, 0.2)'
              : '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{
              background: isAccessDenied ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isAccessDenied ? '#ef4444' : '#f59e0b',
            }}
          >
            {isAccessDenied ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <h4
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {isAccessDenied
                ? 'Subscription Inactive or Expired'
                : 'Quota Exhausted for Current Billing Period'}
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-3.5 space-y-2 text-xs"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
            <Crown className="w-3.5 h-3.5 text-[#00C2B3]" />
            <span>Why Upgrade?</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
            <li>Higher or unlimited AI parsing credits (Bank Statements & Invoices)</li>
            <li>Automated Tally Prime syncing and client payment links</li>
            <li>Instant quota reset upon upgrading your firm plan</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
