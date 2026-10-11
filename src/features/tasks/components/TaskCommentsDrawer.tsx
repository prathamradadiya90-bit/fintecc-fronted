'use client';

import React, { useState } from 'react';
import { useGetCommentsQuery, useAddCommentMutation } from '@/lib/store/api/tasksApi';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, X, User, Paperclip } from 'lucide-react';
import type { Task } from '@/lib/types/task.types';

interface TaskCommentsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskCommentsDrawer({ task, isOpen, onClose }: TaskCommentsDrawerProps) {
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState('');

  const { data: commentsResponse, isLoading } = useGetCommentsQuery(task?.id || '', {
    skip: !task || !isOpen,
  });

  const [addComment, { isLoading: isPosting }] = useAddCommentMutation();

  if (!isOpen || !task) return null;

  const comments = commentsResponse?.data || task.comments || [];

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        id: task.id,
        data: { text: commentText.trim() },
      }).unwrap();

      setCommentText('');
      showToast('Comment posted', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to add comment', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full flex flex-col shadow-2xl border-l animate-in slide-in-from-right duration-200"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E2A38] dark:text-slate-100">
                Task Discussion
              </h3>
              <p className="text-xs text-[#5A6E85] truncate max-w-xs">{task.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#5A6E85]">Loading discussion...</div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-[#5A6E85]">No comments yet. Start the conversation!</p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div
                key={c.timestamp || i}
                className="p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1E2A38] dark:text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-[#4A6FA5]/20 text-[#4A6FA5] flex items-center justify-center text-[10px]">
                      {c.userName ? c.userName[0].toUpperCase() : 'U'}
                    </div>
                    {c.userName || 'Team Member'}
                  </div>
                  <span className="text-[10px] text-[#5A6E85]">
                    {new Date(c.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#1E2A38] dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handlePostComment} className="p-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type comment or status note..."
            className="flex-1 text-xs px-3 py-2.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            isLoading={isPosting}
            disabled={!commentText.trim()}
            className="px-3 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
