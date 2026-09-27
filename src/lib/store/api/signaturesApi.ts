import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  SignaturesListResponse,
  SignatureResponse,
  CreateSignatureRequest,
  UpdateSignatureStatusRequest,
} from '../../types/signature.types';

export const signaturesApi = createApi({
  reducerPath: 'signaturesApi',
  baseQuery: baseQueryWithReauth('/signatures'),
  tagTypes: ['Signature'],
  endpoints: (builder) => ({
    getSignatures: builder.query<SignaturesListResponse, void>({
      query: () => '/',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Signature' as const, id })),
              { type: 'Signature', id: 'LIST' },
            ]
          : [{ type: 'Signature', id: 'LIST' }],
    }),

    createSignature: builder.mutation<SignatureResponse, CreateSignatureRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Signature', id: 'LIST' }],
    }),

    updateSignatureStatus: builder.mutation<SignatureResponse, UpdateSignatureStatusRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Signature', id },
        { type: 'Signature', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSignaturesQuery,
  useCreateSignatureMutation,
  useUpdateSignatureStatusMutation,
} = signaturesApi;
