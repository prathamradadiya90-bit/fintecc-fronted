import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedNotificationsResponse,
  NotificationResponse,
} from '../../types/notification.types';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth('/notifications'),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      PaginatedNotificationsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/',
        params: params || { limit: 20 },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    markAsRead: builder.mutation<NotificationResponse, { id: string; isRead?: boolean }>({
      query: ({ id, isRead = true }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: { isRead },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),

    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
