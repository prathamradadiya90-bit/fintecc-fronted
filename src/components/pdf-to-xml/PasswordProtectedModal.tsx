'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PasswordProtectedModalProps {
  isOpen: boolean;
  fileName?: string;
  onClose: () => void;
  onUnlockSubmit?: (password: string) => void;
  isUnlocking?: boolean;
}

export function PasswordProtectedModal({
  isOpen,
  fileName,
  onClose,
  onUnlockSubmit,
  isUnlocking = false,
}: PasswordProtectedModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlockSubmit && password.trim()) {
      onUnlockSubmit(password.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-5 animate-scaleUp"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                PDF is Password Protected
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {fileName || 'The selected PDF statement'} is encrypted.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Encrypted Document</span>
          </div>
          <p className="text-amber-700 dark:text-amber-300 leading-relaxed text-[12px]">
            Banks typically encrypt statements using standard combinations:
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300">
            <li><strong>HDFC / SBI / ICICI</strong>: Date of Birth (DDMMYYYY) or PAN Number (in UPPERCASE)</li>
            <li><strong>Axis / Kotak</strong>: First 4 letters of name + DDMM or Customer ID</li>
          </ul>
        </div>

        {onUnlockSubmit ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Enter PDF Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. ABCDE1234F or 01011990"
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="ghost" onClick={onClose} size="sm" className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUnlocking}
                disabled={!password.trim()}
                className="text-xs"
              >
                Unlock &amp; Parse
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="primary" onClick={onClose} size="sm" className="text-xs">
              Got it, upload unlocked PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
