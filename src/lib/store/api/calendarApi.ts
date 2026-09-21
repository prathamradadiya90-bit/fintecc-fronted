import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  UnifiedCalendarResponse,
  SingleCalendarEventResponse,
  GetCalendarParams,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from '../../types/calendar.types';

export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: baseQueryWithReauth('/calendar'),
  tagTypes: ['Calendar'],
  endpoints: (builder) => ({
    getUnifiedCalendar: builder.query<UnifiedCalendarResponse, GetCalendarParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: ['Calendar'],
    }),

    createEvent: builder.mutation<SingleCalendarEventResponse, CreateCalendarEventRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Calendar'],
    }),

    updateEvent: builder.mutation<SingleCalendarEventResponse, { id: string; data: UpdateCalendarEventRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Calendar'],
    }),

    deleteEvent: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Calendar'],
    }),
  }),
});

export const {
  useGetUnifiedCalendarQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = calendarApi;
