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
  }),
});

export const { useUploadInvoiceMutation } = invoicesApi;
