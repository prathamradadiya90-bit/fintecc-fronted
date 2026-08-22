import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedTallyJobsResponse,
  TallyJobActionResponse,
  TallyRetryAllResponse,
} from '../../types/tallySyncJob.types';

export const tallyApi = createApi({
  reducerPath: 'tallyApi',
  baseQuery: baseQueryWithReauth('/tally'),
  tagTypes: ['TallyJob'],
  endpoints: (builder) => ({
    getAllJobs: builder.query<
      PaginatedTallyJobsResponse,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: '/jobs',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TallyJob' as const, id })),
              { type: 'TallyJob', id: 'LIST' },
            ]
          : [{ type: 'TallyJob', id: 'LIST' }],
    }),

    queueInvoiceSync: builder.mutation<{ success: boolean; data: { jobId: string }; message?: string }, string>({
      query: (invoiceId) => ({
        url: `/sync/invoice/${invoiceId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'TallyJob', id: 'LIST' }],
    }),

    retryJob: builder.mutation<TallyJobActionResponse, string>({
      query: (jobId) => ({
        url: `/jobs/${jobId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: 'TallyJob', id: jobId },
        { type: 'TallyJob', id: 'LIST' },
      ],
    }),

    retryAllFailed: builder.mutation<TallyRetryAllResponse, void>({
      query: () => ({
        url: '/jobs/retry-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'TallyJob', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllJobsQuery,
  useQueueInvoiceSyncMutation,
  useRetryJobMutation,
  useRetryAllFailedMutation,
} = tallyApi;
