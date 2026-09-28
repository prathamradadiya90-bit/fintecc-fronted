"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    // Suppress generic error toast for billing/limit errors since the dedicated modal is displayed
    if (type === 'error' && typeof message === 'string' && (message.includes('ACCESS_DENIED') || message.includes('LIMIT_EXCEEDED') || message.includes('Plan Limit Reached'))) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100"
              style={{
                background: isSuccess
                  ? 'var(--color-bg-card)'
                  : isError
                  ? 'var(--color-bg-card)'
                  : 'var(--color-bg-card)',
                borderColor: isSuccess
                  ? 'var(--color-status-success-border, rgba(61, 122, 100, 0.25))'
                  : isError
                  ? 'var(--color-status-danger-border, rgba(158, 74, 74, 0.25))'
                  : 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <div className="flex items-center gap-3">
                {isSuccess && <CheckCircle2 className="w-[18px] h-[18px] shrink-0" style={{ color: '#3D7A64' }} />}
                {isError && <AlertCircle className="w-[18px] h-[18px] shrink-0" style={{ color: '#9E4A4A' }} />}
                {!isSuccess && !isError && <Info className="w-[18px] h-[18px] shrink-0" style={{ color: '#4A6FA5' }} />}
                <p className="text-[13px] font-semibold leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
