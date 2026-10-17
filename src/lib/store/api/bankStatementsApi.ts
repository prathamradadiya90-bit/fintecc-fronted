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
  PostToLedgerPayload,
  PostToLedgerResponse,
} from '../../types/bankStatement.types';
import type {
  TemplateProposal,
  GetProposalsParams,
  GetProposalsResponse,
  ProposalImageResponse,
  TestProposalReport,
  BankTemplate,
  RejectProposalPayload,
  MergeVariantPayload,
  EditProposalPayload,
} from '../../types/templateProposal.types';

export const bankStatementsApi = createApi({
  reducerPath: 'bankStatementsApi',
  baseQuery: baseQueryWithReauth('/bank-statements'),
  tagTypes: ['BankStatement', 'BankStatementReview', 'LedgerMapping', 'TemplateProposal', 'BankTemplate'],
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
      query: (id) => ({
        url: `/${id}`,
        params: { _t: Date.now() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }),
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

    // Confirm and post approved rows to General Ledger (Double-Entry balancing)
    confirmAndPostToLedger: builder.mutation<
      PostToLedgerResponse,
      PostToLedgerPayload
    >({
      query: ({ statementId, rowIds }) => ({
        url: `/${statementId}/confirm-and-post`,
        method: 'POST',
        body: rowIds ? { rowIds } : {},
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

    // --- Bank Statement Template Proposals & DB Templates (Task 21/22) ---

    // List template proposals with optional status/bankCode filter, search, sorting and pagination
    getProposals: builder.query<GetProposalsResponse, GetProposalsParams | void>({
      query: (params) => ({
        url: '/templates/proposals',
        params: params ? {
          status: params.status === 'ALL' ? undefined : params.status,
          bankCode: params.bankCode,
          isProvisional: params.isProvisional,
          limit: params.limit,
          page: params.page,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TemplateProposal' as const, id })),
              { type: 'TemplateProposal', id: 'LIST' },
            ]
          : [{ type: 'TemplateProposal', id: 'LIST' }],
    }),

    // Get single template proposal details by ID
    getProposalById: builder.query<{ success: boolean; data: TemplateProposal }, string>({
      query: (id) => `/templates/proposals/${id}`,
      providesTags: (result, error, id) => [{ type: 'TemplateProposal', id }],
    }),

    // Get rendered sample page preview image
    getProposalImage: builder.query<ProposalImageResponse, string>({
      query: (id) => `/templates/proposals/${id}/image`,
    }),

    // Edit proposal layout, bank metadata, or column definitions
    editProposal: builder.mutation<{ success: boolean; data: TemplateProposal }, { id: string; data: EditProposalPayload }>({
      query: ({ id, data }) => ({
        url: `/templates/proposals/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TemplateProposal', id },
        { type: 'TemplateProposal', id: 'LIST' },
      ],
    }),

    // Dry-run test proposed template against sample PDF file or sample text
    testProposal: builder.mutation<
      { success: boolean; data: TestProposalReport },
      { id: string; body: FormData | { statementId?: string; sampleText?: string; templateOverrides?: any } }
    >({
      query: ({ id, body }) => ({
        url: `/templates/proposals/${id}/test`,
        method: 'POST',
        body,
      }),
    }),

    // Approve proposal and promote into active bank_templates
    approveProposal: builder.mutation<{ success: boolean; data: any }, { id: string; overrides?: any }>({
      query: ({ id, overrides }) => ({
        url: `/templates/proposals/${id}/approve`,
        method: 'POST',
        body: overrides ? { overrides } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TemplateProposal', id },
        { type: 'TemplateProposal', id: 'LIST' },
        { type: 'BankTemplate', id: 'LIST' },
      ],
    }),

    // Reject proposal with mandatory reason
    rejectProposal: builder.mutation<{ success: boolean; data: TemplateProposal }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/templates/proposals/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TemplateProposal', id },
        { type: 'TemplateProposal', id: 'LIST' },
      ],
    }),

    // Reopen proposal back to PENDING
    reopenProposal: builder.mutation<{ success: boolean; data: TemplateProposal }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/templates/proposals/${id}/reopen`,
        method: 'POST',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TemplateProposal', id },
        { type: 'TemplateProposal', id: 'LIST' },
      ],
    }),

    // Merge proposal as a variant under an existing active template
    mergeProposalAsVariant: builder.mutation<{ success: boolean; data: any }, { id: string; payload: MergeVariantPayload }>({
      query: ({ id, payload }) => ({
        url: `/templates/proposals/${id}/merge`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TemplateProposal', id },
        { type: 'TemplateProposal', id: 'LIST' },
        { type: 'BankTemplate', id: 'LIST' },
      ],
    }),

    // List active official templates (for merge target dropdown)
    getActiveTemplates: builder.query<{ success: boolean; data: BankTemplate[] }, { bankCode?: string } | void>({
      query: (params) => ({
        url: '/templates',
        params: params?.bankCode ? { bankCode: params.bankCode } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'BankTemplate' as const, id })),
              { type: 'BankTemplate', id: 'LIST' },
            ]
          : [{ type: 'BankTemplate', id: 'LIST' }],
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
  useConfirmAndPostToLedgerMutation,
  useQueueBankStatementSyncMutation,
  useGetLedgerMappingsQuery,
  useSaveLedgerMappingMutation,
  useUploadBankStatementMutation,
  useDownloadBankStatementConvertMutation,
  useLazyExportStatementQuery,
  // Template Proposals hooks (Task 21/22)
  useGetProposalsQuery,
  useGetProposalByIdQuery,
  useGetProposalImageQuery,
  useEditProposalMutation,
  useTestProposalMutation,
  useApproveProposalMutation,
  useRejectProposalMutation,
  useReopenProposalMutation,
  useMergeProposalAsVariantMutation,
  useGetActiveTemplatesQuery,
} = bankStatementsApi;
