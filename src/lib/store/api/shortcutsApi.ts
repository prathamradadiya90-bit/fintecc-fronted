import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { ShortcutsResponse } from '../../types/shortcuts.types';

export const shortcutsApi = createApi({
  reducerPath: 'shortcutsApi',
  baseQuery: baseQueryWithReauth('/config'),
  tagTypes: ['Shortcuts'],
  endpoints: (builder) => ({
    getShortcuts: builder.query<ShortcutsResponse, void>({
      query: () => '/shortcuts',
      providesTags: ['Shortcuts'],
    }),
  }),
});

export const {
  useGetShortcutsQuery,
  useLazyGetShortcutsQuery,
} = shortcutsApi;
