'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UsageLimitModal } from '@/components/common/UsageLimitModal';

export interface UsageLimitDetail {
  message: string;
  type?: 'ACCESS_DENIED' | 'LIMIT_EXCEEDED' | 'PLAN_LIMIT';
  title?: string;
}

interface UsageLimitContextType {
  showUsageLimit: (detail: UsageLimitDetail) => void;
  closeUsageLimit: () => void;
}

const UsageLimitContext = createContext<UsageLimitContextType | undefined>(undefined);

export const USAGE_LIMIT_EVENT = 'fintecc:usage-limit-exceeded';

/**
 * Utility function to dispatch usage limit events from anywhere (e.g., RTK Query baseQuery, non-React files)
 */
export function dispatchUsageLimitError(detail: UsageLimitDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USAGE_LIMIT_EVENT, { detail }));
  }
}

export function UsageLimitProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<UsageLimitDetail>({
    message: '',
    type: 'LIMIT_EXCEEDED',
  });

  const showUsageLimit = useCallback((detail: UsageLimitDetail) => {
    setModalData(detail);
    setIsOpen(true);
  }, []);

  const closeUsageLimit = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleUsageLimitEvent = (event: Event) => {
      const customEvent = event as CustomEvent<UsageLimitDetail>;
      if (customEvent.detail) {
        showUsageLimit(customEvent.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(USAGE_LIMIT_EVENT, handleUsageLimitEvent);
      return () => {
        window.removeEventListener(USAGE_LIMIT_EVENT, handleUsageLimitEvent);
      };
    }
  }, [showUsageLimit]);

  return (
    <UsageLimitContext.Provider value={{ showUsageLimit, closeUsageLimit }}>
      {children}
      <UsageLimitModal
        isOpen={isOpen}
        onClose={closeUsageLimit}
        message={modalData.message}
        type={modalData.type}
        title={modalData.title}
      />
    </UsageLimitContext.Provider>
  );
}

export function useUsageLimit() {
  const context = useContext(UsageLimitContext);
  if (!context) {
    throw new Error('useUsageLimit must be used within a UsageLimitProvider');
  }
  return context;
}
