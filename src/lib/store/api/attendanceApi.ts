import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedAttendanceResponse,
  AttendanceResponse,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  GetAttendanceParams,
} from '../../types/attendance.types';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: baseQueryWithReauth('/attendance'),
  tagTypes: ['Attendance'],
  endpoints: (builder) => ({
    getAttendance: builder.query<PaginatedAttendanceResponse, GetAttendanceParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Attendance' as const, id })),
              { type: 'Attendance', id: 'LIST' },
            ]
          : [{ type: 'Attendance', id: 'LIST' }],
    }),

    getAttendanceById: builder.query<AttendanceResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Attendance', id }],
    }),

    markAttendance: builder.mutation<AttendanceResponse, CreateAttendanceRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),

    updateAttendance: builder.mutation<AttendanceResponse, { id: string; data: UpdateAttendanceRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Attendance', id },
        { type: 'Attendance', id: 'LIST' },
      ],
    }),

    deleteAttendance: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetAttendanceByIdQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
