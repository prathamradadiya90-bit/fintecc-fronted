import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  TdsChallan,
  TdsReturn,
  TdsTransaction,
  TdsNotice,
  TdsResponse,
  PaginatedTdsResponse,
  CreateChallanRequest,
  CreateReturnRequest,
  CreateTransactionRequest,
  CreateNoticeRequest,
} from '../../types/tds.types';

export const tdsApi = createApi({
  reducerPath: 'tdsApi',
  baseQuery: baseQueryWithReauth('/tds'),
  tagTypes: ['TdsChallan', 'TdsReturn', 'TdsTransaction', 'TdsNotice'],
  endpoints: (builder) => ({
    // --- CHALLANS ---
    getChallans: builder.query<PaginatedTdsResponse<TdsChallan>, { clientId?: string } | void>({
      query: (params) => ({
        url: '/challans',
        params: params || {},
      }),
      providesTags: ['TdsChallan'],
    }),

    getChallanById: builder.query<TdsResponse<TdsChallan>, string>({
      query: (id) => `/challans/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'TdsChallan', id }],
    }),

    createChallan: builder.mutation<TdsResponse<TdsChallan>, CreateChallanRequest>({
      query: (body) => ({
        url: '/challans',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TdsChallan'],
    }),

    updateChallan: builder.mutation<TdsResponse<TdsChallan>, { id: string; data: Partial<CreateChallanRequest> }>({
      query: ({ id, data }) => ({
        url: `/challans/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TdsChallan'],
    }),

    deleteChallan: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/challans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TdsChallan'],
    }),

    // --- RETURNS ---
    getReturns: builder.query<PaginatedTdsResponse<TdsReturn>, { clientId?: string; quarter?: string; financialYear?: string } | void>({
      query: (params) => ({
        url: '/returns',
        params: params || {},
      }),
      providesTags: ['TdsReturn'],
    }),

    getReturnById: builder.query<TdsResponse<TdsReturn>, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'TdsReturn', id }],
    }),

    createReturn: builder.mutation<TdsResponse<TdsReturn>, CreateReturnRequest>({
      query: (body) => ({
        url: '/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TdsReturn'],
    }),

    updateReturn: builder.mutation<TdsResponse<TdsReturn>, { id: string; data: Partial<CreateReturnRequest> }>({
      query: ({ id, data }) => ({
        url: `/returns/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TdsReturn'],
    }),

    deleteReturn: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/returns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TdsReturn'],
    }),

    // --- TRANSACTIONS ---
    getTransactions: builder.query<PaginatedTdsResponse<TdsTransaction>, { clientId?: string; tdsReturnId?: string } | void>({
      query: (params) => ({
        url: '/transactions',
        params: params || {},
      }),
      providesTags: ['TdsTransaction'],
    }),

    getTransactionById: builder.query<TdsResponse<TdsTransaction>, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'TdsTransaction', id }],
    }),

    createTransaction: builder.mutation<TdsResponse<TdsTransaction>, CreateTransactionRequest>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TdsTransaction'],
    }),

    updateTransaction: builder.mutation<TdsResponse<TdsTransaction>, { id: string; data: Partial<CreateTransactionRequest> }>({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TdsTransaction'],
    }),

    deleteTransaction: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TdsTransaction'],
    }),

    // --- NOTICES ---
    getNotices: builder.query<PaginatedTdsResponse<TdsNotice>, { clientId?: string; status?: string } | void>({
      query: (params) => ({
        url: '/notices',
        params: params || {},
      }),
      providesTags: ['TdsNotice'],
    }),

    getNoticeById: builder.query<TdsResponse<TdsNotice>, string>({
      query: (id) => `/notices/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'TdsNotice', id }],
    }),

    createNotice: builder.mutation<TdsResponse<TdsNotice>, CreateNoticeRequest>({
      query: (body) => ({
        url: '/notices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TdsNotice'],
    }),

    updateNotice: builder.mutation<TdsResponse<TdsNotice>, { id: string; data: Partial<CreateNoticeRequest> }>({
      query: ({ id, data }) => ({
        url: `/notices/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TdsNotice'],
    }),

    deleteNotice: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TdsNotice'],
    }),
  }),
});

export const {
  useGetChallansQuery,
  useGetChallanByIdQuery,
  useCreateChallanMutation,
  useUpdateChallanMutation,
  useDeleteChallanMutation,

  useGetReturnsQuery,
  useGetReturnByIdQuery,
  useCreateReturnMutation,
  useUpdateReturnMutation,
  useDeleteReturnMutation,

  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,

  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = tdsApi;
