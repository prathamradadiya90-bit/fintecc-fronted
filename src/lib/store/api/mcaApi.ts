import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  PaginatedMcaCompaniesResponse,
  McaCompanyResponse,
  McaDirectorsResponse,
  CreateMcaCompanyRequest,
  UpdateMcaCompanyRequest,
  AddMcaDirectorRequest,
  McaDirector,
} from '../../types/mca.types';

export const mcaApi = createApi({
  reducerPath: 'mcaApi',
  baseQuery: baseQueryWithReauth('/mca'),
  tagTypes: ['McaCompany', 'McaDirector'],
  endpoints: (builder) => ({
    getCompanies: builder.query<
      PaginatedMcaCompaniesResponse,
      { page?: number; limit?: number; clientId?: string } | void
    >({
      query: (params) => ({
        url: '/',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'McaCompany' as const, id })),
              { type: 'McaCompany', id: 'LIST' },
            ]
          : [{ type: 'McaCompany', id: 'LIST' }],
    }),

    getCompanyById: builder.query<McaCompanyResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'McaCompany', id }],
    }),

    createCompany: builder.mutation<McaCompanyResponse, CreateMcaCompanyRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'McaCompany', id: 'LIST' }],
    }),

    updateCompany: builder.mutation<McaCompanyResponse, UpdateMcaCompanyRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'McaCompany', id },
        { type: 'McaCompany', id: 'LIST' },
      ],
    }),

    getDirectors: builder.query<McaDirectorsResponse, string>({
      query: (companyId) => `/${companyId}/directors`,
      providesTags: (_result, _error, companyId) => [
        { type: 'McaDirector', id: companyId },
      ],
    }),

    addDirector: builder.mutation<
      { success: boolean; data: McaDirector; message?: string },
      { companyId: string; data: AddMcaDirectorRequest }
    >({
      query: ({ companyId, data }) => ({
        url: `/${companyId}/directors`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: 'McaDirector', id: companyId },
        { type: 'McaCompany', id: companyId },
      ],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetDirectorsQuery,
  useAddDirectorMutation,
} = mcaApi;
