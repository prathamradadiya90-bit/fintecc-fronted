'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useGetShortcutsQuery } from '@/lib/store/api/shortcutsApi';
import {
  openCheatSheet,
  closeCheatSheet,
  toggleCheatSheet,
} from '@/lib/store/features/shortcuts/shortcutsSlice';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/common/KeyboardShortcutsModal';
import { useToast } from '@/components/ui/Toast';
import { Compass } from 'lucide-react';

interface KeyboardShortcutsContextType {
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  toggleShortcutsModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // 1. Fetch backend shortcuts mapping on load/login
  const { data: shortcutsData } = useGetShortcutsQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  // 2. Select mapping & modal state from Redux store
  const mapping = useSelector((state: RootState) => state.shortcuts.mapping);
  const isCheatSheetOpen = useSelector(
    (state: RootState) => state.shortcuts.isCheatSheetOpen
  );
  const isShortcutsEnabled = useSelector(
    (state: RootState) => state.shortcuts.isShortcutsEnabled
  );

  // 3. Set up keyboard listeners
  const { leaderKey } = useKeyboardShortcuts({
    mapping,
    enabled: isShortcutsEnabled,
    onToggleCheatSheet: () => dispatch(toggleCheatSheet()),
    onCloseModals: () => dispatch(closeCheatSheet()),
  });

  // 4. Custom event listeners for action feedback & external trigger
  useEffect(() => {
    const handleOpenModal = () => {
      dispatch(openCheatSheet());
    };

    const handleSave = () => {
      showToast('Shortcut triggered: Save (Ctrl+S)', 'info');
    };

    const handleTallySync = () => {
      showToast('Navigating to Tally Prime Sync (Alt+S)', 'info');
    };

    const handleTallyPush = () => {
      showToast('Navigating to Pending Tally Vouchers (Alt+P)', 'info');
    };

    window.addEventListener('open-keyboard-shortcuts', handleOpenModal);
    window.addEventListener('fintecc:shortcut:save', handleSave);
    window.addEventListener('fintecc:shortcut:sync', handleTallySync);
    window.addEventListener('fintecc:shortcut:pushPending', handleTallyPush);

    return () => {
      window.removeEventListener('open-keyboard-shortcuts', handleOpenModal);
      window.removeEventListener('fintecc:shortcut:save', handleSave);
      window.removeEventListener('fintecc:shortcut:sync', handleTallySync);
      window.removeEventListener('fintecc:shortcut:pushPending', handleTallyPush);
    };
  }, [dispatch, showToast]);

  const contextValue = {
    openShortcutsModal: () => dispatch(openCheatSheet()),
    closeShortcutsModal: () => dispatch(closeCheatSheet()),
    toggleShortcutsModal: () => dispatch(toggleCheatSheet()),
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}

      {/* Leader Key Visual Feedback Banner */}
      {leaderKey && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500/30 bg-slate-900/90 text-amber-300 text-xs font-medium backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>Go to: <strong className="text-white">D</strong> (Dashboard), <strong className="text-white">C</strong> (Clients), <strong className="text-white">V</strong> (Vault), <strong className="text-white">T</strong> (Tasks)</span>
          </div>
        </div>
      )}

      {/* Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isCheatSheetOpen}
        onClose={() => dispatch(closeCheatSheet())}
        mapping={mapping}
      />
    </KeyboardShortcutsContext.Provider>
  );
}
