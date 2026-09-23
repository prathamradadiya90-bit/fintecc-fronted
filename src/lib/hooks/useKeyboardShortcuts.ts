'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShortcutsMap } from '../types/shortcuts.types';

export interface UseKeyboardShortcutsOptions {
  mapping: ShortcutsMap;
  enabled?: boolean;
  onToggleCheatSheet?: () => void;
  onCloseModals?: () => void;
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

function parseModifierCombo(combo: string) {
  const parts = combo.split('+').map((p) => p.trim().toLowerCase());
  const wantsCtrl = parts.includes('ctrl') || parts.includes('cmd') || parts.includes('control');
  const wantsAlt = parts.includes('alt') || parts.includes('option');
  const wantsShift = parts.includes('shift');
  const mainKey = parts.find(
    (p) => !['ctrl', 'cmd', 'control', 'alt', 'option', 'shift', 'meta'].includes(p)
  );

  return { wantsCtrl, wantsAlt, wantsShift, mainKey };
}

function matchesModifierShortcut(e: KeyboardEvent, combo: string): boolean {
  if (!combo || combo.includes(' ')) return false;

  const { wantsCtrl, wantsAlt, wantsShift, mainKey } = parseModifierCombo(combo);

  const hasCtrl = e.ctrlKey || e.metaKey;
  if (wantsCtrl !== hasCtrl) return false;
  if (wantsAlt !== e.altKey) return false;
  if (wantsShift !== e.shiftKey) return false;

  if (!mainKey) return false;

  if (mainKey === 'escape') {
    return e.key === 'Escape';
  }

  return e.key.toLowerCase() === mainKey.toLowerCase();
}

export function useKeyboardShortcuts({
  mapping,
  enabled = true,
  onToggleCheatSheet,
  onCloseModals,
}: UseKeyboardShortcutsOptions) {
  const router = useRouter();
  const [leaderKey, setLeaderKey] = useState<string | null>(null);
  const leaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearLeader = useCallback(() => {
    if (leaderTimeoutRef.current) {
      clearTimeout(leaderTimeoutRef.current);
      leaderTimeoutRef.current = null;
    }
    setLeaderKey(null);
  }, []);

  const dispatchShortcutEvent = useCallback((actionName: string, category: string, combo: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('fintecc:shortcut', {
          detail: { action: actionName, category, combo },
        })
      );
      window.dispatchEvent(
        new CustomEvent(`fintecc:shortcut:${actionName}`, {
          detail: { action: actionName, category, combo },
        })
      );
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Cheat Sheet Modal Trigger (Shift + ? or ?)
      if (
        (e.key === '?' || (e.shiftKey && e.key === '/')) &&
        !isInputElement(e.target) &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        onToggleCheatSheet?.();
        return;
      }

      // 2. Escape / Close handling
      const closeCombo = mapping.global?.close || 'Escape';
      if (matchesModifierShortcut(e, closeCombo)) {
        clearLeader();
        onCloseModals?.();
        dispatchShortcutEvent('close', 'global', closeCombo);
        return;
      }

      // If user is currently typing in an input/textarea, do NOT trigger navigation/action shortcuts
      if (isInputElement(e.target)) {
        return;
      }

      // 3. Two-Key Sequence Navigation (e.g. "G D", "G C", "G V", "G T")
      if (leaderKey) {
        const secondKey = e.key.toLowerCase();
        clearLeader();

        const nav = mapping.navigation || {};
        const checkSeq = (comboStr?: string) => {
          if (!comboStr) return false;
          const parts = comboStr.trim().toLowerCase().split(/\s+/);
          return parts.length === 2 && parts[0] === leaderKey && parts[1] === secondKey;
        };

        if (checkSeq(nav.dashboard)) {
          e.preventDefault();
          dispatchShortcutEvent('dashboard', 'navigation', nav.dashboard || 'G D');
          router.push('/dashboard');
          return;
        }

        if (checkSeq(nav.clients)) {
          e.preventDefault();
          dispatchShortcutEvent('clients', 'navigation', nav.clients || 'G C');
          router.push('/dashboard/my-clients');
          return;
        }

        if (checkSeq(nav.vault)) {
          e.preventDefault();
          dispatchShortcutEvent('vault', 'navigation', nav.vault || 'G V');
          router.push('/dashboard/vault');
          return;
        }

        if (checkSeq(nav.tasks)) {
          e.preventDefault();
          dispatchShortcutEvent('tasks', 'navigation', nav.tasks || 'G T');
          router.push('/dashboard/tasks');
          return;
        }

        // Leader was active but second key didn't match any navigation shortcut
        return;
      }

      // Check if user pressed a leader key like 'g' without any modifiers
      if (
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === 'g'
      ) {
        setLeaderKey('g');
        if (leaderTimeoutRef.current) clearTimeout(leaderTimeoutRef.current);
        leaderTimeoutRef.current = setTimeout(() => {
          setLeaderKey(null);
        }, 1200);
        return;
      }

      // 4. Global Action Shortcuts
      const global = mapping.global || {};

      // Search: Ctrl+K
      if (global.search && matchesModifierShortcut(e, global.search)) {
        e.preventDefault();
        dispatchShortcutEvent('search', 'global', global.search);
        return;
      }

      // New Client: Alt+N
      if (global.newClient && matchesModifierShortcut(e, global.newClient)) {
        e.preventDefault();
        dispatchShortcutEvent('newClient', 'global', global.newClient);
        router.push('/dashboard/my-clients?action=new');
        return;
      }

      // New Invoice: Alt+I
      if (global.newInvoice && matchesModifierShortcut(e, global.newInvoice)) {
        e.preventDefault();
        dispatchShortcutEvent('newInvoice', 'global', global.newInvoice);
        router.push('/dashboard/invoices?action=new');
        return;
      }

      // Save: Ctrl+S
      if (global.save && matchesModifierShortcut(e, global.save)) {
        e.preventDefault();
        dispatchShortcutEvent('save', 'global', global.save);
        return;
      }

      // 5. Tally Shortcuts
      const tally = mapping.tally || {};

      // Sync: Alt+S
      if (tally.sync && matchesModifierShortcut(e, tally.sync)) {
        e.preventDefault();
        dispatchShortcutEvent('sync', 'tally', tally.sync);
        router.push('/dashboard/tally-sync');
        return;
      }

      // Push Pending: Alt+P
      if (tally.pushPending && matchesModifierShortcut(e, tally.pushPending)) {
        e.preventDefault();
        dispatchShortcutEvent('pushPending', 'tally', tally.pushPending);
        router.push('/dashboard/tally-sync?tab=pending');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (leaderTimeoutRef.current) {
        clearTimeout(leaderTimeoutRef.current);
      }
    };
  }, [
    enabled,
    mapping,
    leaderKey,
    router,
    clearLeader,
    dispatchShortcutEvent,
    onToggleCheatSheet,
    onCloseModals,
  ]);

  return { leaderKey };
}
