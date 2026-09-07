"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useGetMySubscriptionQuery } from '@/lib/store/api/plansApi';
import type { RootState } from '@/lib/store/store';
import { Lock, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { SubscriptionStatus } from '@/lib/types/plan.types';

/**
 * Determines whether a given subscription status grants dashboard access.
 *
 * - `active`: full access
 * - `cancelled`: retained access until endDate (cron job enforces final expiry)
 * - `halted` / `expired` / `failed` / `pending`: no access
 */
function hasAccessByStatus(
  status: SubscriptionStatus | undefined,
  endDate: string | null | undefined
): boolean {
  if (!status) return false;
  if (status === 'active') return true;
  if (status === 'cancelled' && endDate && new Date(endDate) > new Date()) return true;
  return false;
}

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Super Admin is exempt from firm subscription requirements
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data, isLoading, isFetching } = useGetMySubscriptionQuery(undefined, {
    skip: !isAuthenticated || isSuperAdmin,
  });

  const subscription = data?.data?.subscription;
  const subStatus = subscription?.status;

  const hasAccess =
    isSuperAdmin ||
    Boolean(data?.data?.hasActivePlan) ||
    hasAccessByStatus(subStatus, subscription?.endDate);

  const isSubscriptionPage = pathname === '/dashboard/subscription';

  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      isAuthenticated &&
      !hasAccess &&
      !isSubscriptionPage
    ) {
      router.replace('/dashboard/subscription');
    }
  }, [isLoading, isFetching, isAuthenticated, hasAccess, isSubscriptionPage, router]);

  // Loading state while verifying subscription
  if ((isLoading || isFetching) && !hasAccess && !isSubscriptionPage) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#00C2B3]/20 border-t-[#00C2B3] rounded-full animate-spin" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Verifying subscription access...
        </p>
      </div>
    );
  }

  // Halted — access fully revoked
  if (subStatus === 'halted' && !isSubscriptionPage) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/40 text-center shadow-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-800">
          <XCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Subscription Halted – Access Revoked
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          All payment retry attempts have failed and your account access has been revoked. Please choose a new plan to restore access.
        </p>
        <Button
          variant="primary"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold"
          onClick={() => router.push('/dashboard/subscription')}
        >
          Choose a Plan
        </Button>
      </div>
    );
  }

  // Cancelled but still within access window — show a persistent warning banner above content
  if (subStatus === 'cancelled' && hasAccess && !isSubscriptionPage) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 animate-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl p-1.5 bg-amber-100 dark:bg-amber-900/40 shrink-0 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Subscription Cancelled
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              Your subscription is cancelled. Access continues until{' '}
              {subscription?.endDate
                ? new Date(subscription.endDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'the end of your billing period'}
              .{' '}
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="underline font-semibold hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              >
                Renew now
              </button>
            </p>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // No active plan — block access and show standard locked screen
  if (!hasAccess && !isSubscriptionPage) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#111827] border border-amber-200 dark:border-amber-900/40 text-center shadow-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
          <Lock className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Plan Required to Access Features
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          You do not have an active subscription plan. All dashboard features are locked until a plan is activated.
        </p>
        <Button
          variant="primary"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold"
          onClick={() => router.push('/dashboard/subscription')}
        >
          View Plans &amp; Subscribe
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
