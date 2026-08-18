'use client';

import React from 'react';
import { Check, CheckCheck, Paperclip, Download } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/chat.types';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getAttachmentName(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  // Strip the hash prefix for display (e.g. "abc123-1234567890.pdf" → "document.pdf")
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex > 0) {
    const ext = filename.substring(dotIndex);
    return `attachment${ext}`;
  }
  return 'attachment';
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const hasAttachment = !!message.attachmentUrl;
  const attachmentFullUrl = message.attachmentUrl
    ? (message.attachmentUrl.startsWith('http')
        ? message.attachmentUrl
        : `${apiBaseUrl}/${message.attachmentUrl.replace(/^\//, '')}`)
    : null;
  const isImage = attachmentFullUrl ? isImageUrl(attachmentFullUrl) : false;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`
          max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm
          ${isOwn
            ? 'bg-[#00C2B3] text-white rounded-br-md'
            : 'rounded-bl-md'
          }
        `}
        style={!isOwn ? {
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        } : undefined}
      >
        {/* Attachment */}
        {hasAttachment && attachmentFullUrl && (
          <div className={`mb-2 ${isImage ? '' : 'flex items-center gap-2'}`}>
            {isImage ? (
              <a
                href={attachmentFullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachmentFullUrl}
                  alt="attachment"
                  className="rounded-lg max-h-48 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </a>
            ) : (
              <a
                href={attachmentFullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${isOwn
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'hover:opacity-80'
                  }
                `}
                style={!isOwn ? {
                  background: 'var(--color-bg-skeleton)',
                  color: 'var(--color-text-primary)',
                } : undefined}
              >
                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{getAttachmentName(message.attachmentUrl!)}</span>
                <Download className="w-3.5 h-3.5 shrink-0 ml-auto" />
              </a>
            )}
          </div>
        )}

        {/* Message text */}
        {message.message && (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={!isOwn ? { color: 'var(--color-text-primary)' } : undefined}
          >
            {message.message}
          </p>
        )}

        {/* Footer: time + read status */}
        <div
          className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
          <span
            className="text-[10px] opacity-70"
            style={!isOwn ? { color: 'var(--color-text-muted)' } : undefined}
          >
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            message.isRead
              ? <CheckCheck className="w-3.5 h-3.5 text-white/80" />
              : <Check className="w-3.5 h-3.5 text-white/60" />
          )}
        </div>
      </div>
    </div>
  );
}
