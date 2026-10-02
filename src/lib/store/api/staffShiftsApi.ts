import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  StaffShift,
  CreateStaffShiftRequest,
  UpdateStaffShiftRequest,
} from '@/lib/types/attendance-management.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const staffShiftsApi = createApi({
  reducerPath: 'staffShiftsApi',
  baseQuery: baseQueryWithReauth('/staff-shifts'),
  tagTypes: ['StaffShift'],
  endpoints: (builder) => ({
    getShifts: builder.query<ApiResponse<StaffShift[]>, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'StaffShift' as const, id })),
              { type: 'StaffShift', id: 'LIST' },
            ]
          : [{ type: 'StaffShift', id: 'LIST' }],
    }),

    getShiftById: builder.query<ApiResponse<StaffShift>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'StaffShift', id }],
    }),

    createShift: builder.mutation<ApiResponse<StaffShift>, CreateStaffShiftRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'StaffShift', id: 'LIST' }],
    }),

    updateShift: builder.mutation<ApiResponse<StaffShift>, { id: string; data: UpdateStaffShiftRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'StaffShift', id },
        { type: 'StaffShift', id: 'LIST' },
      ],
    }),

    deleteShift: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'StaffShift', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} = staffShiftsApi;
