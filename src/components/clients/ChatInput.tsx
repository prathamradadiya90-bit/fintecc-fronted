'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, attachmentFile?: File) => void;
  isSending: boolean;
  isUploading: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatInput({ onSend, isSending, isUploading }: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = isSending || isUploading;
  const canSend = (text.trim().length > 0 || attachedFile) && !isDisabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(text.trim(), attachedFile ?? undefined);
    setText('');
    setAttachedFile(null);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, attachedFile, canSend, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize textarea
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div
      className="px-4 py-3"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
      }}
    >
      {/* Attached file preview */}
      {attachedFile && (
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-2"
          style={{
            background: 'var(--color-bg-skeleton)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {attachedFile.name}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {formatFileSize(attachedFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            disabled={isDisabled}
            className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className="p-2.5 rounded-xl transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50 shrink-0"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Attach file"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.doc,.docx"
        />

        {/* Text input */}
        <div
          className="flex-1 rounded-xl px-4 py-2.5 min-h-[42px] flex items-center"
          style={{
            background: 'var(--color-bg-input)',
            border: '1px solid var(--color-border)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isDisabled}
            rows={1}
            className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50"
            style={{
              color: 'var(--color-text-primary)',
              maxHeight: '120px',
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="p-2.5 rounded-xl bg-[#00C2B3] hover:bg-[#00a89b] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
          title="Send message"
        >
          {isSending || isUploading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <Send className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}
