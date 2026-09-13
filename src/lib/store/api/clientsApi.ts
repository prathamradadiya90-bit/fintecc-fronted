import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQueryWithReauth } from './baseQuery';
import type { 
  Client, 
  PaginatedClientsResponse, 
  ClientResponse,
  GetClientsParams,
  CreateClientRequest,
  UpdateClientRequest,
  ExportClientsParams
} from '../../types/client.types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: baseQueryWithReauth('/clients'),
  tagTypes: ['Client'],
  endpoints: (builder) => ({
    getClients: builder.query<PaginatedClientsResponse, GetClientsParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Client' as const, id })),
              { type: 'Client', id: 'LIST' },
            ]
          : [{ type: 'Client', id: 'LIST' }],
    }),
    getClientById: builder.query<ClientResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    createClient: builder.mutation<ClientResponse, CreateClientRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    updateClient: builder.mutation<ClientResponse, { id: string; data: UpdateClientRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        { type: 'Client', id: 'LIST' } // Invalidate list to reflect updated data
      ],
    }),
    deleteClient: builder.mutation<ClientResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    inviteClient: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/${id}/invite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Client', id },
        { type: 'Client', id: 'LIST' }
      ],
    }),
    searchClients: builder.query<{ success: boolean; data: Partial<Client>[] }, string>({
      query: (searchTerm) => ({
        url: '/search',
        params: { q: searchTerm },
      }),
      providesTags: ['Client'],
    }),
    exportClients: builder.mutation<null, ExportClientsParams | void>({
      queryFn: async (params) => {
        try {
          const queryParams = new URLSearchParams();
          if (params?.search) queryParams.set('search', params.search);
          if (params?.status) queryParams.set('status', params.status);
          if (params?.type) queryParams.set('type', params.type);
          if (params?.hasGst !== undefined) queryParams.set('hasGst', String(params.hasGst));
          if (params?.hasPan !== undefined) queryParams.set('hasPan', String(params.hasPan));

          const url = `${apiBaseUrl}/clients/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            const data = await response.text().catch(() => 'Export failed');
            return { error: { status: response.status, data } satisfies FetchBaseQueryError };
          }

          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = downloadUrl;
          anchor.download = `Clients_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          window.URL.revokeObjectURL(downloadUrl);

          return { data: null };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } satisfies FetchBaseQueryError };
        }
      },
    }),
  }),
});

export const { 
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useInviteClientMutation,
  useSearchClientsQuery,
  useExportClientsMutation
} = clientsApi;

