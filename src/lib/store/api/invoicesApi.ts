import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { InvoiceConvertResponse } from '../../types/invoice.types';
import type {
  PaginatedInvoicesResponse,
  InvoiceResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  GetInvoicesParams,
} from '../../types/invoice-management.types';

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: baseQueryWithReauth('/invoices'),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    // CRUD Endpoints for Invoices Management
    getInvoices: builder.query<PaginatedInvoicesResponse, GetInvoicesParams | void>({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Invoice' as const, id })),
              { type: 'Invoice', id: 'LIST' },
            ]
          : [{ type: 'Invoice', id: 'LIST' }],
    }),

    getInvoiceById: builder.query<InvoiceResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Invoice', id }],
    }),

    createInvoice: builder.mutation<InvoiceResponse, CreateInvoiceRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),

    updateInvoice: builder.mutation<InvoiceResponse, { id: string; data: UpdateInvoiceRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    deleteInvoice: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),

    // Converter / OCR endpoints
    uploadInvoice: builder.mutation<InvoiceConvertResponse, FormData>({
      query: (body) => ({
        url: '/convert?format=json',
        method: 'POST',
        body,
      }),
    }),

    bulkOcr: builder.mutation<{
      success: boolean;
      data: {
        results: Array<{ fileName: string; status: 'SUCCESS' | 'FAILED'; data?: any; error?: string }>;
        summary: { total: number; successful: number; failed: number };
      };
    }, FormData>({
      query: (formData) => ({
        url: '/bulk-ocr',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useUploadInvoiceMutation,
  useBulkOcrMutation,
} = invoicesApi;
