import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  UnifiedApproval,
  CreateApprovalPayload,
  UpdateApprovalPayload,
} from '@/lib/types/approval.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const approvalsApi = createApi({
  reducerPath: 'approvalsApi',
  baseQuery: baseQueryWithReauth('/unified-approvals'),
  tagTypes: ['Approval'],
  endpoints: (builder) => ({
    getApprovals: builder.query<ApiResponse<UnifiedApproval[]>, { status?: string; referenceType?: string } | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Approval' as const, id })),
              { type: 'Approval', id: 'LIST' },
            ]
          : [{ type: 'Approval', id: 'LIST' }],
    }),

    getApprovalById: builder.query<ApiResponse<UnifiedApproval>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Approval', id }],
    }),

    createApproval: builder.mutation<ApiResponse<UnifiedApproval>, CreateApprovalPayload>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Approval', id: 'LIST' }],
    }),

    updateApproval: builder.mutation<ApiResponse<UnifiedApproval>, { id: string; data: UpdateApprovalPayload }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Approval', id },
        { type: 'Approval', id: 'LIST' },
      ],
    }),

    deleteApproval: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Approval', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetApprovalsQuery,
  useGetApprovalByIdQuery,
  useCreateApprovalMutation,
  useUpdateApprovalMutation,
  useDeleteApprovalMutation,
} = approvalsApi;
