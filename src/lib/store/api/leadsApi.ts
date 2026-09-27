import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  LeadsListResponse,
  LeadResponse,
  CreateLeadRequest,
  UpdateLeadStatusRequest,
} from '../../types/lead.types';

export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  baseQuery: baseQueryWithReauth('/leads'),
  tagTypes: ['Lead'],
  endpoints: (builder) => ({
    getLeads: builder.query<LeadsListResponse, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Lead' as const, id })),
              { type: 'Lead', id: 'LIST' },
            ]
          : [{ type: 'Lead', id: 'LIST' }],
    }),

    createLead: builder.mutation<LeadResponse, CreateLeadRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Lead', id: 'LIST' }],
    }),

    updateLeadStatus: builder.mutation<LeadResponse, UpdateLeadStatusRequest>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        { type: 'Lead', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
} = leadsApi;
