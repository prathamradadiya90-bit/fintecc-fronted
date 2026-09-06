import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface ClientPortalInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  status: string;
  pdfUrl?: string;
}

export interface ClientPortalDocument {
  id: string;
  title: string;
  category: string;
  fileType: string;
  fileUrl: string;
  createdAt: string;
}

export const clientPortalApi = createApi({
  reducerPath: 'clientPortalApi',
  baseQuery: baseQueryWithReauth('/client-portal'),
  tagTypes: ['ClientPortal'],
  endpoints: (builder) => ({
    getMyInvoices: builder.query<{ success: boolean; data: ClientPortalInvoice[] }, void>({
      query: () => '/invoices',
      providesTags: ['ClientPortal'],
    }),

    getMyDocuments: builder.query<{ success: boolean; data: ClientPortalDocument[] }, void>({
      query: () => '/documents',
      providesTags: ['ClientPortal'],
    }),
  }),
});

export const {
  useGetMyInvoicesQuery,
  useGetMyDocumentsQuery,
} = clientPortalApi;
