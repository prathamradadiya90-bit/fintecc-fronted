"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '@/lib/store/api/authApi';
import type { RootState } from '@/lib/store/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // The query will use the cached result from StoreProvider's initial fetch
  // or refetch if it was somehow cleared.
  const { isLoading, isFetching } = useGetMeQuery();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isFetching && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isFetching, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading || isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F7F9FC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If we're done loading but still not authenticated, we return null 
  // because the useEffect will trigger the redirect.
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}
