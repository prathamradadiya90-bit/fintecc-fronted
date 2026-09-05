"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useGetMySubscriptionQuery } from '@/lib/store/api/plansApi';
import type { RootState } from '@/lib/store/store';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Super Admin is exempt from firm subscription requirements
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data, isLoading, isFetching } = useGetMySubscriptionQuery(undefined, {
    skip: !isAuthenticated || isSuperAdmin,
  });

  const hasActivePlan = isSuperAdmin || Boolean(data?.data?.hasActivePlan);
  const isSubscriptionPage = pathname === '/dashboard/subscription';

  useEffect(() => {
    // If not loading and firm does not have an active plan, redirect to the subscription page
    if (!isLoading && !isFetching && isAuthenticated && !hasActivePlan && !isSubscriptionPage) {
      router.replace('/dashboard/subscription');
    }
  }, [isLoading, isFetching, isAuthenticated, hasActivePlan, isSubscriptionPage, router]);

  // Loading state while verifying subscription status
  if ((isLoading || isFetching) && !hasActivePlan && !isSubscriptionPage) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#00C2B3]/20 border-t-[#00C2B3] rounded-full animate-spin" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Verifying subscription access...
        </p>
      </div>
    );
  }

  // If user does not have an active plan and is trying to access a guarded feature
  if (!hasActivePlan && !isSubscriptionPage) {
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
          View Plans & Subscribe
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
