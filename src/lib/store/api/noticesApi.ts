import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { NoticesResponse, Notice, UpdateNoticeStatusRequest } from '../../types/notice.types';

export const noticesApi = createApi({
  reducerPath: 'noticesApi',
  baseQuery: baseQueryWithReauth('/notices'),
  tagTypes: ['Notice'],
  endpoints: (builder) => ({
    getNotices: builder.query<NoticesResponse, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Notice' as const, id })),
              { type: 'Notice', id: 'LIST' },
            ]
          : [{ type: 'Notice', id: 'LIST' }],
    }),

    updateNoticeStatus: builder.mutation<
      { success: boolean; data: Notice; message?: string },
      UpdateNoticeStatusRequest
    >({
      query: ({ id, type, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { type, status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Notice', id },
        { type: 'Notice', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useUpdateNoticeStatusMutation,
} = noticesApi;
