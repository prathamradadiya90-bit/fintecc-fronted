import React from 'react';
import type { UdinStatus } from '@/lib/types/udin.types';

export function UdinStatusBadge({ status }: { status: UdinStatus }) {
  if (status === 'REVOKED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-[rgba(158,74,74,0.08)] text-[#9E4A4A] border-[rgba(158,74,74,0.25)] dark:text-rose-400">
        Revoked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border-[rgba(61,122,100,0.25)] dark:text-emerald-400">
      Active
    </span>
  );
}
