import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedRocFilingsResponse,
  RocFilingResponse,
  CreateRocFilingRequest,
  UpdateRocStatusRequest,
  RecordChallanRequest,
} from '../../types/roc.types';

export const rocApi = createApi({
  reducerPath: 'rocApi',
  baseQuery: baseQueryWithReauth('/roc'),
  tagTypes: ['RocFiling'],
  endpoints: (builder) => ({
    getFilings: builder.query<
      PaginatedRocFilingsResponse,
      { page?: number; limit?: number; clientId?: string; mcaCompanyId?: string } | void
    >({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'RocFiling' as const, id })),
              { type: 'RocFiling', id: 'LIST' },
            ]
          : [{ type: 'RocFiling', id: 'LIST' }],
    }),

    getFilingById: builder.query<RocFilingResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RocFiling', id }],
    }),

    createFiling: builder.mutation<RocFilingResponse, CreateRocFilingRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RocFiling', id: 'LIST' }],
    }),

    updateFilingStatus: builder.mutation<RocFilingResponse, UpdateRocStatusRequest>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RocFiling', id },
        { type: 'RocFiling', id: 'LIST' },
      ],
    }),

    recordChallan: builder.mutation<RocFilingResponse, RecordChallanRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}/challan`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RocFiling', id },
        { type: 'RocFiling', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFilingsQuery,
  useGetFilingByIdQuery,
  useCreateFilingMutation,
  useUpdateFilingStatusMutation,
  useRecordChallanMutation,
} = rocApi;
