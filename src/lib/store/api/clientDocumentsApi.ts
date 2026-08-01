import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQueryWithReauth } from './baseQuery';
import type { ClientDocument, ClientDocumentsResponse } from '../../types/client.types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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

    downloadDocument: builder.mutation<null, { id: string; filename: string }>({
      // Use a custom queryFn: the backend returns a binary stream (res.download),
      // not JSON, so RTK Query's default fetch would fail to parse it.
      queryFn: async ({ id, filename }) => {
        try {
          const response = await fetch(`${apiBaseUrl}/client-documents/${id}/download`, {
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            // FetchBaseQueryError HTTP shape requires `{ status: number; data: unknown }`
            const data = await response.text().catch(() => 'Download failed');
            return { error: { status: response.status, data } satisfies FetchBaseQueryError };
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = filename;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          window.URL.revokeObjectURL(url);

          return { data: null };
        } catch (error) {
          // FetchBaseQueryError FETCH_ERROR shape
          return { error: { status: 'FETCH_ERROR', error: String(error) } satisfies FetchBaseQueryError };
        }
      },
    }),
  }),
});

export const {
  useGetDocumentsByClientIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useDownloadDocumentMutation,
} = clientDocumentsApi;
