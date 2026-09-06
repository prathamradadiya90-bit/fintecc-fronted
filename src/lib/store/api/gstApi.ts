import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  GstProfile,
  PaginatedGstProfilesResponse,
  GstProfileResponse,
  GetGstProfilesParams,
  CreateGstProfileInput,
  UpdateGstProfileInput,
  VerifyGstinInput,
  VerifyGstinResponse,
  PaginatedGstReturnsResponse,
  GstReturnResponse,
  GstReturn,
  GstInvoice,
  ComplianceCalendarEvent,
  LinkedGstin,
  GstinDetails,
  WhitebooksOtpRequest,
  WhitebooksTokenRequest,
  WhitebooksGstr2bRequest,
} from '../../types/gst.types';

export const gstApi = createApi({
  reducerPath: 'gstApi',
  baseQuery: baseQueryWithReauth('/gst'),
  tagTypes: ['GstProfile', 'GstReturn'],
  endpoints: (builder) => ({
    // --- PROFILES ---
    getProfiles: builder.query<PaginatedGstProfilesResponse, GetGstProfilesParams | void>({
      query: (params) => ({
        url: '/profiles',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'GstProfile' as const, id })),
              { type: 'GstProfile', id: 'LIST' },
            ]
          : [{ type: 'GstProfile', id: 'LIST' }],
    }),
    
    getProfileById: builder.query<GstProfileResponse, string>({
      query: (id) => `/profiles/${id}`,
      providesTags: (result, error, id) => [{ type: 'GstProfile', id }],
    }),
    
    createProfile: builder.mutation<GstProfileResponse, CreateGstProfileInput>({
      query: (body) => ({
        url: '/profiles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'GstProfile', id: 'LIST' }],
    }),
    
    updateProfile: builder.mutation<GstProfileResponse, { id: string; data: UpdateGstProfileInput }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'GstProfile', id },
        { type: 'GstProfile', id: 'LIST' },
      ],
    }),
    
    verifyGstin: builder.mutation<VerifyGstinResponse, { id: string; gstin: string }>({
      query: ({ id, gstin }) => ({
        url: `/profiles/${id}/verify-gstin`,
        method: 'POST',
        body: { gstin },
      }),
    }),
    
    // --- RETURNS ---
    getReturns: builder.query<PaginatedGstReturnsResponse, { page?: number; limit?: number; status?: string; period?: string; clientId?: string } | void>({
      query: (params) => ({
        url: '/returns',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'GstReturn' as const, id })),
              { type: 'GstReturn', id: 'LIST' },
            ]
          : [{ type: 'GstReturn', id: 'LIST' }],
    }),

    getReturnById: builder.query<GstReturnResponse, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (result, error, id) => [{ type: 'GstReturn', id }],
    }),

    createReturn: builder.mutation<GstReturnResponse, { gstProfileId: string; returnType: 'GSTR1' | 'GSTR3B'; period: string }>({
      query: (body) => ({
        url: '/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'GstReturn', id: 'LIST' }],
    }),

    computeReturn: builder.mutation<GstReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/compute`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'GstReturn', id }, { type: 'GstReturn', id: 'LIST' }],
    }),

    reconcileItc: builder.mutation<{ success: boolean; message: string; data?: any }, string>({
      query: (id) => ({
        url: `/returns/${id}/reconcile-itc`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'GstReturn', id }],
    }),

    submitForApproval: builder.mutation<GstReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/submit-for-approval`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'GstReturn', id }, { type: 'GstReturn', id: 'LIST' }],
    }),

    clientApprove: builder.mutation<GstReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/client-approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'GstReturn', id }, { type: 'GstReturn', id: 'LIST' }],
    }),

    markFiled: builder.mutation<GstReturnResponse, { id: string; arn?: string }>({
      query: ({ id, arn }) => ({
        url: `/returns/${id}/mark-filed`,
        method: 'POST',
        body: { arn },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'GstReturn', id }, { type: 'GstReturn', id: 'LIST' }],
    }),

    fileReturn: builder.mutation<GstReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/file`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'GstReturn', id }, { type: 'GstReturn', id: 'LIST' }],
    }),

    // --- GSP ABSTRACTED ACTIONS ---
    prepareGstr1: builder.mutation<{ success: boolean; data: { referenceId: string }; message?: string }, { clientId: string; period: string; financialYear?: string }>({
      query: ({ clientId, period, financialYear }) => ({
        url: `/${clientId}/gstr1/prepare`,
        method: 'POST',
        body: { period, financialYear },
      }),
    }),

    validateGstr1: builder.mutation<{ success: boolean; data: { isValid: boolean; message: string }; message?: string }, { clientId: string; period: string }>({
      query: ({ clientId, period }) => ({
        url: `/${clientId}/gstr1/validate`,
        method: 'POST',
        body: { period },
      }),
    }),

    fileGstr1: builder.mutation<{ success: boolean; data: { arn: string; filedAt: string }; message?: string }, { clientId: string; returnId: string }>({
      query: ({ clientId, returnId }) => ({
        url: `/${clientId}/gstr1/file`,
        method: 'POST',
        body: { returnId },
      }),
      invalidatesTags: (result, error, { returnId }) => [{ type: 'GstReturn', id: returnId }, { type: 'GstReturn', id: 'LIST' }],
    }),

    prepareGstr3b: builder.mutation<{ success: boolean; data: { referenceId: string }; message?: string }, { clientId: string; period: string; financialYear?: string }>({
      query: ({ clientId, period, financialYear }) => ({
        url: `/${clientId}/gstr3b/prepare`,
        method: 'POST',
        body: { period, financialYear },
      }),
    }),

    validateGstr3b: builder.mutation<{ success: boolean; data: { isValid: boolean; message: string }; message?: string }, { clientId: string; period: string }>({
      query: ({ clientId, period }) => ({
        url: `/${clientId}/gstr3b/validate`,
        method: 'POST',
        body: { period },
      }),
    }),

    fileGstr3b: builder.mutation<{ success: boolean; data: { arn: string; filedAt: string }; message?: string }, { clientId: string; returnId: string }>({
      query: ({ clientId, returnId }) => ({
        url: `/${clientId}/gstr3b/file`,
        method: 'POST',
        body: { returnId },
      }),
      invalidatesTags: (result, error, { returnId }) => [{ type: 'GstReturn', id: returnId }, { type: 'GstReturn', id: 'LIST' }],
    }),

    reconcile2B: builder.mutation<{
      success: boolean;
      message: string;
      data: {
        summary: {
          totalTallyInvoices: number;
          totalGstr2bInvoices: number;
          matchedCount: number;
          missingIn2BCount: number;
          missingInTallyCount: number;
        };
        results: {
          matched: any[];
          missingIn2B: any[];
          missingInTally: any[];
        };
      };
    }, FormData>({
      query: (formData) => ({
        url: '/reconcile-2b',
        method: 'POST',
        body: formData,
      }),
    }),

    // --- COMPLIANCE CALENDAR ---
    getComplianceCalendar: builder.query<{ success: boolean; data: ComplianceCalendarEvent[] }, void>({
      query: () => '/compliance-calendar',
    }),

    // --- CLIENT GSTIN MANAGEMENT ---
    linkGstin: builder.mutation<{ success: boolean; data: LinkedGstin; message?: string }, { clientId: string; gstin: string }>({
      query: ({ clientId, gstin }) => ({
        url: `/clients/${clientId}/link`,
        method: 'POST',
        body: { gstin },
      }),
      invalidatesTags: [{ type: 'GstProfile', id: 'LIST' }],
    }),

    getLinkedGstins: builder.query<{ success: boolean; data: LinkedGstin[] }, string>({
      query: (clientId) => `/clients/${clientId}`,
    }),

    getGstinDetails: builder.query<{ success: boolean; data: GstinDetails }, { clientId: string; gstin: string }>({
      query: ({ clientId, gstin }) => `/${clientId}/gstin/${gstin}`,
    }),

    // --- GST INVOICES (GSP LAYER) ---
    addGstInvoice: builder.mutation<{ success: boolean; data: GstInvoice; message?: string }, { clientId: string; invoice: Partial<GstInvoice> }>({
      query: ({ clientId, invoice }) => ({
        url: `/${clientId}/invoices`,
        method: 'POST',
        body: invoice,
      }),
    }),

    getGstInvoices: builder.query<{ success: boolean; data: GstInvoice[] }, string>({
      query: (clientId) => `/${clientId}/invoices`,
    }),

    // --- RETURNS GSP LAYER & IMPORT ---
    importInvoices: builder.mutation<{ success: boolean; data: any; message?: string }, { returnId: string; invoiceIds: string[] }>({
      query: ({ returnId, invoiceIds }) => ({
        url: `/returns/${returnId}/import-invoices`,
        method: 'POST',
        body: { invoiceIds },
      }),
      invalidatesTags: (result, error, { returnId }) => [{ type: 'GstReturn', id: returnId }],
    }),

    getGspReturns: builder.query<{ success: boolean; data: any[] }, string>({
      query: (clientId) => `/${clientId}/returns-gsp`,
    }),

    getReturnStatus: builder.query<{ success: boolean; data: any }, string>({
      query: (returnId) => `/returns/${returnId}/status`,
    }),

    // --- WHITEBOOKS GST INTEGRATION ---
    whitebooksRequestOtp: builder.mutation<{ success: boolean; data: any; message?: string }, WhitebooksOtpRequest>({
      query: (body) => ({
        url: '/whitebooks/otp',
        method: 'POST',
        body,
      }),
    }),

    whitebooksGetToken: builder.mutation<{ success: boolean; data: any; message?: string }, WhitebooksTokenRequest>({
      query: (body) => ({
        url: '/whitebooks/token',
        method: 'POST',
        body,
      }),
    }),

    whitebooksGetGstr2b: builder.mutation<{ success: boolean; data: any; message?: string }, WhitebooksGstr2bRequest>({
      query: (body) => ({
        url: '/whitebooks/gstr2b',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetProfilesQuery,
  useGetProfileByIdQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useVerifyGstinMutation,
  useGetReturnsQuery,
  useGetReturnByIdQuery,
  useCreateReturnMutation,
  useComputeReturnMutation,
  useReconcileItcMutation,
  useSubmitForApprovalMutation,
  useClientApproveMutation,
  useMarkFiledMutation,
  useFileReturnMutation,
  usePrepareGstr1Mutation,
  useValidateGstr1Mutation,
  useFileGstr1Mutation,
  usePrepareGstr3bMutation,
  useValidateGstr3bMutation,
  useFileGstr3bMutation,
  useReconcile2BMutation,
  useGetComplianceCalendarQuery,
  useLinkGstinMutation,
  useGetLinkedGstinsQuery,
  useGetGstinDetailsQuery,
  useAddGstInvoiceMutation,
  useGetGstInvoicesQuery,
  useImportInvoicesMutation,
  useGetGspReturnsQuery,
  useGetReturnStatusQuery,
  useWhitebooksRequestOtpMutation,
  useWhitebooksGetTokenMutation,
  useWhitebooksGetGstr2bMutation,
} = gstApi;
