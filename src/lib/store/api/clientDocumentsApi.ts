import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { ClientDocument, ClientDocumentsResponse } from '../../types/client.types';

interface SingleDocumentResponse {
  success: boolean;
  data: ClientDocument;
  message?: string;
}

interface DeleteDocumentResponse {
  success: boolean;
  data: null;
  message?: string;
}

export const clientDocumentsApi = createApi({
  reducerPath: 'clientDocumentsApi',
  baseQuery: baseQueryWithReauth('/client-documents'),
  tagTypes: ['ClientDocument'],
  endpoints: (builder) => ({
    getDocumentsByClientId: builder.query<ClientDocumentsResponse, string>({
      query: (clientId) => `/client/${clientId}`,
      providesTags: (result, _error, clientId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'ClientDocument' as const, id })),
              { type: 'ClientDocument', id: `LIST_${clientId}` },
            ]
          : [{ type: 'ClientDocument', id: `LIST_${clientId}` }],
    }),

    uploadDocument: builder.mutation<SingleDocumentResponse, FormData>({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
        formData: true,
      }),
      invalidatesTags: (_result, _error, formData) => {
        const clientId = formData.get('clientId') as string | null;
        return clientId
          ? [{ type: 'ClientDocument', id: `LIST_${clientId}` }]
          : [{ type: 'ClientDocument', id: 'LIST' }];
      },
    }),

    deleteDocument: builder.mutation<DeleteDocumentResponse, { id: string; clientId: string }>({
      query: ({ id }) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: 'ClientDocument', id: `LIST_${clientId}` },
      ],
    }),
  }),
});

export const {
  useGetDocumentsByClientIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = clientDocumentsApi;
