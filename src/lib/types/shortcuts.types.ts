export interface GlobalShortcuts {
  search?: string;
  newClient?: string;
  newInvoice?: string;
  save?: string;
  close?: string;
  [key: string]: string | undefined;
}

export interface NavigationShortcuts {
  dashboard?: string;
  clients?: string;
  vault?: string;
  tasks?: string;
  [key: string]: string | undefined;
}

export interface TallyShortcuts {
  sync?: string;
  pushPending?: string;
  [key: string]: string | undefined;
}

export interface ShortcutsMap {
  global: GlobalShortcuts;
  navigation: NavigationShortcuts;
  tally: TallyShortcuts;
  [category: string]: Record<string, string | undefined>;
}

export interface ShortcutsResponse {
  success: boolean;
  message?: string;
  data: ShortcutsMap;
}

export const DEFAULT_SHORTCUTS_MAP: ShortcutsMap = {
  global: {
    search: 'Ctrl+K',
    newClient: 'Alt+N',
    newInvoice: 'Alt+I',
    save: 'Ctrl+S',
    close: 'Escape',
  },
  navigation: {
    dashboard: 'G D',
    clients: 'G C',
    vault: 'G V',
    tasks: 'G T',
  },
  tally: {
    sync: 'Alt+S',
    pushPending: 'Alt+P',
  },
};
