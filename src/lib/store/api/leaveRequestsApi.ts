import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  LeaveRequest,
  CreateLeaveRequestPayload,
  UpdateLeaveRequestPayload,
} from '@/lib/types/attendance-management.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const leaveRequestsApi = createApi({
  reducerPath: 'leaveRequestsApi',
  baseQuery: baseQueryWithReauth('/leave-requests'),
  tagTypes: ['LeaveRequest'],
  endpoints: (builder) => ({
    getLeaveRequests: builder.query<ApiResponse<LeaveRequest[]>, { status?: string; userId?: string } | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'LeaveRequest' as const, id })),
              { type: 'LeaveRequest', id: 'LIST' },
            ]
          : [{ type: 'LeaveRequest', id: 'LIST' }],
    }),

    getLeaveRequestById: builder.query<ApiResponse<LeaveRequest>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'LeaveRequest', id }],
    }),

    createLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, CreateLeaveRequestPayload>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'LIST' }],
    }),

    updateLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, { id: string; data: UpdateLeaveRequestPayload }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'LeaveRequest', id },
        { type: 'LeaveRequest', id: 'LIST' },
      ],
    }),

    deleteLeaveRequest: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetLeaveRequestsQuery,
  useGetLeaveRequestByIdQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveRequestMutation,
  useDeleteLeaveRequestMutation,
} = leaveRequestsApi;
