import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedQuotationsResponse,
  QuotationResponse,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  GetQuotationsParams,
} from '../../types/quotation.types';

export const quotationsApi = createApi({
  reducerPath: 'quotationsApi',
  baseQuery: baseQueryWithReauth('/quotations'),
  tagTypes: ['Quotation', 'Invoice', 'Task'],
  endpoints: (builder) => ({
    getQuotations: builder.query<PaginatedQuotationsResponse, GetQuotationsParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Quotation' as const, id })),
              { type: 'Quotation', id: 'LIST' },
            ]
          : [{ type: 'Quotation', id: 'LIST' }],
    }),

    getQuotationById: builder.query<QuotationResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Quotation', id }],
    }),

    createQuotation: builder.mutation<QuotationResponse, CreateQuotationRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Quotation', id: 'LIST' }],
    }),

    updateQuotation: builder.mutation<QuotationResponse, { id: string; data: UpdateQuotationRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
      ],
    }),

    deleteQuotation: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Quotation', id: 'LIST' }],
    }),

    convertToInvoice: builder.mutation<{ success: boolean; message?: string; data: any }, string>({
      query: (id) => ({
        url: `/${id}/convert-to-invoice`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    convertToTask: builder.mutation<
      { success: boolean; message?: string; data: any },
      { id: string; assigneeId?: string }
    >({
      query: ({ id, assigneeId }) => ({
        url: `/${id}/convert-to-task`,
        method: 'POST',
        body: { assigneeId },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useConvertToInvoiceMutation,
  useConvertToTaskMutation,
} = quotationsApi;
