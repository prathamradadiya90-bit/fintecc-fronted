import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedUdinResponse,
  UdinResponse,
  CreateUdinRequest,
  UpdateUdinRequest,
  RevokeUdinRequest,
  GetUdinParams,
} from '../../types/udin.types';

export const udinApi = createApi({
  reducerPath: 'udinApi',
  baseQuery: baseQueryWithReauth('/udin/register'),
  tagTypes: ['UdinRecord'],
  endpoints: (builder) => ({
    getUdinRecords: builder.query<PaginatedUdinResponse, GetUdinParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'UdinRecord' as const, id })),
              { type: 'UdinRecord', id: 'LIST' },
            ]
          : [{ type: 'UdinRecord', id: 'LIST' }],
    }),

    getUdinById: builder.query<UdinResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'UdinRecord', id }],
    }),

    createUdin: builder.mutation<UdinResponse, CreateUdinRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'UdinRecord', id: 'LIST' }],
    }),

    updateUdin: builder.mutation<UdinResponse, { id: string; data: UpdateUdinRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'UdinRecord', id },
        { type: 'UdinRecord', id: 'LIST' },
      ],
    }),

    deleteUdin: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'UdinRecord', id: 'LIST' }],
    }),

    revokeUdin: builder.mutation<UdinResponse, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/revoke`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'UdinRecord', id },
        { type: 'UdinRecord', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetUdinRecordsQuery,
  useGetUdinByIdQuery,
  useCreateUdinMutation,
  useUpdateUdinMutation,
  useDeleteUdinMutation,
  useRevokeUdinMutation,
} = udinApi;
