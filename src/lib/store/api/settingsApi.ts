import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  SettingsResponse,
  UpdateSettingsRequest,
} from '../../types/settings.types';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: baseQueryWithReauth('/settings'),
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    getSettings: builder.query<SettingsResponse, void>({
      query: () => '/',
      providesTags: ['Settings'],
    }),

    updateSettings: builder.mutation<SettingsResponse, UpdateSettingsRequest>({
      query: (body) => ({
        url: '/',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi;
