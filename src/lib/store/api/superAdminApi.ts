import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../features/auth/authSlice';
import type {
  FirmOwner,
  ContactMessage,
  PaginatedResponse,
  SingleResponse,
  GetFirmOwnersParams,
  GetContactMessagesParams,
  ToggleFirmOwnerStatusRequest,
  UpdateContactStatusRequest,
  SuperAdminFirm,
  SuperAdminAnalytics,
  SuperAdminSubscription,
} from '../../types/superAdmin.types';
import type { AuthResponse, LoginRequest, User } from '../../types/auth.types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * A single dynamic base query that routes to the correct backend path.
 * Handles token refresh (401) by attempting the refresh endpoint.
 */
const superAdminBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const rawBaseQuery = fetchBaseQuery({ baseUrl: apiBaseUrl, credentials: 'include' });

  let result = await rawBaseQuery(args, api, extraOptions);

  const requestUrl = typeof args === 'string' ? args : args.url;
  const skipRefreshUrls = ['/auth/superadmin-login', '/auth/logout', '/auth/refresh'];
  const shouldSkipRefresh = skipRefreshUrls.some((u) => requestUrl.endsWith(u));

  if (result.error && result.error.status === 401 && !shouldSkipRefresh) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );
    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// ─── RTK Query slice for all Super Admin operations ────────────────────────────
export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: superAdminBaseQuery,
  tagTypes: ['FirmOwners', 'FirmOwner', 'ContactMessages', 'Firms', 'Analytics', 'Subscriptions'],
  endpoints: (builder) => ({

    // ── Super Admin Login ──────────────────────────────────────────────────────
    superAdminLogin: builder.mutation<AuthResponse<{ user: User }>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/superadmin-login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch {
          // Let the component handle login errors
        }
      },
    }),

    // ── Firm Owners (Firm Admins) ─────────────────────────────────────────────
    getFirmOwners: builder.query<PaginatedResponse<FirmOwner>, GetFirmOwnersParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.search) qs.set('search', params.search);
        if (params.page) qs.set('page', String(params.page));
        if (params.limit) qs.set('limit', String(params.limit));
        return `/auth/superadmin/firm-owners?${qs.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'FirmOwners' as const, id })),
              { type: 'FirmOwners', id: 'LIST' },
            ]
          : [{ type: 'FirmOwners', id: 'LIST' }],
    }),

    getFirmOwnerById: builder.query<SingleResponse<FirmOwner>, string>({
      query: (id) => `/auth/superadmin/firm-owners/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'FirmOwner', id }],
    }),

    toggleFirmOwnerStatus: builder.mutation<
      SingleResponse<{ id: string; isActive: boolean }>,
      ToggleFirmOwnerStatusRequest
    >({
      query: ({ id, isActive }) => ({
        url: `/auth/superadmin/firm-owners/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'FirmOwners', id: 'LIST' },
        { type: 'FirmOwner', id },
      ],
    }),

    // ── Contact / Support Tickets ─────────────────────────────────────────────
    getContactMessages: builder.query<PaginatedResponse<ContactMessage>, GetContactMessagesParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.search) qs.set('search', params.search);
        if (params.status) qs.set('status', params.status);
        if (params.page) qs.set('page', String(params.page));
        if (params.limit) qs.set('limit', String(params.limit));
        return `/contact-us?${qs.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ContactMessages' as const, id })),
              { type: 'ContactMessages', id: 'LIST' },
            ]
          : [{ type: 'ContactMessages', id: 'LIST' }],
    }),

    updateContactStatus: builder.mutation<
      SingleResponse<ContactMessage>,
      UpdateContactStatusRequest
    >({
      query: ({ id, status }) => ({
        url: `/contact-us/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ContactMessages', id: 'LIST' },
        { type: 'ContactMessages', id },
      ],
    }),

    // ── Super Admin Firms Management ──────────────────────────────────────────
    getAllFirms: builder.query<SingleResponse<SuperAdminFirm[]>, { search?: string; status?: string } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        if (params?.status) qs.set('status', params.status);
        return `/superadmin/firms?${qs.toString()}`;
      },
      providesTags: ['Firms'],
    }),

    getFirmDetail: builder.query<SingleResponse<SuperAdminFirm>, string>({
      query: (id) => `/superadmin/firms/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Firms', id }],
    }),

    suspendFirm: builder.mutation<SingleResponse<SuperAdminFirm>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/superadmin/firms/${id}/suspend`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Firms'],
    }),

    activateFirm: builder.mutation<SingleResponse<SuperAdminFirm>, string>({
      query: (id) => ({
        url: `/superadmin/firms/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Firms'],
    }),

    verifyFirm: builder.mutation<SingleResponse<SuperAdminFirm>, { id: string; status: 'VERIFIED' | 'REJECTED'; reason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/superadmin/firms/${id}/verify`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Firms'],
    }),

    deleteFirm: builder.mutation<SingleResponse<null>, string>({
      query: (id) => ({
        url: `/superadmin/firms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Firms'],
    }),

    // ── Super Admin Analytics ─────────────────────────────────────────────────
    getAnalyticsDashboard: builder.query<SingleResponse<SuperAdminAnalytics>, void>({
      query: () => '/superadmin/analytics/dashboard',
      providesTags: ['Analytics'],
    }),

    // ── Super Admin Subscriptions / Billing ───────────────────────────────────
    getAllSubscriptions: builder.query<SingleResponse<SuperAdminSubscription[]>, void>({
      query: () => '/superadmin/billing/subscriptions',
      providesTags: ['Subscriptions'],
    }),

    // ── Super Admin Global Users ──────────────────────────────────────────────
    getSuperAdminClients: builder.query<SingleResponse<{ data: any[]; total: number }>, { search?: string } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        return `/superadmin/users/clients?${qs.toString()}`;
      },
    }),

    getSuperAdminEmployees: builder.query<SingleResponse<{ data: any[]; total: number }>, { search?: string } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        return `/superadmin/users/employees?${qs.toString()}`;
      },
    }),
  }),
});

export const {
  useSuperAdminLoginMutation,
  useGetFirmOwnersQuery,
  useGetFirmOwnerByIdQuery,
  useToggleFirmOwnerStatusMutation,
  useGetContactMessagesQuery,
  useUpdateContactStatusMutation,
  useGetAllFirmsQuery,
  useGetFirmDetailQuery,
  useSuspendFirmMutation,
  useActivateFirmMutation,
  useVerifyFirmMutation,
  useDeleteFirmMutation,
  useGetAnalyticsDashboardQuery,
  useGetAllSubscriptionsQuery,
  useGetSuperAdminClientsQuery,
  useGetSuperAdminEmployeesQuery,
} = superAdminApi;

