import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ResourceAllocation,
  CreateResourceAllocationPayload,
  UpdateResourceAllocationPayload,
} from '@/lib/types/resource-allocation.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const resourceAllocationsApi = createApi({
  reducerPath: 'resourceAllocationsApi',
  baseQuery: baseQueryWithReauth('/resource-allocations'),
  tagTypes: ['ResourceAllocation'],
  endpoints: (builder) => ({
    getAllocations: builder.query<ApiResponse<ResourceAllocation[]>, { date?: string; userId?: string; taskId?: string } | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ResourceAllocation' as const, id })),
              { type: 'ResourceAllocation', id: 'LIST' },
            ]
          : [{ type: 'ResourceAllocation', id: 'LIST' }],
    }),

    getAllocationById: builder.query<ApiResponse<ResourceAllocation>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ResourceAllocation', id }],
    }),

    createAllocation: builder.mutation<ApiResponse<ResourceAllocation>, CreateResourceAllocationPayload>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ResourceAllocation', id: 'LIST' }],
    }),

    updateAllocation: builder.mutation<ApiResponse<ResourceAllocation>, { id: string; data: UpdateResourceAllocationPayload }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ResourceAllocation', id },
        { type: 'ResourceAllocation', id: 'LIST' },
      ],
    }),

    deleteAllocation: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ResourceAllocation', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllocationsQuery,
  useGetAllocationByIdQuery,
  useCreateAllocationMutation,
  useUpdateAllocationMutation,
  useDeleteAllocationMutation,
} = resourceAllocationsApi;
