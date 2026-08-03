"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '@/lib/store/api/authApi';
import type { RootState } from '@/lib/store/store';

/**
 * Protects all routes under /super-admin/(panel).
 * Redirects to /super-admin (login) if not authenticated or not a SUPER_ADMIN.
 */
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Re-use the global /me query to re-hydrate auth state on page refresh
  const { isLoading, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (!isAuthenticated) {
      router.push('/super-admin');
      return;
    }

    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/super-admin');
    }
  }, [isLoading, isFetching, isAuthenticated, user, router]);

  if (isLoading || isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#060E1E]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C2B3]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return <>{children}</>;
}
