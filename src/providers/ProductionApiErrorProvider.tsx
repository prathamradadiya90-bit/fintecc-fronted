'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export interface ProductionApiErrorDetail {
  message: string;
  provider?: string;
}

export const PRODUCTION_API_ERROR_EVENT = 'fintecc:production-api-key-missing';

/**
 * Utility function to dispatch production API key error events from anywhere (e.g., RTK Query baseQuery)
 */
export function dispatchProductionApiError(detail: ProductionApiErrorDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRODUCTION_API_ERROR_EVENT, { detail }));
  }
}

export function ProductionApiErrorProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  useEffect(() => {
    const handleProductionApiError = (event: Event) => {
      const customEvent = event as CustomEvent<ProductionApiErrorDetail>;
      if (customEvent.detail?.message) {
        showToast(customEvent.detail.message, 'error');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PRODUCTION_API_ERROR_EVENT, handleProductionApiError);
      return () => {
        window.removeEventListener(PRODUCTION_API_ERROR_EVENT, handleProductionApiError);
      };
    }
  }, [showToast]);

  return <>{children}</>;
}
