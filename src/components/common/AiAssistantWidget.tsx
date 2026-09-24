'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  X
} from 'lucide-react';
import { useSendAiMessageMutation } from '@/lib/store/api/aiApi';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'What is the latest GST filing deadline for GSTR-1?',
  'What are the TDS rates under Section 194C?',
  'What are the advance tax installment due dates?',
  'MCA compliance checklist for private limited companies',
];

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const msgSeqRef = useRef(1);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('fintecc_ai_dismissed') === 'true') {
      setIsDismissed(true);
    }

    const handleOpenAi = () => {
      setIsDismissed(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fintecc_ai_dismissed');
      }
      setIsOpen(true);
    };

    window.addEventListener('open-fintecc-ai', handleOpenAi);
    return () => {
      window.removeEventListener('open-fintecc-ai', handleOpenAi);
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fintecc_ai_dismissed', 'true');
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Hello! I am Fintecc AI, your compliance and tax intelligence assistant. Ask me anything about GST, Income Tax, MCA, or firm workflows.',
      timestamp: 'Now',
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [sendAiMessage, { isLoading }] = useSendAiMessageMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userSeq = msgSeqRef.current++;
    const userMessage: Message = {
      id: `user-${userSeq}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMessage('');

    try {
      const response = await sendAiMessage({ message: query }).unwrap();
      const aiResponseText = response?.data?.response || 'I could not generate a response. Please try again.';

      const assistantSeq = msgSeqRef.current++;
      const assistantMessage: Message = {
        id: `assistant-${assistantSeq}`,
        sender: 'assistant',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      let errorMsg = 'Sorry, I encountered an error connecting to Fintecc AI.';
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const errorData = (error as { data: unknown }).data;
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          errorMsg = String((errorData as { message: unknown }).message);
        }
      }

      const errSeq = msgSeqRef.current++;
      const errorMessage: Message = {
        id: `err-${errSeq}`,
        sender: 'assistant',
        text: errorMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: 'Hello! I am Fintecc AI, your compliance and tax intelligence assistant. Ask me anything about GST, Income Tax, MCA, or firm workflows.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (isDismissed && !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="group relative inline-flex items-center bg-[#0F172A] dark:bg-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-500/30">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 pl-4 pr-3.5 py-3 select-none text-left focus:outline-none"
            aria-label="Open Fintecc AI Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-emerald-400 dark:text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Ask Fintecc AI</span>
          </button>

          {/* Close button shown on hover */}
          <button
            type="button"
            onClick={handleDismiss}
            className="overflow-hidden w-0 group-hover:w-7 opacity-0 group-hover:opacity-100 group-hover:mr-2.5 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 dark:text-white/80 dark:hover:text-white dark:hover:bg-black/20 transition-all duration-200 focus:opacity-100 focus:w-7 focus:mr-2.5 focus:outline-none shrink-0"
            title="Close"
            aria-label="Close Ask Fintecc AI"
          >
            <X className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}

      {/* Expanded Chat Drawer / Card */}
      {isOpen && (
        <div
          className="w-[360px] sm:w-[410px] h-[550px] max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border animate-in fade-in slide-in-from-bottom-5 duration-300"
          style={{
            background: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center justify-between shrink-0"
            style={{
              background: 'var(--color-bg-elevated)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                    Fintecc AI
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Gemini CA
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Tax & Compliance Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear Chat"
                aria-label="Clear Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
                aria-label="Close Chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3.5"
            style={{ background: 'var(--color-bg-page)' }}
          >
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm relative group ${
                      isAssistant
                        ? 'rounded-tl-sm'
                        : 'bg-emerald-600 text-white rounded-br-sm'
                    }`}
                    style={
                      isAssistant
                        ? {
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }
                        : undefined
                    }
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div
                      className={`flex items-center justify-between gap-2 mt-1.5 text-[10px] ${
                        isAssistant ? 'text-slate-400' : 'text-emerald-100'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-emerald-600 dark:text-emerald-400"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mb-0.5 text-xs font-semibold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Thinking with firm context...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div
              className="p-2.5 overflow-x-auto flex gap-1.5 shrink-0"
              style={{
                background: 'var(--color-bg-subtle)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors hover:border-emerald-500 disabled:opacity-50"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div
            className="p-3 shrink-0"
            style={{
              background: 'var(--color-bg-card)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-colors focus-within:border-emerald-500"
              style={{
                background: 'var(--color-bg-page)',
                borderColor: 'var(--color-border)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about GST, ITR, MCA, TDS..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 py-1"
                style={{ color: 'var(--color-text-primary)' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Fintecc AI can provide compliance guidance. Always verify with official gazettes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
