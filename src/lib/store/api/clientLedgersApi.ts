import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedClientLedgerResponse,
  ClientLedgerResponse,
  CreateClientLedgerRequest,
  GetClientLedgerParams,
} from '../../types/client-ledger.types';

export const clientLedgersApi = createApi({
  reducerPath: 'clientLedgersApi',
  baseQuery: baseQueryWithReauth('/client-ledgers'),
  tagTypes: ['ClientLedger'],
  endpoints: (builder) => ({
    getClientLedger: builder.query<PaginatedClientLedgerResponse, GetClientLedgerParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result, _error, params) => {
        const clientId = params?.clientId;
        return result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ClientLedger' as const, id })),
              { type: 'ClientLedger', id: clientId ? `CLIENT_${clientId}` : 'LIST' },
            ]
          : [{ type: 'ClientLedger', id: clientId ? `CLIENT_${clientId}` : 'LIST' }];
      },
    }),

    createClientLedgerEntry: builder.mutation<ClientLedgerResponse, CreateClientLedgerRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: 'ClientLedger', id: `CLIENT_${body.clientId}` },
        { type: 'ClientLedger', id: 'LIST' },
      ],
    }),

    deleteClientLedgerEntry: builder.mutation<{ success: boolean; message: string }, { id: string; clientId: string }>({
      query: ({ id }) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: 'ClientLedger', id: `CLIENT_${clientId}` },
        { type: 'ClientLedger', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetClientLedgerQuery,
  useCreateClientLedgerEntryMutation,
  useDeleteClientLedgerEntryMutation,
} = clientLedgersApi;
