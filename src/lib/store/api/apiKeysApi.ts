import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ApiKeysListResponse,
  CreateApiKeyResponse,
  CreateApiKeyRequest,
} from '../../types/apiKey.types';

export const apiKeysApi = createApi({
  reducerPath: 'apiKeysApi',
  baseQuery: baseQueryWithReauth('/api-keys'),
  tagTypes: ['ApiKey'],
  endpoints: (builder) => ({
    getApiKeys: builder.query<ApiKeysListResponse, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ApiKey' as const, id })),
              { type: 'ApiKey', id: 'LIST' },
            ]
          : [{ type: 'ApiKey', id: 'LIST' }],
    }),

    createApiKey: builder.mutation<CreateApiKeyResponse, CreateApiKeyRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ApiKey', id: 'LIST' }],
    }),

    revokeApiKey: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ApiKey', id },
        { type: 'ApiKey', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = apiKeysApi;
