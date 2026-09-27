import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  IntegrationsListResponse,
  IntegrationResponse,
  SaveIntegrationRequest,
} from '../../types/integration.types';

export const integrationsApi = createApi({
  reducerPath: 'integrationsApi',
  baseQuery: baseQueryWithReauth('/integrations'),
  tagTypes: ['Integration'],
  endpoints: (builder) => ({
    getIntegrations: builder.query<IntegrationsListResponse, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Integration' as const, id })),
              { type: 'Integration', id: 'LIST' },
            ]
          : [{ type: 'Integration', id: 'LIST' }],
    }),

    saveIntegration: builder.mutation<IntegrationResponse, SaveIntegrationRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Integration', id: 'LIST' }],
    }),

    deleteIntegration: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Integration', id },
        { type: 'Integration', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useSaveIntegrationMutation,
  useDeleteIntegrationMutation,
} = integrationsApi;
