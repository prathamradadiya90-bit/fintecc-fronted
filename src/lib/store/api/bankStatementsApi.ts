import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  BankStatement,
  BankStatementResponse,
  BankStatementIntakeResponse,
  BankStatementReviewData,
  QueueBankStatementSyncResponse,
  QueueBankStatementSyncInput,
  UpdateReviewRowPayload,
  BulkApprovePayload,
  BulkRejectPayload,
  LedgerMappingRule,
  CreateLedgerMappingPayload,
  BankStatementTransaction,
} from '../../types/bankStatement.types';

export const bankStatementsApi = createApi({
  reducerPath: 'bankStatementsApi',
  baseQuery: baseQueryWithReauth('/bank-statements'),
  tagTypes: ['BankStatement', 'BankStatementReview', 'LedgerMapping'],
  endpoints: (builder) => ({
    // List firm statements (with optional clientId filter)
    getStatements: builder.query<{ success: boolean; data: BankStatement[] }, { clientId?: string } | void>({
      query: (params) => ({
        url: '',
        params: params?.clientId ? { clientId: params.clientId } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'BankStatement' as const, id })),
              { type: 'BankStatement', id: 'LIST' },
            ]
          : [{ type: 'BankStatement', id: 'LIST' }],
    }),

    // Get single statement by ID (used for status polling)
    getStatementById: builder.query<{ success: boolean; data: BankStatement }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'BankStatement', id }],
    }),

    // Get CA Review data (3-tier mapping, stats, and transactions)
    getStatementReview: builder.query<{ success: boolean; data: BankStatementReviewData }, string>({
      query: (id) => `/${id}/review`,
      providesTags: (result, error, id) => [{ type: 'BankStatementReview', id }],
    }),

    // Unified Intake upload (PDF, Image, Excel) -> returns 202 Accepted
    uploadStatementIntake: builder.mutation<BankStatementIntakeResponse, FormData>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BankStatement', id: 'LIST' }],
    }),

    // Update single row during CA review
    updateReviewRow: builder.mutation<
      { success: boolean; data: BankStatementTransaction },
      UpdateReviewRowPayload
    >({
      query: ({ statementId, rowId, body }) => ({
        url: `/${statementId}/rows/${rowId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { statementId }) => [
        { type: 'BankStatementReview', id: statementId },
        { type: 'BankStatement', id: statementId },
        { type: 'BankStatement', id: 'LIST' },
      ],
    }),

    // Bulk approve rows (supports both rowIds and transactionIds)
    bulkApproveRows: builder.mutation<
      { success: boolean; message?: string; data: { count: number } },
      BulkApprovePayload
    >({
      query: ({ statementId, rowIds, transactionIds }) => ({
        url: `/${statementId}/approve`,
        method: 'POST',
        body: {
          rowIds: rowIds || transactionIds,
          transactionIds: transactionIds || rowIds,
        },
      }),
      invalidatesTags: (result, error, { statementId }) => [
        { type: 'BankStatementReview', id: statementId },
        { type: 'BankStatement', id: statementId },
        { type: 'BankStatement', id: 'LIST' },
      ],
    }),

    // Bulk reject rows
    bulkRejectRows: builder.mutation<
      { success: boolean; message?: string; data: { count: number; reason?: string } },
      BulkRejectPayload
    >({
      query: ({ statementId, rowIds, transactionIds, reason }) => ({
        url: `/${statementId}/reject-rows`,
        method: 'POST',
        body: {
          rowIds: rowIds || transactionIds,
          transactionIds: transactionIds || rowIds,
          reason: reason || 'Flagged by CA',
        },
      }),
      invalidatesTags: (result, error, { statementId }) => [
        { type: 'BankStatementReview', id: statementId },
        { type: 'BankStatement', id: statementId },
        { type: 'BankStatement', id: 'LIST' },
      ],
    }),

    // Queue for Desktop Tally Connector
    queueBankStatementSync: builder.mutation<
      QueueBankStatementSyncResponse,
      QueueBankStatementSyncInput
    >({
      query: (body) => ({
        url: '/queue-tally',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, body) =>
        body.statementId ? [{ type: 'BankStatement', id: body.statementId }] : [],
    }),

    // List firm auto-mapping rules
    getLedgerMappings: builder.query<{ success: boolean; data: LedgerMappingRule[] }, void>({
      query: () => '/ledger-mappings',
      providesTags: ['LedgerMapping'],
    }),

    // Create or update a ledger auto-mapping rule
    saveLedgerMapping: builder.mutation<
      { success: boolean; data: LedgerMappingRule; message?: string },
      CreateLedgerMappingPayload
    >({
      query: (body) => ({
        url: '/ledger-mappings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LedgerMapping'],
    }),

    // Stateless document conversion (Direct Conversion on-the-fly)
    uploadBankStatement: builder.mutation<
      BankStatementResponse,
      FormData | { formData: FormData; format?: 'json'; companyName?: string; bankLedger?: string; fp?: string }
    >({
      query: (arg) => {
        if (arg instanceof FormData) {
          return {
            url: '/convert?format=json',
            method: 'POST',
            body: arg,
          };
        }
        const params = new URLSearchParams();
        params.append('format', 'json');
        if (arg.companyName) params.append('companyName', arg.companyName);
        if (arg.bankLedger) params.append('bankLedger', arg.bankLedger);
        if (arg.fp) params.append('fp', arg.fp);
        return {
          url: `/convert?${params.toString()}`,
          method: 'POST',
          body: arg.formData,
        };
      },
    }),

    // Direct conversion file download (stateless: Excel, CSV, XML, GST-JSON)
    downloadBankStatementConvert: builder.mutation<
      Blob,
      {
        formData: FormData;
        format: 'csv' | 'excel' | 'xml' | 'gst-json';
        companyName?: string;
        bankLedger?: string;
        fp?: string;
      }
    >({
      query: ({ formData, format, companyName, bankLedger, fp }) => {
        const params = new URLSearchParams();
        params.append('format', format);
        if (companyName) params.append('companyName', companyName);
        if (bankLedger) params.append('bankLedger', bankLedger);
        if (fp) params.append('fp', fp);
        return {
          url: `/convert?${params.toString()}`,
          method: 'POST',
          body: formData,
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // Export Statement to Excel / CSV / Tally (from database by statement ID)
    exportStatement: builder.query<Blob, { id: string; format?: 'excel' | 'csv' | 'tally' | 'xml' | 'gst-json'; companyName?: string; bankLedger?: string; fp?: string }>({
      query: ({ id, format = 'excel', companyName, bankLedger, fp }) => {
        const params = new URLSearchParams();
        params.append('format', format);
        if (companyName) params.append('companyName', companyName);
        if (bankLedger) params.append('bankLedger', bankLedger);
        if (fp) params.append('fp', fp);
        return {
          url: `/${id}/export?${params.toString()}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
});

export const {
  useGetStatementsQuery,
  useGetStatementByIdQuery,
  useGetStatementReviewQuery,
  useUploadStatementIntakeMutation,
  useUpdateReviewRowMutation,
  useBulkApproveRowsMutation,
  useBulkRejectRowsMutation,
  useQueueBankStatementSyncMutation,
  useGetLedgerMappingsQuery,
  useSaveLedgerMappingMutation,
  useUploadBankStatementMutation,
  useDownloadBankStatementConvertMutation,
  useLazyExportStatementQuery,
} = bankStatementsApi;
