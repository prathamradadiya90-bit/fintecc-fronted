'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, CheckSquare, FileText, Loader2, X } from 'lucide-react';
import { useGlobalSearchQuery } from '@/lib/store/api/searchApi';

export function GlobalSearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Global Cmd+K / Ctrl+K and Tally Prime Alt+G listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    const handleShortcutSearch = () => {
      inputRef.current?.focus();
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('fintecc:shortcut:search', handleShortcutSearch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('fintecc:shortcut:search', handleShortcutSearch);
    };
  }, []);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldFetch = debouncedQuery.length >= 2;
  const { data: response, isFetching } = useGlobalSearchQuery(debouncedQuery, {
    skip: !shouldFetch,
  });

  const results = response?.data;
  const hasClients = (results?.clients?.length ?? 0) > 0;
  const hasTasks = (results?.tasks?.length ?? 0) > 0;
  const hasDocuments = (results?.documents?.length ?? 0) > 0;
  const hasResults = hasClients || hasTasks || hasDocuments;

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(url);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <Search
          className="absolute left-3 w-4 h-4 pointer-events-none text-[#4A6FA5]"
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or Go To... (Alt+G / ⌘K)"
          className="w-full h-9 pl-9 pr-24 text-xs rounded-xl transition-all outline-none focus:border-[#4A6FA5] focus:ring-1 focus:ring-[#4A6FA5]/25"
          style={{
            background: 'var(--color-bg-input)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setDebouncedQuery('');
            }}
            className="absolute right-2.5 p-0.5 rounded-md hover:opacity-75"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none"
            style={{
              background: 'var(--color-bg-card-hover)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Alt+G / ⌘K
          </kbd>
        )}
      </div>

      {/* Tally Prime Go To Quick Menu (when query is empty) */}
      {isOpen && !shouldFetch && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Tally Prime &ldquo;Go To&rdquo; Quick Hub (Alt+G)
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              Press Esc to close
            </span>
          </div>

          <div className="py-2 divide-y divide-[var(--color-border-subtle)]">
            <div className="p-2 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Financial Reports & Accounts
              </div>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/my-clients')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Balance Sheet & P&L (Multi-Year Schedule III)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  B / P
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/accounting/journal')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Day Book & Journal Vouchers (F4-F9)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  K / V
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/accounting/masters')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Bulk Masters (Ledgers & Stock Items)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  M
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/accounting/import')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Universal Excel / CSV Import to Tally</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  Alt+O
                </kbd>
              </button>
            </div>

            <div className="p-2 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Invoicing & Transactions
              </div>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/invoices')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Tax Invoices (Tally Prime Alt+P Print Layout)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Alt+P
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/bank-statements')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Bank Statements & Auto BRS Reconciliation</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  BRS
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/petty-cash')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Petty Cash Book</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  PC
                </kbd>
              </button>
            </div>

            <div className="p-2 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Statutory & Tax Compliance
              </div>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/gst/returns')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>GST Returns Filing (GSTR-1 & GSTR-3B)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  G
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/gst/ims')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>GST IMS & GSTR-2B Auto-Reconciliation</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  IMS
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/itr')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>Income Tax (ITR) Compliance Hub</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  ITR
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/tds')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>TDS Compliance (24Q, 26Q, 27Q & TRACES)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  TDS
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('/dashboard/udin')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] transition-colors text-left"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>UDIN Register (ICAI Verified)</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  UDIN
                </kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && shouldFetch && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          {isFetching && (
            <div className="flex items-center justify-center p-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Searching across records...
            </div>
          )}

          {!isFetching && !hasResults && (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No results found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {!isFetching && hasResults && (
            <div className="py-2 divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {/* Clients Group */}
              {hasClients && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    <Users className="w-3.5 h-3.5" />
                    Clients
                  </div>
                  {results!.clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelect(`/dashboard/my-clients?search=${encodeURIComponent(client.name)}`)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{client.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{client.email || client.phone || client.type}</p>
                      </div>
                      {client.status && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">
                          {client.status}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Tasks Group */}
              {hasTasks && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    <CheckSquare className="w-3.5 h-3.5" />
                    Tasks
                  </div>
                  {results!.tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleSelect('/dashboard/tasks')}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{task.title}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{task.client?.name ? `Client: ${task.client.name}` : task.status}</p>
                      </div>
                      {task.priority && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-medium capitalize">
                          {task.priority.toLowerCase()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Documents Group */}
              {hasDocuments && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    <FileText className="w-3.5 h-3.5" />
                    Documents
                  </div>
                  {results!.documents.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleSelect('/dashboard/documents')}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{doc.title}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{doc.client?.name ? `Client: ${doc.client.name}` : doc.category}</p>
                      </div>
                      {doc.category && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium">
                          {doc.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
