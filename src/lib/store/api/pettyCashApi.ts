import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PettyCashEntry,
  CreatePettyCashPayload,
  UpdatePettyCashPayload,
} from '@/lib/types/petty-cash.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const pettyCashApi = createApi({
  reducerPath: 'pettyCashApi',
  baseQuery: baseQueryWithReauth('/petty-cash'),
  tagTypes: ['PettyCash'],
  endpoints: (builder) => ({
    getPettyCashEntries: builder.query<ApiResponse<PettyCashEntry[]>, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'PettyCash' as const, id })),
              { type: 'PettyCash', id: 'LIST' },
            ]
          : [{ type: 'PettyCash', id: 'LIST' }],
    }),

    getPettyCashById: builder.query<ApiResponse<PettyCashEntry>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PettyCash', id }],
    }),

    createPettyCashEntry: builder.mutation<ApiResponse<PettyCashEntry>, CreatePettyCashPayload>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PettyCash', id: 'LIST' }],
    }),

    updatePettyCashEntry: builder.mutation<ApiResponse<PettyCashEntry>, { id: string; data: UpdatePettyCashPayload }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PettyCash', id },
        { type: 'PettyCash', id: 'LIST' },
      ],
    }),

    deletePettyCashEntry: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PettyCash', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPettyCashEntriesQuery,
  useGetPettyCashByIdQuery,
  useCreatePettyCashEntryMutation,
  useUpdatePettyCashEntryMutation,
  useDeletePettyCashEntryMutation,
} = pettyCashApi;
