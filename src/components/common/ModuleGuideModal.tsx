'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Bot,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { ModuleGuide } from '@/lib/constants/moduleGuides';

interface ModuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: ModuleGuide;
}

export function ModuleGuideModal({ isOpen, onClose, guide }: ModuleGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'workflow' | 'features' | 'tips'>('workflow');

  // Reset tab when guide changes
  useEffect(() => {
    setActiveTab('workflow');
  }, [guide.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenAi = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-fintecc-ai'));
    }
  };

  const displayTitle = guide.title.toLowerCase().endsWith('guide')
    ? guide.title
    : `${guide.title} Guide`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-guide-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border animate-in fade-in zoom-in-95 duration-200 z-10"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-start justify-between border-b shrink-0"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#A8C5DA] flex items-center justify-center shrink-0 mt-0.5 border border-[#4A6FA5]/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="module-guide-title"
                  className="text-base font-bold tracking-tight"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {displayTitle}
                </h2>
                {guide.category && guide.category !== 'Workspace Guide' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5] dark:text-[#A8C5DA]">
                    {guide.category}
                  </span>
                )}
              </div>
              <p
                className="text-xs mt-0.5 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {guide.tagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none shrink-0"
            title="Close Guide"
            aria-label="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation - Pill Segmented Control */}
        <div
          className="px-5 py-2.5 border-b flex items-center gap-1.5 shrink-0"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-[#4A6FA5] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Workflow
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'features'
                ? 'bg-[#4A6FA5] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Key Features ({guide.keyFeatures.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tips'
                ? 'bg-[#4A6FA5] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Pro Tips & FAQ
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Executive Overview Box */}
          {guide.overview && (
            <div
              className="p-3 rounded-xl text-xs leading-relaxed border"
              style={{
                background: 'rgba(74, 111, 165, 0.05)',
                borderColor: 'rgba(74, 111, 165, 0.15)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <strong className="text-[#4A6FA5] dark:text-[#A8C5DA] font-semibold mr-1">Summary:</strong>
              {guide.overview}
            </div>
          )}

          {/* Tab 1: Workflow Steps */}
          {activeTab === 'workflow' && (
            <div className="space-y-2.5">
              {guide.whereToStart.map((step) => (
                <div
                  key={step.step}
                  className="p-3 rounded-xl border flex items-start gap-3 transition-colors hover:border-[#4A6FA5]/40"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="w-5 h-5 rounded-md bg-[#4A6FA5]/15 border border-[#4A6FA5]/30 text-[#4A6FA5] dark:text-[#A8C5DA] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-heading)' }}
                    >
                      {step.title}
                    </h4>
                    <p
                      className="text-xs mt-0.5 leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="mt-1.5 text-[11px] flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-medium">
                        <Lightbulb className="w-3 h-3 shrink-0" />
                        <span>Tip: {step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Key Features Grid */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {guide.keyFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border flex flex-col justify-between"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className="text-xs font-bold"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        {feature.title}
                      </h4>
                      {feature.tag && (
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {feature.tag}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Pro Tips & FAQ */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {guide.proTips.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Practice Pro Tips
                  </h3>
                  {guide.proTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border flex items-start gap-2 text-xs"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {guide.faqs && guide.faqs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Frequently Asked Questions
                  </h3>
                  {guide.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border text-xs"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <h4
                        className="font-semibold flex items-center gap-1.5"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        <ChevronRight className="w-3 h-3 text-[#4A6FA5]" />
                        {faq.question}
                      </h4>
                      <p
                        className="mt-1 pl-4.5 leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between gap-3 shrink-0"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={handleOpenAi}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4A6FA5] dark:text-[#A8C5DA] hover:underline focus:outline-none cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Fintecc AI</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span>Got It</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
