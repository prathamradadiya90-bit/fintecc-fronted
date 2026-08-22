import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedVaultResponse,
  VaultItemResponse,
  CreateVaultRequest,
  UpdateVaultRequest,
  GetVaultParams,
} from '../../types/vault.types';

export const vaultApi = createApi({
  reducerPath: 'vaultApi',
  baseQuery: baseQueryWithReauth('/vault'),
  tagTypes: ['Vault'],
  endpoints: (builder) => ({
    getVaultItems: builder.query<PaginatedVaultResponse, GetVaultParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Vault' as const, id })),
              { type: 'Vault', id: 'LIST' },
            ]
          : [{ type: 'Vault', id: 'LIST' }],
    }),

    getVaultItemById: builder.query<VaultItemResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Vault', id }],
    }),

    createVaultItem: builder.mutation<VaultItemResponse, CreateVaultRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Vault', id: 'LIST' }],
    }),

    updateVaultItem: builder.mutation<VaultItemResponse, { id: string; data: UpdateVaultRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Vault', id },
        { type: 'Vault', id: 'LIST' },
      ],
    }),

    deleteVaultItem: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Vault', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetVaultItemsQuery,
  useGetVaultItemByIdQuery,
  useLazyGetVaultItemByIdQuery,
  useCreateVaultItemMutation,
  useUpdateVaultItemMutation,
  useDeleteVaultItemMutation,
} = vaultApi;
