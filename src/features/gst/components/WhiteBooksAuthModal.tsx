'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  useWhitebooksRequestOtpMutation,
  useWhitebooksGetTokenMutation,
} from '@/lib/store/api/gstApi';
import { useToast } from '@/components/ui/Toast';
import { ShieldCheck, Key, CheckCircle2, ArrowRight } from 'lucide-react';

interface WhiteBooksAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGstin?: string;
  onSuccess?: () => void;
}

export function WhiteBooksAuthModal({
  isOpen,
  onClose,
  defaultGstin = '',
  onSuccess,
}: WhiteBooksAuthModalProps) {
  const { showToast } = useToast();
  const [requestOtp, { isLoading: isRequestingOtp }] = useWhitebooksRequestOtpMutation();
  const [getToken, { isLoading: isGettingToken }] = useWhitebooksGetTokenMutation();

  const [step, setStep] = useState<'CREDENTIALS' | 'OTP' | 'SUCCESS'>('CREDENTIALS');
  const [gstin, setGstin] = useState(defaultGstin);
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstin.trim() || !username.trim()) {
      showToast('Please enter both GSTIN and Portal Username', 'error');
      return;
    }

    try {
      await requestOtp({
        gstin: gstin.trim().toUpperCase(),
        username: username.trim(),
      }).unwrap();
      showToast('OTP sent to taxpayer’s registered mobile/email', 'success');
      setStep('OTP');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to request OTP', 'error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      showToast('Please enter the OTP', 'error');
      return;
    }

    try {
      await getToken({
        gstin: gstin.trim().toUpperCase(),
        username: username.trim(),
        otp: otp.trim(),
      }).unwrap();
      showToast('GSP Authentication successful! Token active for 6 hours.', 'success');
      setStep('SUCCESS');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Invalid or expired OTP', 'error');
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('CREDENTIALS');
      setOtp('');
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="WhiteBooks GSP Portal Authentication"
    >
      <div className="space-y-4">
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect to GSTN directly via WhiteBooks GSP to enable instant GSTR-2B ITC pulls and automated return validations.
            </div>

            <Input
              label="GSTIN (15 characters)"
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              required
            />

            <Input
              label="GST Portal Username"
              placeholder="e.g. taxpayer_login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isRequestingOtp} className="flex items-center gap-1.5">
                Request Portal OTP
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-400">
              Enter the 6-digit OTP sent by GSTN to the registered contacts for GSTIN{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-mono">{gstin}</strong>.
            </div>

            <Input
              label="Enter 6-digit OTP"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('CREDENTIALS')}
              >
                Change Username / GSTIN
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isGettingToken} className="flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  Verify & Connect
                </Button>
              </div>
            </div>
          </form>
        )}

        {step === 'SUCCESS' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              GSTN Session Active
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your WhiteBooks GSP session token has been securely acquired and saved. You can now download live GSTR-2B data.
            </p>
            <div className="pt-4 flex justify-center">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
