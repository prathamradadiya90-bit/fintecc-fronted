import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_SHORTCUTS_MAP, ShortcutsMap } from '../../../types/shortcuts.types';
import { shortcutsApi } from '../../api/shortcutsApi';

export interface ShortcutsState {
  mapping: ShortcutsMap;
  isCheatSheetOpen: boolean;
  isShortcutsEnabled: boolean;
}

const initialState: ShortcutsState = {
  mapping: DEFAULT_SHORTCUTS_MAP,
  isCheatSheetOpen: false,
  isShortcutsEnabled: true,
};

export const shortcutsSlice = createSlice({
  name: 'shortcuts',
  initialState,
  reducers: {
    setShortcuts: (state, action: PayloadAction<ShortcutsMap>) => {
      state.mapping = action.payload;
    },
    openCheatSheet: (state) => {
      state.isCheatSheetOpen = true;
    },
    closeCheatSheet: (state) => {
      state.isCheatSheetOpen = false;
    },
    toggleCheatSheet: (state) => {
      state.isCheatSheetOpen = !state.isCheatSheetOpen;
    },
    setShortcutsEnabled: (state, action: PayloadAction<boolean>) => {
      state.isShortcutsEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      shortcutsApi.endpoints.getShortcuts.matchFulfilled,
      (state, action) => {
        if (action.payload?.data) {
          state.mapping = action.payload.data;
        }
      }
    );
  },
});

export const {
  setShortcuts,
  openCheatSheet,
  closeCheatSheet,
  toggleCheatSheet,
  setShortcutsEnabled,
} = shortcutsSlice.actions;

export default shortcutsSlice.reducer;
