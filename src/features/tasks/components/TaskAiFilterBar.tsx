'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';
import { useFilterTasksWithAiMutation } from '@/lib/store/api/tasksApi';
import { useToast } from '@/components/ui/Toast';
import type { Task } from '@/lib/types/task.types';

interface TaskAiFilterBarProps {
  onAiFilterResults: (tasks: Task[] | null, prompt: string) => void;
  activePrompt: string | null;
  onClear: () => void;
}

export function TaskAiFilterBar({
  onAiFilterResults,
  activePrompt,
  onClear,
}: TaskAiFilterBarProps) {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [filterTasksWithAi, { isLoading }] = useFilterTasksWithAiMutation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const res = await filterTasksWithAi({ prompt: prompt.trim() }).unwrap();
      const results = res.data || [];
      onAiFilterResults(results, prompt.trim());
      showToast(`AI Filter matched ${results.length} task(s)`, 'info');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'AI filter query failed', 'error');
    }
  };

  const handleClear = () => {
    setPrompt('');
    onClear();
  };

  return (
    <div className="relative w-full">
      {activePrompt ? (
        <div
          className="flex items-center justify-between p-2.5 px-3.5 rounded-xl border bg-[#4A6FA5]/10 border-[#4A6FA5]/30 text-xs text-[#1E2A38] dark:text-slate-200"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4A6FA5]" />
            <span>
              AI Query Filter: <strong className="text-[#4A6FA5]">"{activePrompt}"</strong>
            </span>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#5A6E85] hover:text-[#9E4A4A] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear AI Filter
          </button>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Sparkles className="w-4 h-4 absolute left-3 text-[#4A6FA5] pointer-events-none" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="AI Filter: e.g. 'Show all overdue GST filings' or 'High priority tasks in review'..."
            className="w-full text-xs pl-9 pr-20 py-2.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5] placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white disabled:opacity-50 flex items-center gap-1 transition-colors"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
            Filter
          </button>
        </form>
      )}
    </div>
  );
}
