import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { InvoiceConvertResponse } from '../../types/invoice.types';

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: baseQueryWithReauth('/invoices'),
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
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

export const { useUploadInvoiceMutation, useBulkOcrMutation } = invoicesApi;
