'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { MessageSquare, Users, AlertCircle } from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { ChatTab } from '@/components/clients/ChatTab';

export default function ChatPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isClient = user?.role === 'CLIENT';
  const clientId = user?.clientId;

  if (isClient) {
    if (!clientId) {
      return (
        <div className="max-w-4xl mx-auto py-12">
          <div
            className="p-6 rounded-2xl flex items-start gap-4"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Client Profile Linking In Progress
              </h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Your account is being connected to your client record. Please contact your CA firm administrator if this persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div
          className="rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold shrink-0 shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Chat with Your CA Firm
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Directly communicate with your chartered accountant and send queries or file attachments.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div
          className="rounded-2xl shadow-sm p-6 overflow-hidden"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <ChatTab clientId={clientId} />
        </div>
      </div>
    );
  }

  // Non-client (CA Firm staff / owner): guide them to pick a client from My Clients
  return (
    <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
      <div
        className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-sm"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <MessageSquare className="w-8 h-8 text-[#00C2B3]" />
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
          Client Messaging
        </h2>
        <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          To chat with a client, open their profile from the client directory and select the Chat tab.
        </p>
      </div>
      <div className="pt-2">
        <Link
          href="/dashboard/my-clients"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00C2B3] hover:bg-[#00a89b] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          Go to My Clients
        </Link>
      </div>
    </div>
  );
}
