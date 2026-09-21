'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Layers,
  ChevronRight,
  BookOpen,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-guide-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border animate-in fade-in zoom-in-95 duration-200 z-10"
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
            <div className="w-10 h-10 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center shrink-0 mt-0.5 border border-[#00C2B3]/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="module-guide-title"
                  className="text-lg font-bold"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {guide.title} Guide
                </h2>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#00C2B3]/10 text-[#00C2B3]">
                  {guide.category}
                </span>
              </div>
              <p
                className="text-xs sm:text-sm mt-1 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {guide.tagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none shrink-0"
            title="Close Guide"
            aria-label="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="px-5 pt-3 border-b flex items-center gap-2 overflow-x-auto shrink-0"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'workflow'
                ? 'border-[#00C2B3] text-[#00C2B3]'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Where to Start (Workflow)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'features'
                ? 'border-[#00C2B3] text-[#00C2B3]'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Key Features ({guide.keyFeatures.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tips'
                ? 'border-[#00C2B3] text-[#00C2B3]'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Pro Tips & FAQ
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Executive Overview Box */}
          <div
            className="p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border"
            style={{
              background: 'var(--color-bg-page)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span className="font-semibold text-[#00C2B3] block mb-0.5">Summary</span>
            {guide.overview}
          </div>

          {/* Tab 1: Workflow Steps */}
          {activeTab === 'workflow' && (
            <div className="space-y-3 pt-1">
              <h3
                className="text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Recommended Step-by-Step Flow
              </h3>
              <div className="space-y-3">
                {guide.whereToStart.map((step) => (
                  <div
                    key={step.step}
                    className="p-3.5 rounded-xl border flex items-start gap-3 transition-all hover:border-[#00C2B3]/40"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#00C2B3] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-bold"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        {step.title}
                      </h4>
                      <p
                        className="text-xs sm:text-sm mt-1 leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {step.description}
                      </p>
                      {step.tip && (
                        <div className="mt-2 text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                          <span>Tip: {step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Key Features Grid */}
          {activeTab === 'features' && (
            <div className="space-y-3 pt-1">
              <h3
                className="text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Module Capabilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.keyFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border flex flex-col justify-between"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4
                          className="text-sm font-bold"
                          style={{ color: 'var(--color-text-heading)' }}
                        >
                          {feature.title}
                        </h4>
                        {feature.tag && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
            </div>
          )}

          {/* Tab 3: Pro Tips & FAQ */}
          {activeTab === 'tips' && (
            <div className="space-y-4 pt-1">
              {guide.proTips.length > 0 && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5"
                  >
                    Practice Pro Tips
                  </h3>
                  <div className="space-y-2">
                    {guide.proTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border flex items-start gap-2.5"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {guide.faqs && guide.faqs.length > 0 && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5"
                  >
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-2.5">
                    {guide.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <h4
                          className="text-xs sm:text-sm font-bold flex items-center gap-1.5"
                          style={{ color: 'var(--color-text-heading)' }}
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-[#00C2B3]" />
                          {faq.question}
                        </h4>
                        <p
                          className="text-xs sm:text-sm mt-1.5 pl-5 leading-relaxed"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={handleOpenAi}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#00C2B3] hover:text-[#00A89B] transition-colors focus:outline-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Have specific questions? Ask Fintecc AI</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#00C2B3] hover:bg-[#00A89B] text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>Got It, Let's Start</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
