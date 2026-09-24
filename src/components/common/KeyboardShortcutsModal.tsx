'use client';

import React, { useState, useMemo } from 'react';
import { 
  Keyboard, 
  Search, 
  Sparkles, 
  Compass, 
  RefreshCw, 
  Globe, 
  X, 
  ArrowRight,
  Command
} from 'lucide-react';
import { ShortcutsMap } from '@/lib/types/shortcuts.types';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: ShortcutsMap;
}

interface ShortcutItem {
  name: string;
  description: string;
  combo: string;
  category: 'global' | 'navigation' | 'tally';
}

const ACTION_METADATA: Record<string, { label: string; description: string }> = {
  // Global
  search: {
    label: 'Global Search',
    description: 'Quickly find clients, GST returns, or documents',
  },
  newClient: {
    label: 'Create New Client',
    description: 'Open client onboarding modal',
  },
  newInvoice: {
    label: 'Create New Invoice',
    description: 'Launch invoice creation wizard',
  },
  save: {
    label: 'Save Changes',
    description: 'Trigger current document or form save',
  },
  close: {
    label: 'Close / Dismiss',
    description: 'Dismiss active dialogs, drawers, or search',
  },

  // Navigation
  dashboard: {
    label: 'Go to Dashboard',
    description: 'Jump to main firm analytics overview',
  },
  clients: {
    label: 'Go to My Clients',
    description: 'Navigate to client master list',
  },
  vault: {
    label: 'Go to Client Vault',
    description: 'Access encrypted passwords & credentials',
  },
  tasks: {
    label: 'Go to Work Board',
    description: 'View active CA workflow assignments',
  },

  // Tally
  sync: {
    label: 'Tally Prime Sync',
    description: 'Trigger background sync with Tally bridge',
  },
  pushPending: {
    label: 'Push Pending to Tally',
    description: 'Queue and push unposted vouchers',
  },
};

function formatKeyBadge(keyPart: string) {
  const normalized = keyPart.trim();
  if (normalized.toLowerCase() === 'ctrl') return 'Ctrl';
  if (normalized.toLowerCase() === 'alt') return 'Alt';
  if (normalized.toLowerCase() === 'shift') return 'Shift';
  if (normalized.toLowerCase() === 'escape') return 'Esc';
  return normalized.toUpperCase();
}

function renderKeys(combo: string) {
  // Check if it's space-separated (sequence like "G D")
  if (combo.includes(' ')) {
    const keys = combo.split(/\s+/);
    return (
      <div className="flex items-center gap-1.5">
        {keys.map((k, idx) => (
          <React.Fragment key={idx}>
            <kbd className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 text-xs font-semibold rounded-md border shadow-xs bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              {formatKeyBadge(k)}
            </kbd>
            {idx < keys.length - 1 && (
              <span className="text-xs text-slate-400 font-medium">then</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Plus separated combo (e.g. "Ctrl+K")
  const keys = combo.split('+');
  return (
    <div className="flex items-center gap-1">
      {keys.map((k, idx) => (
        <React.Fragment key={idx}>
          <kbd className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 text-xs font-semibold rounded-md border shadow-xs bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            {formatKeyBadge(k)}
          </kbd>
          {idx < keys.length - 1 && (
            <span className="text-[11px] text-slate-400 font-bold">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  mapping,
}: KeyboardShortcutsModalProps) {
  const [filterText, setFilterText] = useState('');

  const shortcutList = useMemo(() => {
    const list: ShortcutItem[] = [];

    // Global
    Object.entries(mapping.global || {}).forEach(([action, combo]) => {
      if (combo) {
        const meta = ACTION_METADATA[action] || {
          label: action,
          description: `Trigger ${action}`,
        };
        list.push({
          name: meta.label,
          description: meta.description,
          combo,
          category: 'global',
        });
      }
    });

    // Navigation
    Object.entries(mapping.navigation || {}).forEach(([action, combo]) => {
      if (combo) {
        const meta = ACTION_METADATA[action] || {
          label: action,
          description: `Navigate to ${action}`,
        };
        list.push({
          name: meta.label,
          description: meta.description,
          combo,
          category: 'navigation',
        });
      }
    });

    // Tally
    Object.entries(mapping.tally || {}).forEach(([action, combo]) => {
      if (combo) {
        const meta = ACTION_METADATA[action] || {
          label: action,
          description: `Tally action: ${action}`,
        };
        list.push({
          name: meta.label,
          description: meta.description,
          combo,
          category: 'tally',
        });
      }
    });

    return list;
  }, [mapping]);

  const filteredShortcuts = useMemo(() => {
    if (!filterText.trim()) return shortcutList;
    const q = filterText.toLowerCase();
    return shortcutList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.combo.toLowerCase().includes(q)
    );
  }, [shortcutList, filterText]);

  const globalItems = filteredShortcuts.filter((s) => s.category === 'global');
  const navItems = filteredShortcuts.filter((s) => s.category === 'navigation');
  const tallyItems = filteredShortcuts.filter((s) => s.category === 'tally');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        style={{ background: 'var(--color-bg-elevated)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts Cheat Sheet"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-subtle)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-base font-bold flex items-center gap-2"
                style={{ color: 'var(--color-text-heading)' }}
              >
                Keyboard Shortcuts
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Quick Actions
                </span>
              </h2>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Speed up client workflows, ledger audits, and navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search filter input */}
        <div
          className="px-5 py-2.5 border-b shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shortcuts or actions (e.g., Vault, Tally, Ctrl+S)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              style={{ color: 'var(--color-text-primary)' }}
              autoFocus
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="px-5 py-4 overflow-y-auto space-y-5 flex-1">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-10">
              <Command className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No matching shortcuts found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for general terms like "client", "save", or "nav"
              </p>
            </div>
          ) : (
            <>
              {/* Global Section */}
              {globalItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Global Commands
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {globalItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="min-w-0 pr-4">
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <div className="shrink-0">{renderKeys(item.combo)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Navigation Section */}
              {navItems.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-500" />
                      <h3
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Navigation (Go-To Sequence)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 italic">
                      Press G, then destination key
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {navItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <div className="shrink-0">{renderKeys(item.combo)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tally Sync Section */}
              {tallyItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                    <h3
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Tally Prime Integration
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {tallyItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <div className="shrink-0">{renderKeys(item.combo)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t shrink-0 flex items-center justify-between text-xs"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Shift + ?
            </kbd>
            <span>Toggles this cheat sheet from any page</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
