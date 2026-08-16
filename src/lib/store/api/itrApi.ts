import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ItrClientsListResponse,
  ItrClientResponse,
  AddItrClientInput,
  PrepareReturnInput,
  PrefillDataInput,
  ItrReturnResponse,
  RequestConsentResponse,
  ValidateReturnResponse,
  AcknowledgementResponse,
  ItrPrefillData,
} from '../../types/itr.types';

export const itrApi = createApi({
  reducerPath: 'itrApi',
  baseQuery: baseQueryWithReauth('/itr'),
  tagTypes: ['ItrClient', 'ItrReturn'],
  endpoints: (builder) => ({
    // --- CLIENTS ---
    getItrClients: builder.query<ItrClientsListResponse, void>({
      query: () => ({
        url: '/clients',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ItrClient' as const, id })),
              { type: 'ItrClient', id: 'LIST' },
            ]
          : [{ type: 'ItrClient', id: 'LIST' }],
    }),

    getItrClientById: builder.query<ItrClientResponse, string>({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: 'ItrClient', id }],
    }),

    addItrClient: builder.mutation<ItrClientResponse, AddItrClientInput>({
      query: (body) => ({
        url: '/clients',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ItrClient', id: 'LIST' }],
    }),

    // --- CONSENT & PREFILL ---
    requestConsent: builder.mutation<RequestConsentResponse, string>({
      query: (clientId) => ({
        url: `/${clientId}/consent`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, clientId) => [
        { type: 'ItrClient', id: clientId },
        { type: 'ItrClient', id: 'LIST' },
      ],
    }),

    prefillData: builder.mutation<{ success: boolean; data: ItrPrefillData; message?: string }, PrefillDataInput>({
      query: ({ clientId, assessmentYear }) => ({
        url: `/${clientId}/prefill`,
        method: 'POST',
        body: { assessmentYear },
      }),
    }),

    // --- RETURNS ---
    prepareReturn: builder.mutation<ItrReturnResponse, PrepareReturnInput>({
      query: ({ clientId, assessmentYear, financialYear, form }) => ({
        url: `/${clientId}/returns`,
        method: 'POST',
        body: { assessmentYear, financialYear, form },
      }),
      invalidatesTags: [{ type: 'ItrReturn', id: 'LIST' }],
    }),

    getReturnById: builder.query<ItrReturnResponse, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (result, error, id) => [{ type: 'ItrReturn', id }],
    }),

    validateReturn: builder.mutation<ValidateReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/validate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ItrReturn', id },
        { type: 'ItrReturn', id: 'LIST' },
      ],
    }),

    submitReturn: builder.mutation<ItrReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ItrReturn', id },
        { type: 'ItrReturn', id: 'LIST' },
      ],
    }),

    eVerifyReturn: builder.mutation<ItrReturnResponse, string>({
      query: (id) => ({
        url: `/returns/${id}/everify`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ItrReturn', id },
        { type: 'ItrReturn', id: 'LIST' },
      ],
    }),

    // --- ACKNOWLEDGEMENT ---
    getAcknowledgement: builder.query<AcknowledgementResponse, string>({
      query: (id) => `/returns/${id}/acknowledgement`,
    }),
  }),
});

export const {
  useGetItrClientsQuery,
  useGetItrClientByIdQuery,
  useAddItrClientMutation,
  useRequestConsentMutation,
  usePrefillDataMutation,
  usePrepareReturnMutation,
  useGetReturnByIdQuery,
  useValidateReturnMutation,
  useSubmitReturnMutation,
  useEVerifyReturnMutation,
  useGetAcknowledgementQuery,
  useLazyGetAcknowledgementQuery,
} = itrApi;
