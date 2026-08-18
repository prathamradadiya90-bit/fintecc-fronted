'use client';

import React, { useEffect, useRef } from 'react';
import { MessageSquare, Loader2, WifiOff } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  chatApi,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useUploadChatAttachmentMutation,
} from '@/lib/store/api/chatApi';
import { useSocket } from '@/lib/hooks/useSocket';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { useToast } from '@/components/ui/Toast';
import type { RootState, AppDispatch } from '@/lib/store/store';
import type { ChatMessage } from '@/lib/types/chat.types';

interface ChatTabProps {
  clientId: string;
}

/** Group messages by date for visual separator headers. */
function groupMessagesByDate(messages: ChatMessage[]): { date: string; messages: ChatMessage[] }[] {
  const groups: Map<string, ChatMessage[]> = new Map();

  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(msg);
  }

  return Array.from(groups.entries()).map(([date, msgs]) => ({ date, messages: msgs }));
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

function getDateLabel(dateStr: string): string {
  // Reconstruct from first message
  const firstMsg = dateStr; // This is already formatted, so we need the raw date
  // We receive formatted string like "18 Aug 2026", so we parse for display labels
  if (isToday(dateStr)) return 'Today';
  if (isYesterday(dateStr)) return 'Yesterday';
  return dateStr;
}

export function ChatTab({ clientId }: ChatTabProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetMessagesQuery(clientId, {
    refetchOnFocus: true,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [uploadAttachment, { isLoading: isUploading }] = useUploadChatAttachmentMutation();

  const messages = response?.data ?? [];

  // ─── Auto-scroll to bottom ──────────────────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // ─── Mark messages as read once on mount / chat open ────────────────────
  const hasMarkedRef = useRef(false);
  useEffect(() => {
    if (clientId && messages.length > 0 && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      markAsRead(clientId);
    }
  }, [clientId, messages.length, markAsRead]);

  // ─── Real-time socket listener ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: ChatMessage) => {
      // If the message belongs to this client chat
      if (newMsg && (newMsg.clientId === clientId || !newMsg.clientId)) {
        // 1. Immediately inject into Redux cache for zero-latency UI update
        dispatch(
          chatApi.util.updateQueryData('getMessages', clientId, (draft) => {
            if (!draft.data) {
              draft.data = [];
            }
            const exists = draft.data.some((m) => m.id === newMsg.id);
            if (!exists) {
              draft.data.push(newMsg);
            }
          })
        );

        // 2. Mark the new message as read if viewing this chat
        if (newMsg.senderId !== user?.id) {
          markAsRead(clientId);
        }
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, clientId, refetch, markAsRead, user?.id, dispatch]);

  // ─── Send handler ──────────────────────────────────────────────────────
  const handleSend = async (messageText: string, attachmentFile?: File) => {
    let attachmentUrl: string | null = null;

    // Upload attachment first if present
    if (attachmentFile) {
      try {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        const uploadResult = await uploadAttachment(formData).unwrap();
        attachmentUrl = uploadResult.data.filePath;
      } catch {
        showToast('Failed to upload attachment', 'error');
        return;
      }
    }

    // Send the message (with or without text)
    const finalMessage = messageText || (attachmentFile ? `Sent a file` : '');
    if (!finalMessage && !attachmentUrl) return;

    try {
      await sendMessage({
        clientId,
        message: finalMessage,
        attachmentUrl,
      }).unwrap();
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  // ─── Date-grouped messages ──────────────────────────────────────────────
  const groupedMessages = groupMessagesByDate(messages);

  // ─── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  // ─── Error state (only if no messages are available in cache) ───────────
  if (isError && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <WifiOff className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Failed to load messages
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Please check your connection and try again.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs font-semibold text-[#00C2B3] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden -m-6"
      style={{
        height: '520px',
        background: 'var(--color-bg-subtle)',
      }}
    >
      {/* Connection indicator */}
      {!isConnected && (
        <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-center">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Connecting to live updates...
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-bg-skeleton)' }}
            >
              <MessageSquare className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No messages yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Start the conversation by sending a message below.
              </p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span
                  className="text-[10px] font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: 'var(--color-bg-skeleton)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {group.date}
                </span>
              </div>

              {/* Messages in this date group */}
              {group.messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isSending={isSending}
        isUploading={isUploading}
      />
    </div>
  );
}
