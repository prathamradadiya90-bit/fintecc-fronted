import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { DscToken, CreateDscRequest, UpdateDscRequest } from '../../types/dsc.types';

export interface PaginatedDscResponse {
  success: boolean;
  data: DscToken[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DscResponse {
  success: boolean;
  data: DscToken;
  message?: string;
}

export interface ExpiringDscResponse {
  success: boolean;
  data: DscToken[];
  message?: string;
}

export const dscApi = createApi({
  reducerPath: 'dscApi',
  baseQuery: baseQueryWithReauth('/dsc'),
  tagTypes: ['Dsc', 'ExpiringDsc'],
  endpoints: (builder) => ({
    getDscs: builder.query<PaginatedDscResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Dsc' as const, id })),
              { type: 'Dsc', id: 'LIST' },
            ]
          : [{ type: 'Dsc', id: 'LIST' }],
    }),

    getExpiringDscs: builder.query<ExpiringDscResponse, void>({
      query: () => '/expiring',
      providesTags: [{ type: 'ExpiringDsc', id: 'LIST' }],
    }),

    createDsc: builder.mutation<DscResponse, CreateDscRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Dsc', id: 'LIST' },
        { type: 'ExpiringDsc', id: 'LIST' },
      ],
    }),

    updateDsc: builder.mutation<DscResponse, UpdateDscRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Dsc', id },
        { type: 'Dsc', id: 'LIST' },
        { type: 'ExpiringDsc', id: 'LIST' },
      ],
    }),

    deleteDsc: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Dsc', id: 'LIST' },
        { type: 'ExpiringDsc', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetDscsQuery,
  useGetExpiringDscsQuery,
  useCreateDscMutation,
  useUpdateDscMutation,
  useDeleteDscMutation,
} = dscApi;
