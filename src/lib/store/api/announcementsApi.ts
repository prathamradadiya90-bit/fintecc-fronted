import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedAnnouncementsResponse,
  AnnouncementResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../../types/announcement.types';

export const announcementsApi = createApi({
  reducerPath: 'announcementsApi',
  baseQuery: baseQueryWithReauth('/announcements'),
  tagTypes: ['Announcement'],
  endpoints: (builder) => ({
    getAnnouncements: builder.query<
      PaginatedAnnouncementsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Announcement' as const, id })),
              { type: 'Announcement', id: 'LIST' },
            ]
          : [{ type: 'Announcement', id: 'LIST' }],
    }),

    createAnnouncement: builder.mutation<AnnouncementResponse, CreateAnnouncementRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }],
    }),

    updateAnnouncement: builder.mutation<AnnouncementResponse, UpdateAnnouncementRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'LIST' },
      ],
    }),

    deleteAnnouncement: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementsApi;
