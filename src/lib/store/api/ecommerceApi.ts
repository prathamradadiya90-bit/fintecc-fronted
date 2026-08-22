import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ProcessReportResponse,
  StandardizedSaleItem,
  Gstr1Response,
  TallyQueueResponse,
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
    }),
    generateGstr1: builder.mutation<Gstr1Response, { sales: StandardizedSaleItem[] }>({
      query: (body) => ({
        url: '/gstr1',
        method: 'POST',
        body,
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
  useGenerateGstr1Mutation,
  useSyncToTallyMutation,
} = ecommerceApi;
