import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ProcessReportResponse,
  StandardizedSaleItem,
  Gstr1Response,
  TallyQueueResponse,
  EcommerceReportResponse,
  UpdateTcsRequest,
  BulkUpdateHsnRequest,
  OverrideTable14Request,
} from '../../types/ecommerce.types';

export const ecommerceApi = createApi({
  reducerPath: 'ecommerceApi',
  baseQuery: baseQueryWithReauth('/ecommerce'),
  tagTypes: ['Ecommerce'],
  endpoints: (builder) => ({
    processReport: builder.mutation<ProcessReportResponse, FormData>({
      query: (body) => ({
        url: '/process',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ecommerce', id: 'LIST' }],
    }),
    getReport: builder.query<EcommerceReportResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Ecommerce', id }],
    }),
    updateTcs: builder.mutation<{ success: boolean; data: any; message?: string }, UpdateTcsRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}/tcs`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Ecommerce', id }],
    }),
    bulkUpdateHsn: builder.mutation<{ success: boolean; message?: string }, BulkUpdateHsnRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}/hsn`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Ecommerce', id }],
    }),
    overrideTable14: builder.mutation<{ success: boolean; message?: string }, OverrideTable14Request>({
      query: ({ id, ...body }) => ({
        url: `/${id}/table14`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Ecommerce', id }],
    }),
    generateGstr1: builder.mutation<Gstr1Response, { sales: StandardizedSaleItem[] }>({
      query: (body) => ({
        url: '/gstr1',
        method: 'POST',
        body,
      }),
    }),
    generateGstr1ById: builder.mutation<Gstr1Response, string>({
      query: (id) => ({
        url: `/${id}/gstr1`,
        method: 'POST',
      }),
    }),
    syncToTally: builder.mutation<TallyQueueResponse, { sales: StandardizedSaleItem[] }>({
      query: (body) => ({
        url: '/tally-sync',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useProcessReportMutation,
  useGetReportQuery,
  useUpdateTcsMutation,
  useBulkUpdateHsnMutation,
  useOverrideTable14Mutation,
  useGenerateGstr1Mutation,
  useGenerateGstr1ByIdMutation,
  useSyncToTallyMutation,
} = ecommerceApi;
